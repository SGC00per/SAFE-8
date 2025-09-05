-- Additional tables for Expert Consultation Booking and Continuous Monitoring

-- Expert consultation bookings
CREATE TABLE IF NOT EXISTS consultation_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    assessment_id INTEGER,
    consultation_type TEXT NOT NULL, -- 'STRATEGY', 'TECHNICAL', 'IMPLEMENTATION'
    preferred_date DATE,
    preferred_time TEXT,
    timezone TEXT DEFAULT 'UTC',
    consultation_duration INTEGER DEFAULT 60, -- minutes
    topic_focus TEXT, -- JSON array of focus areas
    urgency_level TEXT DEFAULT 'MEDIUM', -- 'LOW', 'MEDIUM', 'HIGH', 'URGENT'
    company_background TEXT,
    specific_challenges TEXT,
    meeting_preference TEXT DEFAULT 'VIRTUAL', -- 'VIRTUAL', 'IN_PERSON', 'PHONE'
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'
    calendar_event_id TEXT, -- External calendar system ID
    meeting_link TEXT, -- Video conference link
    consultant_notes TEXT,
    follow_up_actions TEXT, -- JSON array of agreed actions
    booking_confirmed_at DATETIME,
    consultation_date DATETIME,
    completed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);

-- Continuous monitoring and re-assessment tracking
CREATE TABLE IF NOT EXISTS monitoring_schedules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    assessment_id INTEGER NOT NULL, -- Original assessment to track
    monitoring_type TEXT NOT NULL, -- 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'
    monitoring_frequency INTEGER DEFAULT 90, -- days between assessments
    next_assessment_due DATE NOT NULL,
    notification_schedule TEXT, -- JSON array of reminder dates
    auto_prompt_enabled BOOLEAN DEFAULT TRUE,
    last_reminder_sent DATETIME,
    reminders_sent INTEGER DEFAULT 0,
    assessment_completed BOOLEAN DEFAULT FALSE,
    follow_up_assessment_id INTEGER, -- Points to new assessment when completed
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'PAUSED', 'CANCELLED', 'COMPLETED'
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (assessment_id) REFERENCES assessments(id),
    FOREIGN KEY (follow_up_assessment_id) REFERENCES assessments(id)
);

-- Monitoring notifications and reminders
CREATE TABLE IF NOT EXISTS monitoring_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    monitoring_schedule_id INTEGER NOT NULL,
    notification_type TEXT NOT NULL, -- 'ASSESSMENT_DUE', 'REMINDER', 'OVERDUE'
    days_before_due INTEGER, -- How many days before due date
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message_content TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    sent_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (monitoring_schedule_id) REFERENCES monitoring_schedules(id)
);

-- Available consultation slots (for calendar integration)
CREATE TABLE IF NOT EXISTS consultation_availability (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_name TEXT NOT NULL,
    consultant_email TEXT NOT NULL,
    specialization TEXT NOT NULL, -- 'STRATEGY', 'TECHNICAL', 'IMPLEMENTATION'
    available_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone TEXT DEFAULT 'UTC',
    duration INTEGER DEFAULT 60, -- minutes
    max_bookings INTEGER DEFAULT 1,
    current_bookings INTEGER DEFAULT 0,
    is_available BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_lead_id ON consultation_bookings(lead_id);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_status ON consultation_bookings(status);
CREATE INDEX IF NOT EXISTS idx_consultation_bookings_date ON consultation_bookings(consultation_date);

CREATE INDEX IF NOT EXISTS idx_monitoring_schedules_lead_id ON monitoring_schedules(lead_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_schedules_due_date ON monitoring_schedules(next_assessment_due);
CREATE INDEX IF NOT EXISTS idx_monitoring_schedules_status ON monitoring_schedules(status);

CREATE INDEX IF NOT EXISTS idx_monitoring_notifications_schedule_id ON monitoring_notifications(monitoring_schedule_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_notifications_status ON monitoring_notifications(status);

CREATE INDEX IF NOT EXISTS idx_consultation_availability_date ON consultation_availability(available_date);
CREATE INDEX IF NOT EXISTS idx_consultation_availability_consultant ON consultation_availability(consultant_email);