// Smart Lead Scoring System for SAFE-8 Assessments

export interface LeadProfile {
  id: number
  email: string
  companyName: string
  contactName: string
  jobTitle?: string
  industry: string
  companySize?: string
  overallScore: number
  dimensionScores: Record<string, number>
  assessmentType: string
  completedAt: string
}

export interface LeadScore {
  totalScore: number
  urgency: number
  budget: number
  authority: number
  need: number
  timing: number
  priority: 'HOT' | 'WARM' | 'COLD'
  reasoning: string[]
  recommendedActions: string[]
  followUpTimeline: string
}

export class LeadScoringEngine {
  
  scoreLeads(leads: LeadProfile[]): (LeadProfile & { leadScore: LeadScore })[] {
    return leads.map(lead => ({
      ...lead,
      leadScore: this.calculateLeadScore(lead)
    }))
  }

  private calculateLeadScore(lead: LeadProfile): LeadScore {
    const urgency = this.calculateUrgency(lead)
    const budget = this.calculateBudget(lead)
    const authority = this.calculateAuthority(lead)
    const need = this.calculateNeed(lead)
    const timing = this.calculateTiming(lead)
    
    const totalScore = (urgency * 0.25) + (budget * 0.25) + (authority * 0.2) + (need * 0.2) + (timing * 0.1)
    
    const priority = this.determinePriority(totalScore)
    const reasoning = this.generateReasoning(lead, { urgency, budget, authority, need, timing })
    const recommendedActions = this.generateRecommendedActions(lead, priority)
    const followUpTimeline = this.determineFollowUpTimeline(priority, urgency)
    
    return {
      totalScore: Math.round(totalScore),
      urgency: Math.round(urgency),
      budget: Math.round(budget), 
      authority: Math.round(authority),
      need: Math.round(need),
      timing: Math.round(timing),
      priority,
      reasoning,
      recommendedActions,
      followUpTimeline
    }
  }

  private calculateUrgency(lead: LeadProfile): number {
    let score = 0
    
    // Score based on AI readiness gaps
    if (lead.overallScore < 40) {
      score += 90 // Critical gaps = high urgency
    } else if (lead.overallScore < 60) {
      score += 70 // Moderate gaps = medium urgency
    } else if (lead.overallScore < 75) {
      score += 50 // Minor gaps = some urgency
    } else {
      score += 20 // Optimization opportunities
    }
    
    // Industry-specific urgency factors
    const highUrgencyIndustries = ['Financial Services', 'Technology', 'Healthcare']
    if (highUrgencyIndustries.includes(lead.industry)) {
      score += 10
    }
    
    // Assessment type indicates seriousness
    const assessmentTypeScore = {
      'FRONTIER': 15, // Most serious
      'ADVANCED': 10,
      'CORE': 5
    }
    score += assessmentTypeScore[lead.assessmentType as keyof typeof assessmentTypeScore] || 0
    
    return Math.min(score, 100)
  }

  private calculateBudget(lead: LeadProfile): number {
    let score = 50 // Base score
    
    // Company size indicates budget capacity
    const companySizeScores = {
      '1000+': 90,
      '201-1000': 75,
      '51-200': 60,
      '11-50': 40,
      '1-10': 20
    }
    
    if (lead.companySize) {
      score = companySizeScores[lead.companySize as keyof typeof companySizeScores] || score
    }
    
    // Industry budget likelihood
    const highBudgetIndustries = ['Financial Services', 'Technology', 'Manufacturing']
    const mediumBudgetIndustries = ['Healthcare', 'Professional Services']
    
    if (highBudgetIndustries.includes(lead.industry)) {
      score += 15
    } else if (mediumBudgetIndustries.includes(lead.industry)) {
      score += 5
    }
    
    // Low AI readiness often correlates with higher budget availability
    if (lead.overallScore < 50) {
      score += 10
    }
    
    return Math.min(score, 100)
  }

  private calculateAuthority(lead: LeadProfile): number {
    if (!lead.jobTitle) return 50 // Default if unknown
    
    const title = lead.jobTitle.toLowerCase()
    
    // C-level executives
    if (title.includes('ceo') || title.includes('cto') || title.includes('cdo') || 
        title.includes('chief')) {
      return 95
    }
    
    // VPs and Directors
    if (title.includes('vp') || title.includes('vice president') || 
        title.includes('director') || title.includes('head of')) {
      return 80
    }
    
    // Senior management
    if (title.includes('senior') || title.includes('lead') || title.includes('principal')) {
      return 65
    }
    
    // Management roles
    if (title.includes('manager') || title.includes('supervisor')) {
      return 50
    }
    
    // Individual contributors
    return 30
  }

  private calculateNeed(lead: LeadProfile): number {
    let score = 0
    
    // Overall score indicates need level
    if (lead.overallScore < 30) {
      score = 95 // Critical need
    } else if (lead.overallScore < 50) {
      score = 80 // High need
    } else if (lead.overallScore < 70) {
      score = 60 // Moderate need
    } else if (lead.overallScore < 85) {
      score = 40 // Some need for optimization
    } else {
      score = 20 // Limited need
    }
    
    // Multiple low-scoring dimensions indicate complex needs
    const lowScores = Object.values(lead.dimensionScores).filter(score => score < 50)
    score += Math.min(lowScores.length * 5, 20)
    
    return Math.min(score, 100)
  }

  private calculateTiming(lead: LeadProfile): number {
    let score = 50 // Base timing score
    
    // Recent assessment completion indicates active evaluation
    const completedDate = new Date(lead.completedAt)
    const daysSinceCompletion = Math.floor((Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysSinceCompletion <= 1) {
      score = 90 // Very recent
    } else if (daysSinceCompletion <= 3) {
      score = 75 // Recent
    } else if (daysSinceCompletion <= 7) {
      score = 60 // This week
    } else if (daysSinceCompletion <= 30) {
      score = 40 // This month
    } else {
      score = 20 // Older
    }
    
    return score
  }

  private determinePriority(totalScore: number): 'HOT' | 'WARM' | 'COLD' {
    if (totalScore >= 75) return 'HOT'
    if (totalScore >= 55) return 'WARM'
    return 'COLD'
  }

  private generateReasoning(lead: LeadProfile, scores: any): string[] {
    const reasoning = []
    
    if (scores.urgency >= 80) {
      reasoning.push(`Critical AI readiness gaps (${lead.overallScore}%) create urgent need for improvement`)
    }
    
    if (scores.authority >= 80) {
      reasoning.push(`Decision-maker role (${lead.jobTitle}) enables direct purchasing authority`)
    }
    
    if (scores.budget >= 75) {
      reasoning.push(`Company size (${lead.companySize}) and industry (${lead.industry}) indicate strong budget capacity`)
    }
    
    if (scores.timing >= 75) {
      reasoning.push('Recent assessment completion indicates active evaluation phase')
    }
    
    if (lead.assessmentType === 'FRONTIER') {
      reasoning.push('Advanced assessment type shows serious AI transformation interest')
    }
    
    const lowDimensions = Object.entries(lead.dimensionScores)
      .filter(([_, score]) => score < 40)
      .map(([dimension]) => dimension)
    
    if (lowDimensions.length >= 2) {
      reasoning.push(`Multiple critical gaps in ${lowDimensions.slice(0, 2).join(' and ')} require comprehensive solution`)
    }
    
    return reasoning
  }

  private generateRecommendedActions(lead: LeadProfile, priority: 'HOT' | 'WARM' | 'COLD'): string[] {
    const actions = []
    
    if (priority === 'HOT') {
      actions.push('Schedule immediate consultation call within 24 hours')
      actions.push('Prepare custom proposal based on assessment gaps')
      actions.push('Assign senior consultant for direct engagement')
      
      if (lead.overallScore < 40) {
        actions.push('Position comprehensive AI readiness audit')
      }
    } else if (priority === 'WARM') {
      actions.push('Schedule discovery call within 3-5 days')
      actions.push('Send targeted case studies for their industry')
      actions.push('Invite to upcoming AI readiness workshop')
      
      const lowestDimension = Object.entries(lead.dimensionScores)
        .reduce((min, curr) => curr[1] < min[1] ? curr : min)[0]
      
      actions.push(`Highlight expertise in ${lowestDimension} improvement`)
    } else {
      actions.push('Add to nurture campaign with monthly check-ins')
      actions.push('Send quarterly industry benchmark reports')
      actions.push('Invite to webinars and thought leadership content')
    }
    
    return actions
  }

  private determineFollowUpTimeline(priority: 'HOT' | 'WARM' | 'COLD', urgency: number): string {
    if (priority === 'HOT') {
      return urgency >= 90 ? 'Within 4 hours' : 'Within 24 hours'
    } else if (priority === 'WARM') {
      return urgency >= 70 ? 'Within 2-3 days' : 'Within 1 week'
    } else {
      return 'Monthly nurture sequence'
    }
  }
}

// Lead qualification utilities
export const getQualificationSummary = (leadScore: LeadScore): string => {
  const { priority, totalScore } = leadScore
  
  if (priority === 'HOT') {
    return `🔥 Hot Lead (${totalScore}/100) - Immediate action required`
  } else if (priority === 'WARM') {
    return `⚡ Warm Lead (${totalScore}/100) - Strong potential, schedule follow-up`
  } else {
    return `❄️ Cold Lead (${totalScore}/100) - Add to nurture campaign`
  }
}

export const getNextAction = (leadScore: LeadScore): string => {
  return leadScore.recommendedActions[0] || 'Add to general follow-up list'
}