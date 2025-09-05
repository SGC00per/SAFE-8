// Continuous Monitoring and Auto-Prompting Service

export interface MonitoringSchedule {
  id?: number
  leadId: number
  assessmentId: number
  monitoringType: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL'
  monitoringFrequency: number // days
  nextAssessmentDue: string
  notificationSchedule?: string[]
  autoPromptEnabled: boolean
  lastReminderSent?: string
  remindersSent: number
  assessmentCompleted: boolean
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED'
}

export interface MonitoringNotification {
  id?: number
  monitoringScheduleId: number
  notificationType: 'ASSESSMENT_DUE' | 'REMINDER' | 'OVERDUE'
  daysBeforeDue: number
  recipientEmail: string
  subject: string
  messageContent: string
  status: 'PENDING' | 'SENT' | 'FAILED'
}

export class MonitoringService {
  constructor(private db: D1Database) {}

  async createMonitoringSchedule(
    leadId: number,
    assessmentId: number,
    monitoringType: 'QUARTERLY' | 'SEMI_ANNUAL' | 'ANNUAL' = 'QUARTERLY'
  ): Promise<number | null> {
    try {
      const frequencyDays = {
        'QUARTERLY': 90,
        'SEMI_ANNUAL': 180,
        'ANNUAL': 365
      }[monitoringType]

      const nextDue = new Date()
      nextDue.setDate(nextDue.getDate() + frequencyDays)

      // Default notification schedule: 30 days, 14 days, 7 days, 1 day before due
      const notificationSchedule = [30, 14, 7, 1]

      const { success, meta } = await this.db.prepare(`
        INSERT INTO monitoring_schedules (
          lead_id, assessment_id, monitoring_type, monitoring_frequency,
          next_assessment_due, notification_schedule, auto_prompt_enabled
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadId,
        assessmentId,
        monitoringType,
        frequencyDays,
        nextDue.toISOString().split('T')[0],
        JSON.stringify(notificationSchedule),
        true
      ).run()

      if (success) {
        const scheduleId = meta.last_row_id as number
        // Create notification reminders
        await this.createNotificationReminders(scheduleId, nextDue, notificationSchedule)
        return scheduleId
      }

      return null
    } catch (error) {
      console.error('Error creating monitoring schedule:', error)
      return null
    }
  }

  private async createNotificationReminders(
    scheduleId: number,
    dueDate: Date,
    reminderDays: number[]
  ): Promise<void> {
    try {
      // Get lead info for notifications
      const leadInfo = await this.db.prepare(`
        SELECT l.email, l.company_name, l.contact_name, ms.monitoring_type
        FROM monitoring_schedules ms
        JOIN leads l ON ms.lead_id = l.id
        WHERE ms.id = ?
      `).bind(scheduleId).first() as any

      if (!leadInfo) return

      for (const days of reminderDays) {
        const reminderDate = new Date(dueDate)
        reminderDate.setDate(reminderDate.getDate() - days)

        let notificationType: 'ASSESSMENT_DUE' | 'REMINDER' | 'OVERDUE'
        let subject: string
        let messageContent: string

        if (days === 1) {
          notificationType = 'ASSESSMENT_DUE'
          subject = `AI Readiness Re-Assessment Due Tomorrow - ${leadInfo.company_name}`
          messageContent = this.generateAssessmentDueMessage(leadInfo, dueDate)
        } else if (days <= 7) {
          notificationType = 'REMINDER'
          subject = `AI Readiness Re-Assessment Due in ${days} Days - ${leadInfo.company_name}`
          messageContent = this.generateReminderMessage(leadInfo, dueDate, days)
        } else {
          notificationType = 'REMINDER'
          subject = `AI Readiness Check-in: ${days} Days Until Next Assessment`
          messageContent = this.generateAdvanceReminderMessage(leadInfo, dueDate, days)
        }

        await this.db.prepare(`
          INSERT INTO monitoring_notifications (
            monitoring_schedule_id, notification_type, days_before_due,
            recipient_email, subject, message_content
          ) VALUES (?, ?, ?, ?, ?, ?)
        `).bind(
          scheduleId,
          notificationType,
          days,
          leadInfo.email,
          subject,
          messageContent
        ).run()
      }
    } catch (error) {
      console.error('Error creating notification reminders:', error)
    }
  }

  async getActiveSchedules(): Promise<MonitoringSchedule[]> {
    try {
      const { results } = await this.db.prepare(`
        SELECT ms.*, l.company_name, l.contact_name, l.email
        FROM monitoring_schedules ms
        JOIN leads l ON ms.lead_id = l.id
        WHERE ms.status = 'ACTIVE' AND ms.auto_prompt_enabled = TRUE
        ORDER BY ms.next_assessment_due ASC
      `).all()

      return results.map((row: any) => ({
        ...row,
        notificationSchedule: row.notification_schedule ? JSON.parse(row.notification_schedule) : []
      })) as MonitoringSchedule[]
    } catch (error) {
      console.error('Error fetching active schedules:', error)
      return []
    }
  }

  async getDueAssessments(daysAhead: number = 30): Promise<MonitoringSchedule[]> {
    try {
      const checkDate = new Date()
      checkDate.setDate(checkDate.getDate() + daysAhead)

      const { results } = await this.db.prepare(`
        SELECT ms.*, l.company_name, l.contact_name, l.email, l.industry,
               a.overall_score as last_score, a.assessment_type
        FROM monitoring_schedules ms
        JOIN leads l ON ms.lead_id = l.id
        JOIN assessments a ON ms.assessment_id = a.id
        WHERE ms.status = 'ACTIVE' 
          AND ms.next_assessment_due <= ?
          AND ms.assessment_completed = FALSE
        ORDER BY ms.next_assessment_due ASC
      `).bind(checkDate.toISOString().split('T')[0]).all()

      return results.map((row: any) => ({
        ...row,
        notificationSchedule: row.notification_schedule ? JSON.parse(row.notification_schedule) : []
      })) as MonitoringSchedule[]
    } catch (error) {
      console.error('Error fetching due assessments:', error)
      return []
    }
  }

  async getPendingNotifications(): Promise<MonitoringNotification[]> {
    try {
      const today = new Date().toISOString().split('T')[0]

      const { results } = await this.db.prepare(`
        SELECT mn.*, ms.next_assessment_due, l.company_name
        FROM monitoring_notifications mn
        JOIN monitoring_schedules ms ON mn.monitoring_schedule_id = ms.id
        JOIN leads l ON ms.lead_id = l.id
        WHERE mn.status = 'PENDING'
          AND date('now', '+' || mn.days_before_due || ' days') >= ms.next_assessment_due
        ORDER BY mn.days_before_due DESC
      `).all()

      return results as MonitoringNotification[]
    } catch (error) {
      console.error('Error fetching pending notifications:', error)
      return []
    }
  }

  async markNotificationSent(notificationId: number): Promise<boolean> {
    try {
      const { success } = await this.db.prepare(`
        UPDATE monitoring_notifications 
        SET status = 'SENT', sent_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(notificationId).run()

      return success
    } catch (error) {
      console.error('Error marking notification as sent:', error)
      return false
    }
  }

  async completeAssessmentCycle(scheduleId: number, newAssessmentId: number): Promise<boolean> {
    try {
      // Mark current cycle as completed and set up next cycle
      const schedule = await this.db.prepare(`
        SELECT * FROM monitoring_schedules WHERE id = ?
      `).bind(scheduleId).first() as any

      if (!schedule) return false

      const nextDue = new Date(schedule.next_assessment_due)
      nextDue.setDate(nextDue.getDate() + schedule.monitoring_frequency)

      const { success } = await this.db.prepare(`
        UPDATE monitoring_schedules 
        SET assessment_completed = TRUE,
            follow_up_assessment_id = ?,
            next_assessment_due = ?,
            assessment_completed = FALSE,
            reminders_sent = 0,
            last_reminder_sent = NULL,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(
        newAssessmentId,
        nextDue.toISOString().split('T')[0],
        scheduleId
      ).run()

      if (success) {
        // Create new notification reminders for next cycle
        const notificationSchedule = JSON.parse(schedule.notification_schedule || '[30, 14, 7, 1]')
        await this.createNotificationReminders(scheduleId, nextDue, notificationSchedule)
      }

      return success
    } catch (error) {
      console.error('Error completing assessment cycle:', error)
      return false
    }
  }

  async pauseMonitoring(scheduleId: number): Promise<boolean> {
    try {
      const { success } = await this.db.prepare(`
        UPDATE monitoring_schedules 
        SET status = 'PAUSED', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(scheduleId).run()

      return success
    } catch (error) {
      console.error('Error pausing monitoring:', error)
      return false
    }
  }

  async resumeMonitoring(scheduleId: number): Promise<boolean> {
    try {
      const { success } = await this.db.prepare(`
        UPDATE monitoring_schedules 
        SET status = 'ACTIVE', updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).bind(scheduleId).run()

      return success
    } catch (error) {
      console.error('Error resuming monitoring:', error)
      return false
    }
  }

  // Message template generators
  private generateAssessmentDueMessage(leadInfo: any, dueDate: Date): string {
    return `
Dear ${leadInfo.contact_name},

Your ${leadInfo.monitoring_type.toLowerCase()} AI readiness re-assessment is due tomorrow (${dueDate.toDateString()}).

Regular assessments help track your AI transformation progress and identify new opportunities for improvement.

Complete your follow-up assessment:
${process.env.ASSESSMENT_URL || 'https://your-domain.pages.dev'}

This only takes 5-10 minutes and provides updated insights based on your latest AI initiatives.

Benefits of regular monitoring:
• Track measurable progress in AI readiness
• Identify new opportunities and risks
• Benchmark against industry developments
• Adjust strategy based on changing landscape

Best regards,
The Forvis Mazars Digital Advisory 2.0 Team

Need help? Reply to this email or book a consultation at your convenience.
    `.trim()
  }

  private generateReminderMessage(leadInfo: any, dueDate: Date, days: number): string {
    return `
Dear ${leadInfo.contact_name},

Your ${leadInfo.monitoring_type.toLowerCase()} AI readiness re-assessment is due in ${days} ${days === 1 ? 'day' : 'days'} (${dueDate.toDateString()}).

Continuing to monitor your AI readiness ensures ${leadInfo.company_name} stays on track with your transformation goals.

Quick Assessment Link:
${process.env.ASSESSMENT_URL || 'https://your-domain.pages.dev'}

Why regular assessments matter:
• AI landscape evolves rapidly - stay current
• Track ROI from your AI investments  
• Identify emerging opportunities early
• Maintain competitive advantage

The assessment takes just 5-10 minutes and provides immediate, actionable insights.

Best regards,
The Forvis Mazars Digital Advisory 2.0 Team
    `.trim()
  }

  private generateAdvanceReminderMessage(leadInfo: any, dueDate: Date, days: number): string {
    return `
Dear ${leadInfo.contact_name},

Hope you're making great progress with your AI initiatives at ${leadInfo.company_name}!

This is an advance notice that your next AI readiness assessment is scheduled for ${dueDate.toDateString()} (${days} days from now).

Since your last assessment, we've seen significant developments in:
• Generative AI adoption across industries
• New regulatory frameworks for AI governance  
• Advanced automation capabilities
• Enhanced data analytics platforms

Your upcoming assessment will help evaluate how these changes impact your AI strategy.

Mark your calendar: ${dueDate.toDateString()}
Assessment link: ${process.env.ASSESSMENT_URL || 'https://your-domain.pages.dev'}

Looking forward to seeing your continued progress!

Best regards,
The Forvis Mazars Digital Advisory 2.0 Team

Questions? Book a consultation or reply to this email.
    `.trim()
  }

  async getMonitoringStats(): Promise<{
    totalActive: number,
    dueThisWeek: number,
    dueThisMonth: number,
    overdue: number,
    completionRate: number
  }> {
    try {
      const totalActive = await this.db.prepare(`
        SELECT COUNT(*) as count FROM monitoring_schedules WHERE status = 'ACTIVE'
      `).first() as any

      const oneWeekFromNow = new Date()
      oneWeekFromNow.setDate(oneWeekFromNow.getDate() + 7)

      const dueThisWeek = await this.db.prepare(`
        SELECT COUNT(*) as count FROM monitoring_schedules 
        WHERE status = 'ACTIVE' AND next_assessment_due <= ? AND assessment_completed = FALSE
      `).bind(oneWeekFromNow.toISOString().split('T')[0]).first() as any

      const oneMonthFromNow = new Date()
      oneMonthFromNow.setDate(oneMonthFromNow.getDate() + 30)

      const dueThisMonth = await this.db.prepare(`
        SELECT COUNT(*) as count FROM monitoring_schedules 
        WHERE status = 'ACTIVE' AND next_assessment_due <= ? AND assessment_completed = FALSE
      `).bind(oneMonthFromNow.toISOString().split('T')[0]).first() as any

      const today = new Date().toISOString().split('T')[0]
      const overdue = await this.db.prepare(`
        SELECT COUNT(*) as count FROM monitoring_schedules 
        WHERE status = 'ACTIVE' AND next_assessment_due < ? AND assessment_completed = FALSE
      `).bind(today).first() as any

      const completed = await this.db.prepare(`
        SELECT COUNT(*) as count FROM monitoring_schedules WHERE assessment_completed = TRUE
      `).first() as any

      const completionRate = totalActive.count > 0 ? 
        Math.round((completed.count / totalActive.count) * 100) : 0

      return {
        totalActive: totalActive.count || 0,
        dueThisWeek: dueThisWeek.count || 0,
        dueThisMonth: dueThisMonth.count || 0,
        overdue: overdue.count || 0,
        completionRate
      }
    } catch (error) {
      console.error('Error fetching monitoring stats:', error)
      return {
        totalActive: 0,
        dueThisWeek: 0,
        dueThisMonth: 0,
        overdue: 0,
        completionRate: 0
      }
    }
  }
}