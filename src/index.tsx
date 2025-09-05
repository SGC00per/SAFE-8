import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

// Type definitions for Cloudflare bindings
type Bindings = {
  DB: D1Database;
  EMAIL_API_KEY?: string;
  ADMIN_EMAIL?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for all routes
app.use('*', cors())

// Serve static files from public directory
app.use('/static/*', serveStatic({ root: './public' }))

// Validation schemas
const leadSchema = z.object({
  email: z.string().email(),
  companyName: z.string().min(1),
  contactName: z.string().min(1),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  industry: z.string().min(1),
  companySize: z.string().optional(),
  country: z.string().optional()
})

const assessmentSchema = z.object({
  leadId: z.number(),
  assessmentType: z.enum(['CORE', 'ADVANCED', 'FRONTIER']),
  industry: z.string(),
  responses: z.record(z.number()), // questionId -> score
  overallScore: z.number().min(0).max(100),
  dimensionScores: z.record(z.number()) // dimension -> score
})

// Utility functions
const calculateDimensionScores = (responses: Record<string, number>, questions: any[]) => {
  const dimensionTotals: Record<string, { sum: number; count: number; weight: number }> = {}
  
  questions.forEach(question => {
    const questionId = question.id.toString()
    if (responses[questionId] !== undefined) {
      if (!dimensionTotals[question.dimension]) {
        dimensionTotals[question.dimension] = { sum: 0, count: 0, weight: 0 }
      }
      
      dimensionTotals[question.dimension].sum += responses[questionId] * question.weight
      dimensionTotals[question.dimension].count += 1
      dimensionTotals[question.dimension].weight += question.weight
    }
  })
  
  const dimensionScores: Record<string, number> = {}
  Object.keys(dimensionTotals).forEach(dimension => {
    const { sum, weight } = dimensionTotals[dimension]
    dimensionScores[dimension] = Math.round((sum / weight) * 25) // Convert to 0-100 scale
  })
  
  return dimensionScores
}

const calculateOverallScore = (dimensionScores: Record<string, number>) => {
  const scores = Object.values(dimensionScores)
  return scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0
}

const generateInsights = (dimensionScores: Record<string, number>, industry: string, benchmarks: any[]) => {
  const insights = []
  
  // Get industry benchmarks if available
  const industryBenchmarks = benchmarks.filter(b => b.industry === industry)
  
  // Generic scoring thresholds (fallback when no industry data)
  const genericThresholds = {
    excellent: 85,   // Top quartile threshold
    good: 70,       // Above average threshold
    average: 55,    // Average threshold
    // Below 55 = needs improvement
  }
  
  Object.entries(dimensionScores).forEach(([dimension, score]) => {
    // Try to find industry-specific benchmark
    const benchmark = industryBenchmarks.find(b => b.dimension === dimension)
    
    let insight = ''
    let recommendation = ''
    
    if (benchmark) {
      // Use industry-specific benchmarks
      if (score >= benchmark.top_quartile_score) {
        insight = `🟢 ${dimension}: Excellent performance (Top Quartile for ${industry})`
        recommendation = 'Maintain this strength and consider sharing best practices across your organization.'
      } else if (score >= benchmark.median_score) {
        insight = `🟡 ${dimension}: Above average performance (vs ${industry} industry)`
        recommendation = 'Good foundation - focus on incremental improvements to reach top quartile.'
      } else if (score >= benchmark.average_score) {
        insight = `🟠 ${dimension}: Below median performance (vs ${industry} industry)`
        recommendation = 'Significant improvement opportunity - prioritize initiatives in this area.'
      } else {
        insight = `🔴 ${dimension}: Critical gap (Bottom quartile for ${industry})`
        recommendation = 'Urgent attention required - this represents a major competitive risk.'
      }
    } else {
      // Use generic thresholds with actionable insights
      if (score >= genericThresholds.excellent) {
        insight = `🟢 ${dimension}: Excellent performance (${score}%)`
        recommendation = 'Outstanding capability - leverage this strength for competitive advantage.'
      } else if (score >= genericThresholds.good) {
        insight = `🟡 ${dimension}: Good performance (${score}%)`
        recommendation = 'Solid foundation - focus on optimization and advanced capabilities.'
      } else if (score >= genericThresholds.average) {
        insight = `🟠 ${dimension}: Average performance (${score}%)`
        recommendation = 'Improvement needed - develop a focused action plan for this area.'
      } else {
        insight = `🔴 ${dimension}: Below average performance (${score}%)`
        recommendation = 'Critical priority - immediate investment and strategic focus required.'
      }
    }
    
    insights.push(`${insight} - ${recommendation}`)
  })
  
  // Add overall strategic insights based on score patterns
  const avgScore = Object.values(dimensionScores).reduce((a, b) => a + b, 0) / Object.values(dimensionScores).length
  
  if (avgScore >= 80) {
    insights.push(`🚀 Overall Assessment: Strong AI readiness position (${Math.round(avgScore)}%) - Focus on innovation and scaling successful practices.`)
  } else if (avgScore >= 65) {
    insights.push(`📈 Overall Assessment: Moderate AI readiness (${Math.round(avgScore)}%) - Prioritize addressing weakest areas while building on strengths.`)
  } else if (avgScore >= 50) {
    insights.push(`⚠️ Overall Assessment: Developing AI readiness (${Math.round(avgScore)}%) - Establish foundational capabilities before pursuing advanced initiatives.`)
  } else {
    insights.push(`🚨 Overall Assessment: Early-stage AI readiness (${Math.round(avgScore)}%) - Urgent need for comprehensive AI strategy and capability development.`)
  }
  
  // Add dimension-specific strategic recommendations
  const criticalDimensions = Object.entries(dimensionScores).filter(([_, score]) => score < 60)
  
  if (criticalDimensions.length > 0) {
    insights.push(`🎯 Priority Focus Areas: ${criticalDimensions.map(([dim]) => dim).join(', ')} require immediate attention to build AI readiness foundation.`)
  }
  
  // Add actionable next steps based on lowest scoring dimensions
  const lowestDimension = Object.entries(dimensionScores).reduce((min, curr) => 
    curr[1] < min[1] ? curr : min
  )
  
  const actionableRecommendations = {
    'Strategic Alignment': 'Develop a formal AI strategy document, establish AI governance committee, and align AI initiatives with business objectives.',
    'Architecture & Infrastructure': 'Assess current IT infrastructure capacity, implement cloud-based AI platforms, and establish data pipeline architecture.',
    'Foundation & Governance': 'Create AI ethics guidelines, establish risk management frameworks, and implement AI project approval processes.',
    'Ethics & Trust': 'Develop responsible AI principles, implement bias testing protocols, and establish transparency requirements.',
    'Data & Analytics': 'Improve data quality processes, implement data governance frameworks, and establish analytics capabilities.',
    'Innovation & Agility': 'Create innovation labs, establish experimentation processes, and build rapid prototyping capabilities.',
    'Workforce & Culture': 'Implement AI literacy training, develop change management programs, and foster AI-positive culture.',
    'Execution & Operations': 'Establish AI project management practices, implement monitoring systems, and develop maintenance protocols.'
  }
  
  if (lowestDimension && lowestDimension[1] < 70) {
    const nextSteps = actionableRecommendations[lowestDimension[0]]
    if (nextSteps) {
      insights.push(`🔧 Immediate Action Plan for ${lowestDimension[0]}: ${nextSteps}`)
    }
  }
  
  return insights
}

// API Routes

// Get assessment questions by type
app.get('/api/questions/:type', async (c) => {
  const { env } = c
  const type = c.req.param('type').toUpperCase()
  
  if (!['CORE', 'ADVANCED', 'FRONTIER'].includes(type)) {
    return c.json({ error: 'Invalid assessment type' }, 400)
  }
  
  try {
    const { results } = await env.DB.prepare(`
      SELECT * FROM assessment_questions 
      WHERE question_type = ? AND active = TRUE
      ORDER BY sort_order
    `).bind(type).all()
    
    return c.json({ questions: results })
  } catch (error) {
    console.error('Error fetching questions:', error)
    return c.json({ error: 'Failed to fetch questions' }, 500)
  }
})

// Create or update lead
app.post('/api/leads', zValidator('json', leadSchema), async (c) => {
  const { env } = c
  const leadData = c.req.valid('json')
  
  try {
    // Check if lead already exists
    const existingLead = await env.DB.prepare(`
      SELECT * FROM leads WHERE email = ?
    `).bind(leadData.email).first()
    
    if (existingLead) {
      // Update existing lead
      const { success } = await env.DB.prepare(`
        UPDATE leads SET 
          company_name = ?, contact_name = ?, phone_number = ?,
          job_title = ?, industry = ?, company_size = ?, country = ?,
          updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `).bind(
        leadData.companyName, leadData.contactName, leadData.phoneNumber || null,
        leadData.jobTitle || null, leadData.industry, leadData.companySize || null, 
        leadData.country || null, leadData.email
      ).run()
      
      if (success) {
        return c.json({ leadId: existingLead.id, message: 'Lead updated successfully' })
      }
    } else {
      // Create new lead
      const { success, meta } = await env.DB.prepare(`
        INSERT INTO leads (email, company_name, contact_name, phone_number, 
                          job_title, industry, company_size, country)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        leadData.email, leadData.companyName, leadData.contactName,
        leadData.phoneNumber || null, leadData.jobTitle || null, leadData.industry,
        leadData.companySize || null, leadData.country || null
      ).run()
      
      if (success) {
        return c.json({ leadId: meta.last_row_id, message: 'Lead created successfully' })
      }
    }
    
    return c.json({ error: 'Failed to save lead' }, 500)
  } catch (error) {
    console.error('Error saving lead:', error)
    return c.json({ error: 'Failed to save lead' }, 500)
  }
})

// Submit assessment
app.post('/api/assessments', zValidator('json', assessmentSchema), async (c) => {
  const { env } = c
  const assessmentData = c.req.valid('json')
  
  try {
    // Get questions for calculation
    const { results: questions } = await env.DB.prepare(`
      SELECT * FROM assessment_questions 
      WHERE question_type = ? AND active = TRUE
    `).bind(assessmentData.assessmentType).all()
    
    // Recalculate scores server-side for validation
    const dimensionScores = calculateDimensionScores(assessmentData.responses, questions)
    const overallScore = calculateOverallScore(dimensionScores)
    
    // Get industry benchmarks
    const { results: benchmarks } = await env.DB.prepare(`
      SELECT * FROM industry_benchmarks WHERE industry = ?
    `).bind(assessmentData.industry).all()
    
    // Generate insights
    const insights = generateInsights(dimensionScores, assessmentData.industry, benchmarks)
    
    // Save assessment
    const { success, meta } = await env.DB.prepare(`
      INSERT INTO assessments (lead_id, assessment_type, industry, overall_score, 
                              dimension_scores, responses, insights)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      assessmentData.leadId,
      assessmentData.assessmentType,
      assessmentData.industry,
      overallScore,
      JSON.stringify(dimensionScores),
      JSON.stringify(assessmentData.responses),
      JSON.stringify(insights)
    ).run()
    
    if (success) {
      const assessmentId = meta.last_row_id
      
      // Queue email notification
      await env.DB.prepare(`
        INSERT INTO notifications (assessment_id, email_type, recipient_email)
        VALUES (?, 'ASSESSMENT_COMPLETE', ?)
      `).bind(assessmentId, env.ADMIN_EMAIL || 'shane@forvismazars.com').run()
      
      return c.json({ 
        assessmentId, 
        overallScore, 
        dimensionScores, 
        insights,
        benchmarks: benchmarks.filter(b => b.industry === assessmentData.industry)
      })
    }
    
    return c.json({ error: 'Failed to save assessment' }, 500)
  } catch (error) {
    console.error('Error saving assessment:', error)
    return c.json({ error: 'Failed to save assessment' }, 500)
  }
})

// Get assessment results
app.get('/api/assessments/:id', async (c) => {
  const { env } = c
  const assessmentId = c.req.param('id')
  
  try {
    const assessment = await env.DB.prepare(`
      SELECT a.*, l.company_name, l.contact_name, l.email
      FROM assessments a
      JOIN leads l ON a.lead_id = l.id
      WHERE a.id = ?
    `).bind(assessmentId).first()
    
    if (!assessment) {
      return c.json({ error: 'Assessment not found' }, 404)
    }
    
    // Get benchmarks
    const { results: benchmarks } = await env.DB.prepare(`
      SELECT * FROM industry_benchmarks WHERE industry = ?
    `).bind(assessment.industry).all()
    
    return c.json({
      ...assessment,
      dimension_scores: JSON.parse(assessment.dimension_scores),
      responses: JSON.parse(assessment.responses),
      insights: JSON.parse(assessment.insights),
      benchmarks
    })
  } catch (error) {
    console.error('Error fetching assessment:', error)
    return c.json({ error: 'Failed to fetch assessment' }, 500)
  }
})

// Admin dashboard - get all leads
app.get('/api/admin/leads', async (c) => {
  const { env } = c
  
  try {
    const { results } = await env.DB.prepare(`
      SELECT l.*, COUNT(a.id) as assessment_count,
             MAX(a.completed_at) as last_assessment
      FROM leads l
      LEFT JOIN assessments a ON l.id = a.lead_id
      GROUP BY l.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `).all()
    
    return c.json({ leads: results })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return c.json({ error: 'Failed to fetch leads' }, 500)
  }
})

// Admin dashboard - get assessment analytics
app.get('/api/admin/analytics', async (c) => {
  const { env } = c
  
  try {
    const totalLeads = await env.DB.prepare('SELECT COUNT(*) as count FROM leads').first()
    const totalAssessments = await env.DB.prepare('SELECT COUNT(*) as count FROM assessments').first()
    const avgScore = await env.DB.prepare('SELECT AVG(overall_score) as avg FROM assessments').first()
    
    const industryDistribution = await env.DB.prepare(`
      SELECT industry, COUNT(*) as count 
      FROM leads 
      GROUP BY industry 
      ORDER BY count DESC
    `).all()
    
    const recentAssessments = await env.DB.prepare(`
      SELECT a.overall_score, a.assessment_type, a.completed_at, 
             l.company_name, l.industry
      FROM assessments a
      JOIN leads l ON a.lead_id = l.id
      ORDER BY a.completed_at DESC
      LIMIT 10
    `).all()
    
    return c.json({
      totalLeads: totalLeads?.count || 0,
      totalAssessments: totalAssessments?.count || 0,
      averageScore: Math.round(avgScore?.avg || 0),
      industryDistribution: industryDistribution.results,
      recentAssessments: recentAssessments.results
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return c.json({ error: 'Failed to fetch analytics' }, 500)
  }
})

// Main application route
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en-GB">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
        <title>Forvis Mazars Digital Advisory 2.0 - SAFE-8 AI Readiness Assessment</title>
        
        <!-- Progressive Web App -->
        <meta name="theme-color" content="#171C8F">
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
        
        <!-- External Libraries -->
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        
        <!-- Custom Styles -->
        <style>
            :root {
                --forvis-indigo: #171C8F;
                --forvis-blue: #0072CE;
                --forvis-grey: #464B4B;
                --forvis-light-grey: #F8F9FA;
            }
            
            * {
                font-family: 'Inter', 'Halyard', Arial, sans-serif;
            }
            
            .forvis-gradient {
                background: linear-gradient(135deg, var(--forvis-indigo) 0%, var(--forvis-blue) 100%);
            }
            
            .assessment-card {
                transition: all 0.3s ease;
                border: 2px solid transparent;
            }
            
            .assessment-card:hover, .assessment-card.selected {
                border-color: var(--forvis-blue);
                transform: translateY(-2px);
                box-shadow: 0 8px 25px rgba(23, 28, 143, 0.15);
            }
            
            .progress-bar {
                background: linear-gradient(90deg, var(--forvis-indigo) 0%, var(--forvis-blue) 100%);
            }
            
            .likert-option {
                transition: all 0.2s ease;
            }
            
            .likert-option:hover {
                background-color: #f0f9ff;
            }
            
            .likert-option.selected {
                background-color: var(--forvis-blue);
                color: white;
            }
            
            .radar-container {
                max-width: 400px;
                max-height: 400px;
            }
            
            @media (max-width: 768px) {
                .container {
                    padding: 1rem;
                }
                
                .assessment-card {
                    margin-bottom: 1rem;
                }
                
                .radar-container {
                    max-width: 300px;
                    max-height: 300px;
                }
            }
        </style>
    </head>
    <body class="bg-gray-50 min-h-screen">
        <div id="app">
            <!-- Loading screen -->
            <div id="loading-screen" class="fixed inset-0 forvis-gradient flex items-center justify-center z-50">
                <div class="text-center text-white">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <h2 class="text-xl font-semibold">Loading SAFE-8 Assessment...</h2>
                </div>
            </div>
            
            <!-- Main content will be injected here -->
        </div>
        
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

// Admin dashboard route  
app.get('/admin', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en-GB">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SAFE-8 Admin Dashboard - Forvis Mazars</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * { font-family: 'Inter', Arial, sans-serif; }
            .forvis-gradient { background: linear-gradient(135deg, #171C8F 0%, #0072CE 100%); }
        </style>
    </head>
    <body class="bg-gray-100">
        <div id="admin-app">Loading admin dashboard...</div>
        <script src="/static/admin.js"></script>
    </body>
    </html>
  `)
})

export default app