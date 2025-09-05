// Email Service Integration for SAFE-8 Assessment
// Supports multiple email providers for maximum flexibility

export interface EmailProvider {
  sendAssessmentNotification(data: AssessmentEmailData): Promise<boolean>
}

export interface AssessmentEmailData {
  adminEmail: string
  leadData: {
    contactName: string
    email: string
    companyName: string
    industry: string
    jobTitle?: string
    phoneNumber?: string
  }
  assessmentData: {
    type: string
    overallScore: number
    dimensionScores: Record<string, number>
    completedAt: string
  }
}

// SendGrid Email Provider (Recommended for production)
export class SendGridProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async sendAssessmentNotification(data: AssessmentEmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: data.adminEmail }],
            subject: `New SAFE-8 Assessment Completed - ${data.leadData.companyName}`
          }],
          from: { 
            email: 'safe8@forvismazars.com',
            name: 'SAFE-8 Assessment System'
          },
          content: [{
            type: 'text/html',
            value: this.generateEmailTemplate(data)
          }]
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('SendGrid email error:', error)
      return false
    }
  }

  private generateEmailTemplate(data: AssessmentEmailData): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #171C8F 0%, #0072CE 100%); color: white; padding: 30px 20px; text-align: center; }
          .content { background: white; padding: 30px; border: 1px solid #e5e7eb; }
          .score { font-size: 2em; font-weight: bold; color: #0072CE; text-align: center; margin: 20px 0; }
          .dimension { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
          .contact-info { background: #f8f9fa; padding: 20px; margin: 20px 0; border-radius: 8px; }
          .cta { background: #0072CE; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎯 New SAFE-8 Assessment Completed</h1>
            <p>Forvis Mazars Digital Advisory 2.0</p>
          </div>
          
          <div class="content">
            <h2>Assessment Summary</h2>
            <div class="score">${data.assessmentData.overallScore}% AI Readiness</div>
            
            <div class="contact-info">
              <h3>Contact Information</h3>
              <p><strong>Name:</strong> ${data.leadData.contactName}</p>
              <p><strong>Company:</strong> ${data.leadData.companyName}</p>
              <p><strong>Industry:</strong> ${data.leadData.industry}</p>
              <p><strong>Email:</strong> ${data.leadData.email}</p>
              ${data.leadData.jobTitle ? `<p><strong>Job Title:</strong> ${data.leadData.jobTitle}</p>` : ''}
              ${data.leadData.phoneNumber ? `<p><strong>Phone:</strong> ${data.leadData.phoneNumber}</p>` : ''}
            </div>
            
            <h3>SAFE-8 Dimension Scores</h3>
            ${Object.entries(data.assessmentData.dimensionScores).map(([dimension, score]) => 
              `<div class="dimension">
                <span>${dimension}</span>
                <span><strong>${score}%</strong></span>
              </div>`
            ).join('')}
            
            <h3>Assessment Details</h3>
            <p><strong>Assessment Type:</strong> ${data.assessmentData.type}</p>
            <p><strong>Completed:</strong> ${new Date(data.assessmentData.completedAt).toLocaleString()}</p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${data.leadData.email}" class="cta">Contact Lead</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  }
}

// Resend Email Provider (Alternative)
export class ResendProvider implements EmailProvider {
  constructor(private apiKey: string) {}

  async sendAssessmentNotification(data: AssessmentEmailData): Promise<boolean> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'SAFE-8 <safe8@forvismazars.com>',
          to: [data.adminEmail],
          subject: `New SAFE-8 Assessment Completed - ${data.leadData.companyName}`,
          html: new SendGridProvider('').generateEmailTemplate(data)
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Resend email error:', error)
      return false
    }
  }
}

// Email Service Factory
export class EmailService {
  private provider: EmailProvider

  constructor(apiKey: string, providerType: 'sendgrid' | 'resend' = 'sendgrid') {
    switch (providerType) {
      case 'sendgrid':
        this.provider = new SendGridProvider(apiKey)
        break
      case 'resend':
        this.provider = new ResendProvider(apiKey)
        break
      default:
        throw new Error(`Unsupported email provider: ${providerType}`)
    }
  }

  async sendAssessmentNotification(data: AssessmentEmailData): Promise<boolean> {
    return this.provider.sendAssessmentNotification(data)
  }
}

// Webhook Email Provider (for Azure Logic Apps integration)
export class WebhookProvider implements EmailProvider {
  constructor(private webhookUrl: string) {}

  async sendAssessmentNotification(data: AssessmentEmailData): Promise<boolean> {
    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'assessment_completed',
          timestamp: new Date().toISOString(),
          data: data
        })
      })
      
      return response.ok
    } catch (error) {
      console.error('Webhook email error:', error)
      return false
    }
  }
}