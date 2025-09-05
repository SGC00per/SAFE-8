// Expert Consultation Booking Service

export interface ConsultationBooking {
  id?: number
  leadId: number
  assessmentId?: number
  consultationType: 'STRATEGY' | 'TECHNICAL' | 'IMPLEMENTATION'
  preferredDate?: string
  preferredTime?: string
  timezone?: string
  consultationDuration?: number
  topicFocus?: string[]
  urgencyLevel?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  companyBackground?: string
  specificChallenges?: string
  meetingPreference?: 'VIRTUAL' | 'IN_PERSON' | 'PHONE'
  status?: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
}

export interface ConsultationAvailability {
  id: number
  consultantName: string
  consultantEmail: string
  specialization: string
  availableDate: string
  startTime: string
  endTime: string
  timezone: string
  duration: number
  isAvailable: boolean
}

export class ConsultationService {
  constructor(private db: D1Database) {}

  async createBooking(booking: ConsultationBooking): Promise<number | null> {
    try {
      const { success, meta } = await this.db.prepare(`
        INSERT INTO consultation_bookings (
          lead_id, assessment_id, consultation_type, preferred_date, preferred_time,
          timezone, consultation_duration, topic_focus, urgency_level,
          company_background, specific_challenges, meeting_preference
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        booking.leadId,
        booking.assessmentId || null,
        booking.consultationType,
        booking.preferredDate || null,
        booking.preferredTime || null,
        booking.timezone || 'UTC',
        booking.consultationDuration || 60,
        booking.topicFocus ? JSON.stringify(booking.topicFocus) : null,
        booking.urgencyLevel || 'MEDIUM',
        booking.companyBackground || null,
        booking.specificChallenges || null,
        booking.meetingPreference || 'VIRTUAL'
      ).run()

      return success ? meta.last_row_id as number : null
    } catch (error) {
      console.error('Error creating consultation booking:', error)
      return null
    }
  }

  async getAvailableSlots(
    specialization?: string, 
    date?: string
  ): Promise<ConsultationAvailability[]> {
    try {
      let query = `
        SELECT * FROM consultation_availability 
        WHERE is_available = TRUE AND current_bookings < max_bookings
      `
      const bindings: any[] = []

      if (date) {
        query += ` AND available_date >= ?`
        bindings.push(date)
      } else {
        // Default to next 30 days
        const futureDate = new Date()
        futureDate.setDate(futureDate.getDate() + 30)
        query += ` AND available_date >= date('now') AND available_date <= ?`
        bindings.push(futureDate.toISOString().split('T')[0])
      }

      if (specialization) {
        query += ` AND specialization = ?`
        bindings.push(specialization)
      }

      query += ` ORDER BY available_date, start_time`

      const { results } = await this.db.prepare(query).bind(...bindings).all()
      return results as ConsultationAvailability[]
    } catch (error) {
      console.error('Error fetching available slots:', error)
      return []
    }
  }

  async confirmBooking(bookingId: number, calendarEventId?: string): Promise<boolean> {
    try {
      const { success } = await this.db.prepare(`
        UPDATE consultation_bookings 
        SET status = 'CONFIRMED', 
            booking_confirmed_at = CURRENT_TIMESTAMP,
            calendar_event_id = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(calendarEventId || null, bookingId).run()

      return success
    } catch (error) {
      console.error('Error confirming booking:', error)
      return false
    }
  }

  async getBookingsByLead(leadId: number): Promise<ConsultationBooking[]> {
    try {
      const { results } = await this.db.prepare(`
        SELECT cb.*, l.company_name, l.contact_name, l.email
        FROM consultation_bookings cb
        JOIN leads l ON cb.lead_id = l.id
        WHERE cb.lead_id = ?
        ORDER BY cb.created_at DESC
      `).bind(leadId).all()

      return results.map((row: any) => ({
        ...row,
        topicFocus: row.topic_focus ? JSON.parse(row.topic_focus) : []
      })) as ConsultationBooking[]
    } catch (error) {
      console.error('Error fetching bookings for lead:', error)
      return []
    }
  }

  async getPendingBookings(): Promise<ConsultationBooking[]> {
    try {
      const { results } = await this.db.prepare(`
        SELECT cb.*, l.company_name, l.contact_name, l.email,
               a.overall_score, a.assessment_type
        FROM consultation_bookings cb
        JOIN leads l ON cb.lead_id = l.id
        LEFT JOIN assessments a ON cb.assessment_id = a.id
        WHERE cb.status = 'PENDING'
        ORDER BY cb.urgency_level DESC, cb.created_at ASC
      `).all()

      return results.map((row: any) => ({
        ...row,
        topicFocus: row.topic_focus ? JSON.parse(row.topic_focus) : []
      })) as ConsultationBooking[]
    } catch (error) {
      console.error('Error fetching pending bookings:', error)
      return []
    }
  }

  async updateBookingNotes(bookingId: number, notes: string, followUpActions?: string[]): Promise<boolean> {
    try {
      const { success } = await this.db.prepare(`
        UPDATE consultation_bookings 
        SET consultant_notes = ?,
            follow_up_actions = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        notes,
        followUpActions ? JSON.stringify(followUpActions) : null,
        bookingId
      ).run()

      return success
    } catch (error) {
      console.error('Error updating booking notes:', error)
      return false
    }
  }

  // Calendar integration helpers
  generateCalendarEvent(booking: ConsultationBooking, lead: any) {
    const meetingTitle = `AI Readiness Consultation - ${lead.company_name}`
    const description = `
Expert Consultation Session

Company: ${lead.company_name}
Contact: ${lead.contact_name} (${lead.email})
Type: ${booking.consultationType}
Duration: ${booking.consultationDuration} minutes

Focus Areas: ${booking.topicFocus?.join(', ') || 'General AI Readiness'}

Company Background:
${booking.companyBackground || 'Not provided'}

Specific Challenges:
${booking.specificChallenges || 'To be discussed'}

Meeting Link: Will be provided upon confirmation
    `.trim()

    return {
      summary: meetingTitle,
      description,
      start: booking.preferredDate && booking.preferredTime ? 
        new Date(`${booking.preferredDate}T${booking.preferredTime}:00`) : null,
      duration: booking.consultationDuration || 60,
      attendees: [lead.email],
      timezone: booking.timezone || 'UTC'
    }
  }

  // Business logic for booking recommendations
  suggestConsultationType(assessmentScore: number, dimensionScores: Record<string, number>): {
    recommended: string,
    reason: string,
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  } {
    const avgScore = assessmentScore
    const criticalDimensions = Object.entries(dimensionScores).filter(([_, score]) => score < 60)

    if (avgScore < 40) {
      return {
        recommended: 'STRATEGY',
        reason: 'Low overall readiness requires strategic foundation planning',
        urgency: 'URGENT'
      }
    } else if (avgScore < 60) {
      if (criticalDimensions.some(([dim]) => dim.includes('Architecture') || dim.includes('Data'))) {
        return {
          recommended: 'TECHNICAL',
          reason: 'Technical infrastructure gaps identified',
          urgency: 'HIGH'
        }
      } else {
        return {
          recommended: 'STRATEGY',
          reason: 'Multiple readiness areas need strategic coordination',
          urgency: 'HIGH'
        }
      }
    } else if (avgScore < 80) {
      return {
        recommended: 'IMPLEMENTATION',
        reason: 'Good foundation, ready for implementation guidance',
        urgency: 'MEDIUM'
      }
    } else {
      return {
        recommended: 'STRATEGY',
        reason: 'Advanced optimization and innovation opportunities',
        urgency: 'LOW'
      }
    }
  }
}