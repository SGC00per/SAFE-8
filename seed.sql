-- SAFE-8 Assessment Questions Seed Data

-- SAFE-8 Dimensions:
-- 1. Strategic Alignment
-- 2. Architecture & Infrastructure  
-- 3. Foundation & Governance
-- 4. Ethics & Trust
-- 5. Data & Analytics
-- 6. Innovation & Agility
-- 7. Workforce & Culture
-- 8. Execution & Operations

-- Core Assessment Questions (25 questions, ~5 minutes)
INSERT OR IGNORE INTO assessment_questions (question_text, question_type, dimension, weight, sort_order) VALUES
-- Strategic Alignment (3 questions)
('Our organization has a clearly defined AI strategy that aligns with business objectives.', 'CORE', 'Strategic Alignment', 1.0, 1),
('Leadership actively champions AI initiatives and allocates appropriate resources.', 'CORE', 'Strategic Alignment', 1.0, 2),
('We have identified specific use cases where AI can create measurable business value.', 'CORE', 'Strategic Alignment', 1.0, 3),

-- Architecture & Infrastructure (3 questions)
('Our IT infrastructure can support AI/ML workloads and data processing requirements.', 'CORE', 'Architecture & Infrastructure', 1.0, 4),
('We have reliable data storage and computing capabilities for AI applications.', 'CORE', 'Architecture & Infrastructure', 1.0, 5),
('Our systems can integrate AI solutions with existing business applications.', 'CORE', 'Architecture & Infrastructure', 1.0, 6),

-- Foundation & Governance (4 questions)
('We have established governance frameworks for AI development and deployment.', 'CORE', 'Foundation & Governance', 1.0, 7),
('Clear roles and responsibilities are defined for AI initiatives.', 'CORE', 'Foundation & Governance', 1.0, 8),
('We have processes for AI risk assessment and management.', 'CORE', 'Foundation & Governance', 1.0, 9),
('AI projects follow established approval and oversight procedures.', 'CORE', 'Foundation & Governance', 1.0, 10),

-- Ethics & Trust (3 questions)
('We consider ethical implications in our AI decision-making processes.', 'CORE', 'Ethics & Trust', 1.0, 11),
('Our organization has guidelines for responsible AI use.', 'CORE', 'Ethics & Trust', 1.0, 12),
('We ensure transparency and explainability in AI applications where needed.', 'CORE', 'Ethics & Trust', 1.0, 13),

-- Data & Analytics (4 questions)
('Our data quality is sufficient to support reliable AI/ML models.', 'CORE', 'Data & Analytics', 1.0, 14),
('We have established data governance and management practices.', 'CORE', 'Data & Analytics', 1.0, 15),
('Our organization can effectively collect, store, and access relevant data.', 'CORE', 'Data & Analytics', 1.0, 16),
('We have basic analytics capabilities to support business decision-making.', 'CORE', 'Data & Analytics', 1.0, 17),

-- Innovation & Agility (3 questions)
('Our organization encourages experimentation with new AI technologies.', 'CORE', 'Innovation & Agility', 1.0, 18),
('We can quickly adapt and scale AI solutions based on business needs.', 'CORE', 'Innovation & Agility', 1.0, 19),
('We stay informed about AI trends and emerging technologies.', 'CORE', 'Innovation & Agility', 1.0, 20),

-- Workforce & Culture (3 questions)
('Our workforce has basic AI literacy and understanding.', 'CORE', 'Workforce & Culture', 1.0, 21),
('Employees are open to working alongside AI technologies.', 'CORE', 'Workforce & Culture', 1.0, 22),
('We have or plan to develop AI-related skills within our organization.', 'CORE', 'Workforce & Culture', 1.0, 23),

-- Execution & Operations (2 questions)
('We have successfully implemented at least one AI solution.', 'CORE', 'Execution & Operations', 1.0, 24),
('Our organization can effectively monitor and maintain AI systems.', 'CORE', 'Execution & Operations', 1.0, 25);

-- Industry Benchmark Data (sample data)
INSERT OR IGNORE INTO industry_benchmarks (industry, dimension, average_score, top_quartile_score, median_score) VALUES
-- Financial Services benchmarks
('Financial Services', 'Strategic Alignment', 68.5, 85.2, 71.3),
('Financial Services', 'Architecture & Infrastructure', 72.1, 89.4, 75.8),
('Financial Services', 'Foundation & Governance', 75.3, 91.7, 78.9),
('Financial Services', 'Ethics & Trust', 69.8, 87.5, 73.2),
('Financial Services', 'Data & Analytics', 78.9, 93.1, 82.4),
('Financial Services', 'Innovation & Agility', 64.2, 82.7, 67.9),
('Financial Services', 'Workforce & Culture', 59.4, 78.3, 62.8),
('Financial Services', 'Execution & Operations', 66.7, 84.9, 70.1),

-- Technology benchmarks
('Technology', 'Strategic Alignment', 74.2, 89.8, 77.6),
('Technology', 'Architecture & Infrastructure', 81.5, 94.7, 84.3),
('Technology', 'Foundation & Governance', 71.8, 88.2, 75.1),
('Technology', 'Ethics & Trust', 73.4, 89.6, 76.8),
('Technology', 'Data & Analytics', 85.7, 96.3, 88.9),
('Technology', 'Innovation & Agility', 79.3, 92.4, 82.7),
('Technology', 'Workforce & Culture', 76.8, 91.2, 80.4),
('Technology', 'Execution & Operations', 78.1, 91.5, 81.3),

-- Healthcare benchmarks  
('Healthcare', 'Strategic Alignment', 61.7, 79.4, 65.3),
('Healthcare', 'Architecture & Infrastructure', 65.9, 83.2, 69.7),
('Healthcare', 'Foundation & Governance', 78.4, 92.8, 81.6),
('Healthcare', 'Ethics & Trust', 81.2, 94.5, 84.7),
('Healthcare', 'Data & Analytics', 69.3, 86.8, 72.9),
('Healthcare', 'Innovation & Agility', 58.7, 76.1, 62.4),
('Healthcare', 'Workforce & Culture', 55.9, 74.2, 59.6),
('Healthcare', 'Execution & Operations', 62.4, 80.7, 66.1),

-- Manufacturing benchmarks
('Manufacturing', 'Strategic Alignment', 65.3, 82.1, 68.9),
('Manufacturing', 'Architecture & Infrastructure', 69.7, 86.4, 73.2),
('Manufacturing', 'Foundation & Governance', 72.6, 89.3, 76.1),
('Manufacturing', 'Ethics & Trust', 64.8, 81.5, 68.4),
('Manufacturing', 'Data & Analytics', 74.2, 90.7, 77.8),
('Manufacturing', 'Innovation & Agility', 67.1, 84.9, 70.6),
('Manufacturing', 'Workforce & Culture', 61.5, 79.8, 65.2),
('Manufacturing', 'Execution & Operations', 71.3, 88.6, 74.9);

-- Sample consultation availability (next 30 days)
INSERT OR IGNORE INTO consultation_availability (consultant_name, consultant_email, specialization, available_date, start_time, end_time, timezone, duration, max_bookings, current_bookings) VALUES 
  ('Shane Mitchell', 'shane@forvismazars.com', 'STRATEGY', date('now', '+3 days'), '09:00', '10:30', 'UTC', 90, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'STRATEGY', date('now', '+3 days'), '14:00', '15:30', 'UTC', 90, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'TECHNICAL', date('now', '+5 days'), '10:00', '11:15', 'UTC', 75, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'TECHNICAL', date('now', '+5 days'), '15:00', '16:15', 'UTC', 75, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'IMPLEMENTATION', date('now', '+7 days'), '09:00', '10:00', 'UTC', 60, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'IMPLEMENTATION', date('now', '+7 days'), '11:00', '12:00', 'UTC', 60, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'STRATEGY', date('now', '+10 days'), '09:00', '10:30', 'UTC', 90, 1, 0),
  ('Shane Mitchell', 'shane@forvismazars.com', 'STRATEGY', date('now', '+10 days'), '14:00', '15:30', 'UTC', 90, 1, 0);