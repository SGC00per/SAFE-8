// AI-Powered Insights Engine for SAFE-8 Assessment
// Generates personalized, contextual insights using GPT

export interface AssessmentContext {
  dimensionScores: Record<string, number>
  responses: Record<string, number>
  industry: string
  companySize?: string
  jobTitle?: string
  overallScore: number
  benchmarks: any[]
}

export interface PersonalizedInsight {
  type: 'strength' | 'opportunity' | 'risk' | 'recommendation'
  dimension: string
  priority: 'high' | 'medium' | 'low'
  insight: string
  actionItems: string[]
  businessImpact: string
  timeline: string
  investmentLevel: 'low' | 'medium' | 'high'
}

export class AIInsightsEngine {
  private apiKey: string
  
  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async generatePersonalizedInsights(context: AssessmentContext): Promise<PersonalizedInsight[]> {
    try {
      // Prepare context for AI analysis
      const analysisContext = this.prepareAnalysisContext(context)
      
      // Generate insights using OpenAI
      const insights = await this.callOpenAI(analysisContext)
      
      // Parse and structure the response
      return this.parseInsights(insights, context)
      
    } catch (error) {
      console.error('Error generating AI insights:', error)
      // Fallback to enhanced static insights
      return this.generateEnhancedStaticInsights(context)
    }
  }

  private prepareAnalysisContext(context: AssessmentContext): string {
    const { dimensionScores, industry, companySize, jobTitle, overallScore } = context
    
    // Find strengths and weaknesses
    const strengths = Object.entries(dimensionScores)
      .filter(([_, score]) => score >= 75)
      .map(([dim, score]) => `${dim}: ${score}%`)
    
    const opportunities = Object.entries(dimensionScores)
      .filter(([_, score]) => score >= 50 && score < 75)
      .map(([dim, score]) => `${dim}: ${score}%`)
    
    const criticalGaps = Object.entries(dimensionScores)
      .filter(([_, score]) => score < 50)
      .map(([dim, score]) => `${dim}: ${score}%`)

    // Get industry benchmarks for context
    const benchmarkContext = context.benchmarks
      .filter(b => b.industry === industry)
      .map(b => `${b.dimension}: avg ${Math.round(b.average_score)}%, top quartile ${Math.round(b.top_quartile_score)}%`)
      .join('; ')

    return `
SAFE-8 AI Readiness Assessment Analysis Request:

Company Profile:
- Industry: ${industry}
- Company Size: ${companySize || 'Unknown'}
- Job Title: ${jobTitle || 'Unknown'}
- Overall AI Readiness: ${overallScore}%

Performance Breakdown:
- Strengths (75%+): ${strengths.join(', ') || 'None'}
- Opportunities (50-74%): ${opportunities.join(', ') || 'None'}  
- Critical Gaps (<50%): ${criticalGaps.join(', ') || 'None'}

Industry Benchmarks (${industry}):
${benchmarkContext}

Current AI Adoption Phase: ${this.getAdoptionPhase(overallScore)}

Please provide 3-5 personalized insights with:
1. Specific business impact for this industry/role
2. Concrete action items (not generic advice)
3. Realistic timelines and investment levels
4. Strategic implications for competitive positioning
5. Risk assessment if gaps aren't addressed

Focus on actionable recommendations that a ${jobTitle || 'business leader'} in ${industry} can implement.
    `.trim()
  }

  private async callOpenAI(context: string): Promise<string> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an AI readiness consultant for Forvis Mazars Digital Advisory. Provide strategic, actionable insights for enterprise AI transformation. Be specific, avoid generic advice, and focus on business outcomes. Format responses as structured insights with clear priority levels.`
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 1500,
        temperature: 0.7
      })
    })

    const data = await response.json()
    return data.choices[0].message.content
  }

  private parseInsights(aiResponse: string, context: AssessmentContext): PersonalizedInsight[] {
    // Parse AI response and structure it
    // This is a simplified parser - in production, you'd want more robust parsing
    
    const insights: PersonalizedInsight[] = []
    const sections = aiResponse.split(/\n\s*\n/)
    
    sections.forEach((section, index) => {
      if (section.trim().length > 50) { // Filter out short sections
        const insight = this.parseInsightSection(section, context, index)
        if (insight) insights.push(insight)
      }
    })
    
    return insights.slice(0, 5) // Limit to top 5 insights
  }

  private parseInsightSection(section: string, context: AssessmentContext, index: number): PersonalizedInsight | null {
    // Extract key information from AI response section
    const lines = section.split('\n').map(line => line.trim())
    
    // Determine dimension based on content keywords
    const dimension = this.extractDimension(section)
    const priority = this.determinePriority(section, context.dimensionScores[dimension])
    
    return {
      type: this.determineInsightType(section),
      dimension,
      priority,
      insight: lines[0] || section.substring(0, 200),
      actionItems: this.extractActionItems(section),
      businessImpact: this.extractBusinessImpact(section),
      timeline: this.extractTimeline(section),
      investmentLevel: this.determineInvestmentLevel(section)
    }
  }

  private extractDimension(text: string): string {
    const dimensions = [
      'Strategic Alignment', 'Architecture & Infrastructure', 'Foundation & Governance',
      'Ethics & Trust', 'Data & Analytics', 'Innovation & Agility',
      'Workforce & Culture', 'Execution & Operations'
    ]
    
    // Find dimension mentioned in text
    for (const dim of dimensions) {
      if (text.toLowerCase().includes(dim.toLowerCase()) || 
          text.toLowerCase().includes(dim.split(' ')[0].toLowerCase())) {
        return dim
      }
    }
    
    return 'Strategic Alignment' // Default
  }

  private extractActionItems(text: string): string[] {
    // Extract bullet points, numbered items, or action-oriented sentences
    const actionKeywords = ['implement', 'develop', 'establish', 'create', 'build', 'deploy', 'train']
    const sentences = text.split(/[.!?]+/)
    
    return sentences
      .filter(sentence => 
        actionKeywords.some(keyword => 
          sentence.toLowerCase().includes(keyword)
        )
      )
      .map(item => item.trim())
      .filter(item => item.length > 10)
      .slice(0, 3)
  }

  private extractBusinessImpact(text: string): string {
    // Look for business impact indicators
    const impactKeywords = ['revenue', 'cost', 'efficiency', 'competitive', 'risk', 'growth', 'roi']
    const sentences = text.split(/[.!?]+/)
    
    const impactSentence = sentences.find(sentence =>
      impactKeywords.some(keyword => 
        sentence.toLowerCase().includes(keyword)
      )
    )
    
    return impactSentence?.trim() || 'Improves overall AI readiness and competitive positioning'
  }

  private extractTimeline(text: string): string {
    // Extract timeline mentions
    const timelinePatterns = [
      /(\d+[-\s]?\w+\s+(months?|weeks?|years?))/gi,
      /(short[- ]?term|long[- ]?term|immediate)/gi,
      /(Q[1-4]|\d+\s*quarters?)/gi
    ]
    
    for (const pattern of timelinePatterns) {
      const match = text.match(pattern)
      if (match) return match[0]
    }
    
    return '3-6 months'
  }

  private determineInsightType(text: string): PersonalizedInsight['type'] {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('strength') || lowerText.includes('excellent') || lowerText.includes('leading')) {
      return 'strength'
    } else if (lowerText.includes('risk') || lowerText.includes('critical') || lowerText.includes('urgent')) {
      return 'risk'
    } else if (lowerText.includes('recommend') || lowerText.includes('should') || lowerText.includes('consider')) {
      return 'recommendation'
    } else {
      return 'opportunity'
    }
  }

  private determinePriority(text: string, score?: number): PersonalizedInsight['priority'] {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('critical') || lowerText.includes('urgent') || (score && score < 40)) {
      return 'high'
    } else if (lowerText.includes('important') || lowerText.includes('significant') || (score && score < 60)) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  private determineInvestmentLevel(text: string): PersonalizedInsight['investmentLevel'] {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('significant investment') || lowerText.includes('major') || lowerText.includes('enterprise')) {
      return 'high'
    } else if (lowerText.includes('moderate') || lowerText.includes('training') || lowerText.includes('process')) {
      return 'medium'
    } else {
      return 'low'
    }
  }

  private getAdoptionPhase(score: number): string {
    if (score >= 80) return 'AI Leader'
    if (score >= 65) return 'AI Adopter'
    if (score >= 50) return 'AI Explorer'
    if (score >= 35) return 'AI Beginner'
    return 'AI Starter'
  }

  private generateEnhancedStaticInsights(context: AssessmentContext): PersonalizedInsight[] {
    // Fallback insights when AI is unavailable
    const insights: PersonalizedInsight[] = []
    const { dimensionScores, industry, overallScore } = context
    
    // Generate insights for lowest scoring dimensions
    const sortedDimensions = Object.entries(dimensionScores)
      .sort(([, a], [, b]) => a - b)
      .slice(0, 3)
    
    sortedDimensions.forEach(([dimension, score]) => {
      insights.push({
        type: score < 50 ? 'risk' : 'opportunity',
        dimension,
        priority: score < 40 ? 'high' : score < 60 ? 'medium' : 'low',
        insight: `${dimension} requires attention with current score of ${score}% in ${industry} sector`,
        actionItems: this.getStaticActionItems(dimension),
        businessImpact: this.getStaticBusinessImpact(dimension, industry),
        timeline: score < 40 ? '1-3 months' : '3-6 months',
        investmentLevel: score < 40 ? 'high' : 'medium'
      })
    })
    
    return insights
  }

  private getStaticActionItems(dimension: string): string[] {
    const actionMap: Record<string, string[]> = {
      'Strategic Alignment': [
        'Develop comprehensive AI strategy document',
        'Establish AI steering committee',
        'Align AI initiatives with business objectives'
      ],
      'Architecture & Infrastructure': [
        'Assess cloud infrastructure readiness',
        'Implement scalable data pipelines',
        'Establish MLOps capabilities'
      ],
      'Foundation & Governance': [
        'Create AI governance framework',
        'Establish risk management protocols',
        'Implement compliance procedures'
      ],
      'Ethics & Trust': [
        'Develop AI ethics guidelines',
        'Implement bias testing protocols',
        'Establish transparency requirements'
      ],
      'Data & Analytics': [
        'Improve data quality processes',
        'Implement data governance',
        'Build analytics capabilities'
      ],
      'Innovation & Agility': [
        'Establish innovation labs',
        'Create experimentation processes',
        'Build rapid prototyping capabilities'
      ],
      'Workforce & Culture': [
        'Implement AI literacy training',
        'Develop change management programs',
        'Foster AI-positive culture'
      ],
      'Execution & Operations': [
        'Establish AI project management',
        'Implement monitoring systems',
        'Develop maintenance protocols'
      ]
    }
    
    return actionMap[dimension] || []
  }

  private getStaticBusinessImpact(dimension: string, industry: string): string {
    return `Improving ${dimension} capabilities will enhance competitive positioning and operational efficiency in the ${industry} sector`
  }
}

// Utility function to format insights for display
export const formatInsightForDisplay = (insight: PersonalizedInsight): string => {
  const priorityIcon = insight.priority === 'high' ? '🔴' : insight.priority === 'medium' ? '🟡' : '🟢'
  const typeIcon = insight.type === 'strength' ? '💪' : insight.type === 'risk' ? '⚠️' : insight.type === 'recommendation' ? '💡' : '🎯'
  
  return `${priorityIcon} ${typeIcon} ${insight.insight}`
}