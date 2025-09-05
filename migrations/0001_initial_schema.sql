-- SAFE-8 Assessment Database Schema

-- Leads table for tracking assessment participants
CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    company_name TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    phone_number TEXT,
    job_title TEXT,
    industry TEXT NOT NULL,
    company_size TEXT,
    country TEXT,
    lead_source TEXT DEFAULT 'SAFE8_ASSESSMENT',
    status TEXT DEFAULT 'NEW',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Assessments table for storing completed assessments
CREATE TABLE IF NOT EXISTS assessments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    assessment_type TEXT NOT NULL, -- 'CORE', 'ADVANCED', 'FRONTIER'
    industry TEXT NOT NULL,
    overall_score INTEGER NOT NULL, -- 0-100 percentage
    dimension_scores TEXT NOT NULL, -- JSON string of dimension scores
    responses TEXT NOT NULL, -- JSON string of all responses
    insights TEXT, -- Generated insights
    recommendations TEXT, -- Generated recommendations
    completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- Assessment questions configuration
CREATE TABLE IF NOT EXISTS assessment_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_text TEXT NOT NULL,
    question_type TEXT NOT NULL, -- 'CORE', 'ADVANCED', 'FRONTIER'
    dimension TEXT NOT NULL, -- SAFE-8 dimension
    weight REAL DEFAULT 1.0,
    answer_type TEXT DEFAULT 'LIKERT', -- 'LIKERT', 'BINARY', 'MULTIPLE_CHOICE'
    answer_options TEXT, -- JSON string for multiple choice options
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE
);

-- Industry benchmarks for comparison
CREATE TABLE IF NOT EXISTS industry_benchmarks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    industry TEXT NOT NULL,
    dimension TEXT NOT NULL,
    average_score REAL NOT NULL,
    top_quartile_score REAL NOT NULL,
    median_score REAL NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Email notifications log
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assessment_id INTEGER NOT NULL,
    email_type TEXT NOT NULL, -- 'ASSESSMENT_COMPLETE', 'FOLLOW_UP'
    recipient_email TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'SENT', 'FAILED'
    sent_at DATETIME,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_assessments_lead_id ON assessments(lead_id);
CREATE INDEX IF NOT EXISTS idx_assessments_completed_at ON assessments(completed_at);
CREATE INDEX IF NOT EXISTS idx_questions_type_dimension ON assessment_questions(question_type, dimension);
CREATE INDEX IF NOT EXISTS idx_benchmarks_industry ON industry_benchmarks(industry);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);