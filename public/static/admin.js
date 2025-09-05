// SAFE-8 Admin Dashboard
class AdminDashboard {
    constructor() {
        this.leads = []
        this.analytics = null
        this.currentView = 'dashboard'
        this.init()
    }
    
    async init() {
        await this.loadDashboard()
    }
    
    async loadAnalytics() {
        try {
            const response = await axios.get('/api/admin/analytics')
            this.analytics = response.data
        } catch (error) {
            console.error('Error loading analytics:', error)
        }
    }
    
    async loadLeads() {
        try {
            const response = await axios.get('/api/admin/leads')
            this.leads = response.data.leads
        } catch (error) {
            console.error('Error loading leads:', error)
        }
    }
    
    async loadDashboard() {
        await Promise.all([this.loadAnalytics(), this.loadLeads()])
        this.renderDashboard()
    }
    
    renderDashboard() {
        document.getElementById('admin-app').innerHTML = `
            <div class="min-h-screen bg-gray-100">
                <!-- Header -->
                <div class="forvis-gradient shadow-lg">
                    <div class="container mx-auto px-4 py-6">
                        <div class="flex justify-between items-center">
                            <div>
                                <h1 class="text-2xl font-bold text-white">SAFE-8 Admin Dashboard</h1>
                                <p class="text-blue-100">Forvis Mazars Digital Advisory 2.0</p>
                            </div>
                            <div class="flex space-x-4">
                                <button onclick="admin.setView('dashboard')" class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors">
                                    <i class="fas fa-chart-line mr-2"></i>Dashboard
                                </button>
                                <button onclick="admin.setView('leads')" class="px-4 py-2 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors">
                                    <i class="fas fa-users mr-2"></i>Leads
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="container mx-auto px-4 py-8">
                    <div id="content-area">
                        ${this.renderAnalyticsDashboard()}
                    </div>
                </div>
            </div>
        `
        
        // Initialize charts
        setTimeout(() => this.initCharts(), 100)
    }
    
    renderAnalyticsDashboard() {
        if (!this.analytics) return '<div class="text-center py-8">Loading analytics...</div>'
        
        return `
            <!-- Key Metrics -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-blue-100 rounded-lg">
                            <i class="fas fa-users text-blue-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Total Leads</p>
                            <p class="text-2xl font-bold text-gray-800">${this.analytics.totalLeads}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-green-100 rounded-lg">
                            <i class="fas fa-clipboard-check text-green-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Assessments Completed</p>
                            <p class="text-2xl font-bold text-gray-800">${this.analytics.totalAssessments}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-yellow-100 rounded-lg">
                            <i class="fas fa-chart-line text-yellow-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Average Score</p>
                            <p class="text-2xl font-bold text-gray-800">${this.analytics.averageScore}%</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <div class="flex items-center">
                        <div class="p-3 bg-purple-100 rounded-lg">
                            <i class="fas fa-percentage text-purple-600 text-xl"></i>
                        </div>
                        <div class="ml-4">
                            <p class="text-sm font-medium text-gray-600">Completion Rate</p>
                            <p class="text-2xl font-bold text-gray-800">${Math.round((this.analytics.totalAssessments / this.analytics.totalLeads) * 100)}%</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Charts Row -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <!-- Industry Distribution -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Industry Distribution</h3>
                    <div class="h-64">
                        <canvas id="industryChart"></canvas>
                    </div>
                </div>
                
                <!-- Recent Assessments -->
                <div class="bg-white rounded-lg shadow-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Assessment Scores</h3>
                    <div class="h-64">
                        <canvas id="scoresChart"></canvas>
                    </div>
                </div>
            </div>
            
            <!-- Recent Assessments Table -->
            <div class="bg-white rounded-lg shadow-lg">
                <div class="p-6 border-b border-gray-200">
                    <h3 class="text-lg font-semibold text-gray-800">Recent Assessments</h3>
                </div>
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            ${this.analytics.recentAssessments.map(assessment => `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">${assessment.company_name}</td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${assessment.industry}</td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getTypeColor(assessment.assessment_type)}">
                                            ${assessment.assessment_type}
                                        </span>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap">
                                        <div class="flex items-center">
                                            <span class="text-sm font-medium text-gray-900">${assessment.overall_score}%</span>
                                            <div class="ml-2 w-16 bg-gray-200 rounded-full h-2">
                                                <div class="h-2 rounded-full ${this.getScoreColor(assessment.overall_score)}" 
                                                     style="width: ${assessment.overall_score}%"></div>
                                            </div>
                                        </div>
                                    </td>
                                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(assessment.completed_at).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        `
    }
    
    renderLeadsView() {
        return `
            <!-- Leads Header -->
            <div class="flex justify-between items-center mb-8">
                <h2 class="text-2xl font-bold text-gray-800">Lead Management</h2>
                <div class="flex space-x-4">
                    <input type="text" id="leadSearch" placeholder="Search leads..." 
                           class="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           onkeyup="admin.filterLeads(this.value)">
                    <button onclick="admin.exportLeads()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        <i class="fas fa-download mr-2"></i>Export CSV
                    </button>
                </div>
            </div>
            
            <!-- Leads Table -->
            <div class="bg-white rounded-lg shadow-lg overflow-hidden">
                <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50">
                            <tr>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assessments</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="leads-table-body" class="bg-white divide-y divide-gray-200">
                            ${this.renderLeadsTableRows()}
                        </tbody>
                    </table>
                </div>
            </div>
        `
    }
    
    renderLeadsTableRows(filteredLeads = null) {
        const leadsToRender = filteredLeads || this.leads
        
        return leadsToRender.map(lead => `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div>
                        <div class="text-sm font-medium text-gray-900">${lead.contact_name}</div>
                        <div class="text-sm text-gray-500">${lead.email}</div>
                        ${lead.phone_number ? `<div class="text-sm text-gray-500">${lead.phone_number}</div>` : ''}
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">${lead.company_name}</div>
                    ${lead.job_title ? `<div class="text-sm text-gray-500">${lead.job_title}</div>` : ''}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${lead.industry}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${lead.assessment_count > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}">
                        ${lead.assessment_count} completed
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-medium rounded-full ${this.getStatusColor(lead.status)}">
                        ${lead.status}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${new Date(lead.created_at).toLocaleDateString()}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="admin.viewLead(${lead.id})" class="text-blue-600 hover:text-blue-900">View</button>
                        <button onclick="admin.updateLeadStatus(${lead.id})" class="text-green-600 hover:text-green-900">Update</button>
                    </div>
                </td>
            </tr>
        `).join('')
    }
    
    setView(view) {
        this.currentView = view
        const contentArea = document.getElementById('content-area')
        
        if (view === 'dashboard') {
            contentArea.innerHTML = this.renderAnalyticsDashboard()
            setTimeout(() => this.initCharts(), 100)
        } else if (view === 'leads') {
            contentArea.innerHTML = this.renderLeadsView()
        }
    }
    
    filterLeads(searchTerm) {
        const filtered = this.leads.filter(lead => 
            lead.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.industry.toLowerCase().includes(searchTerm.toLowerCase())
        )
        
        document.getElementById('leads-table-body').innerHTML = this.renderLeadsTableRows(filtered)
    }
    
    initCharts() {
        this.initIndustryChart()
        this.initScoresChart()
    }
    
    initIndustryChart() {
        const ctx = document.getElementById('industryChart')?.getContext('2d')
        if (!ctx || !this.analytics) return
        
        const labels = this.analytics.industryDistribution.map(item => item.industry)
        const data = this.analytics.industryDistribution.map(item => item.count)
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#0072CE', '#171C8F', '#10B981', '#F59E0B',
                        '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        })
    }
    
    initScoresChart() {
        const ctx = document.getElementById('scoresChart')?.getContext('2d')
        if (!ctx || !this.analytics) return
        
        const labels = this.analytics.recentAssessments.map(assessment => 
            assessment.company_name.substring(0, 15) + (assessment.company_name.length > 15 ? '...' : '')
        )
        const scores = this.analytics.recentAssessments.map(assessment => assessment.overall_score)
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'AI Readiness Score',
                    data: scores,
                    backgroundColor: '#0072CE',
                    borderColor: '#171C8F',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        })
    }
    
    getTypeColor(type) {
        const colors = {
            'CORE': 'bg-green-100 text-green-800',
            'ADVANCED': 'bg-blue-100 text-blue-800',
            'FRONTIER': 'bg-purple-100 text-purple-800'
        }
        return colors[type] || 'bg-gray-100 text-gray-800'
    }
    
    getScoreColor(score) {
        if (score >= 75) return 'bg-green-500'
        if (score >= 60) return 'bg-blue-500'
        if (score >= 45) return 'bg-yellow-500'
        return 'bg-red-500'
    }
    
    getStatusColor(status) {
        const colors = {
            'NEW': 'bg-blue-100 text-blue-800',
            'CONTACTED': 'bg-yellow-100 text-yellow-800',
            'QUALIFIED': 'bg-green-100 text-green-800',
            'CLOSED': 'bg-gray-100 text-gray-800'
        }
        return colors[status] || 'bg-gray-100 text-gray-800'
    }
    
    viewLead(leadId) {
        // Implementation for viewing lead details
        alert(`Viewing lead ${leadId} - Feature to be implemented`)
    }
    
    updateLeadStatus(leadId) {
        // Implementation for updating lead status
        alert(`Updating lead ${leadId} status - Feature to be implemented`)
    }
    
    exportLeads() {
        // Simple CSV export
        const csvContent = [
            ['Name', 'Email', 'Company', 'Industry', 'Phone', 'Status', 'Created', 'Assessments'].join(','),
            ...this.leads.map(lead => [
                lead.contact_name,
                lead.email,
                lead.company_name,
                lead.industry,
                lead.phone_number || '',
                lead.status,
                new Date(lead.created_at).toLocaleDateString(),
                lead.assessment_count
            ].join(','))
        ].join('\\n')
        
        const blob = new Blob([csvContent], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `safe8-leads-${new Date().toISOString().split('T')[0]}.csv`
        a.click()
        window.URL.revokeObjectURL(url)
    }
}

// Initialize the admin dashboard
const admin = new AdminDashboard()