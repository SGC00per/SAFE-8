// SAFE-8 Assessment Application
class SAFE8Assessment {
    constructor() {
        this.currentStep = 'welcome'
        this.selectedAssessmentType = null
        this.selectedIndustry = null
        this.currentQuestionIndex = 0
        this.questions = []
        this.responses = {}
        this.leadData = null
        this.assessmentResults = null
        
        // Industry options
        this.industries = [
            'Financial Services', 'Technology', 'Healthcare', 'Manufacturing',
            'Retail & E-commerce', 'Energy & Utilities', 'Government',
            'Education', 'Professional Services', 'Other'
        ]
        
        this.init()
    }
    
    async init() {
        await this.showWelcomeScreen()
        this.hideLoadingScreen()
    }
    
    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen')
        if (loadingScreen) {
            loadingScreen.style.display = 'none'
        }
    }
    
    async showWelcomeScreen() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen forvis-gradient">
                <!-- Header -->
                <div class="container mx-auto px-4 pt-8 pb-4">
                    <div class="text-center text-white mb-8">
                        <h1 class="text-3xl md:text-5xl font-bold mb-4">SAFE-8 AI Readiness Framework</h1>
                        <p class="text-xl mb-2">Accelerating AI Transformation with Confidence</p>
                        <p class="text-lg opacity-90">Companies in the top quartile of AI readiness grow EBIT 17% faster</p>
                    </div>
                </div>
                
                <!-- Main Content -->
                <div class="bg-white rounded-t-3xl min-h-screen shadow-2xl">
                    <div class="container mx-auto px-4 py-8">
                        <div class="max-w-4xl mx-auto">
                            <!-- Assessment Level Selection -->
                            <div class="mb-12">
                                <h2 class="text-3xl font-bold text-gray-800 mb-6 text-center">Choose Your Assessment Level</h2>
                                
                                <div class="grid md:grid-cols-3 gap-6 mb-8">
                                    <div class="assessment-card bg-white rounded-xl p-6 shadow-lg cursor-pointer" data-assessment-type="CORE">
                                        <div class="text-center mb-4">
                                            <i class="fas fa-rocket text-4xl text-blue-600 mb-3"></i>
                                            <h3 class="text-xl font-semibold text-gray-800">Core Assessment</h3>
                                            <p class="text-sm text-gray-600">25 questions • ~5 minutes</p>
                                        </div>
                                        <ul class="text-sm text-gray-700 space-y-2">
                                            <li>• AI strategy alignment</li>
                                            <li>• Governance essentials</li>
                                            <li>• Basic readiness factors</li>
                                        </ul>
                                        <div class="mt-4 text-center">
                                            <span class="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">Executives & Leaders</span>
                                        </div>
                                    </div>
                                    
                                    <div class="assessment-card bg-white rounded-xl p-6 shadow-lg cursor-pointer" data-assessment-type="ADVANCED">
                                        <div class="text-center mb-4">
                                            <i class="fas fa-cogs text-4xl text-blue-600 mb-3"></i>
                                            <h3 class="text-xl font-semibold text-gray-800">Advanced Assessment</h3>
                                            <p class="text-sm text-gray-600">45 questions • ~9 minutes</p>
                                        </div>
                                        <ul class="text-sm text-gray-700 space-y-2">
                                            <li>• Technical infrastructure</li>
                                            <li>• Data pipeline maturity</li>
                                            <li>• Advanced capabilities</li>
                                        </ul>
                                        <div class="mt-4 text-center">
                                            <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">CIOs & Technical Leaders</span>
                                        </div>
                                    </div>
                                    
                                    <div class="assessment-card bg-white rounded-xl p-6 shadow-lg cursor-pointer" data-assessment-type="FRONTIER">
                                        <div class="text-center mb-4">
                                            <i class="fas fa-brain text-4xl text-blue-600 mb-3"></i>
                                            <h3 class="text-xl font-semibold text-gray-800">Frontier Assessment</h3>
                                            <p class="text-sm text-gray-600">60 questions • ~12 minutes</p>
                                        </div>
                                        <ul class="text-sm text-gray-700 space-y-2">
                                            <li>• Next-gen capabilities</li>
                                            <li>• Multi-agent orchestration</li>
                                            <li>• Cutting-edge readiness</li>
                                        </ul>
                                        <div class="mt-4 text-center">
                                            <span class="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">AI Centers of Excellence</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <!-- Industry Selection -->
                                <div id="industry-section" class="hidden">
                                    <h3 class="text-2xl font-semibold text-gray-800 mb-4 text-center">Select Your Industry</h3>
                                    <p class="text-center text-gray-600 mb-6">This helps us provide tailored insights and benchmarking</p>
                                    
                                    <div class="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                                        ${this.industries.map(industry => `
                                            <button class="industry-btn p-3 bg-gray-100 hover:bg-blue-100 rounded-lg text-sm font-medium transition-colors"
                                                    data-industry="${industry}">${industry}</button>
                                        `).join('')}
                                    </div>
                                    
                                    <div class="text-center">
                                        <button id="start-assessment-btn" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                disabled>
                                            Start SAFE-8 Assessment
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        
        // Add event listeners after DOM is updated
        setTimeout(() => this.attachEventListeners(), 100)
    }
    
    attachEventListeners() {
        // Assessment type selection
        document.querySelectorAll('.assessment-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const type = e.currentTarget.getAttribute('data-assessment-type')
                this.selectAssessmentType(type)
            })
        })
        
        // Industry selection  
        document.querySelectorAll('.industry-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const industry = e.currentTarget.getAttribute('data-industry')
                this.selectIndustry(industry)
            })
        })
        
        // Start assessment button
        const startBtn = document.getElementById('start-assessment-btn')
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.showLeadForm()
            })
        }
    }
    
    selectAssessmentType(type) {
        console.log('Selected assessment type:', type)
        this.selectedAssessmentType = type
        
        // Update UI
        document.querySelectorAll('.assessment-card').forEach(card => {
            card.classList.remove('selected')
        })
        
        // Find and highlight the selected card
        document.querySelectorAll('.assessment-card').forEach(card => {
            if (card.getAttribute('data-assessment-type') === type) {
                card.classList.add('selected')
            }
        })
        
        // Show industry section
        const industrySection = document.getElementById('industry-section')
        if (industrySection) {
            industrySection.classList.remove('hidden')
            industrySection.scrollIntoView({ behavior: 'smooth' })
        }
    }
    
    selectIndustry(industry) {
        console.log('Selected industry:', industry)
        this.selectedIndustry = industry
        
        // Update UI
        document.querySelectorAll('.industry-btn').forEach(btn => {
            btn.classList.remove('bg-blue-600', 'text-white')
            btn.classList.add('bg-gray-100', 'hover:bg-blue-100')
        })
        
        // Find and highlight the selected industry button
        document.querySelectorAll('.industry-btn').forEach(btn => {
            if (btn.getAttribute('data-industry') === industry) {
                btn.classList.remove('bg-gray-100', 'hover:bg-blue-100')
                btn.classList.add('bg-blue-600', 'text-white')
            }
        })
        
        // Enable start button
        const startBtn = document.getElementById('start-assessment-btn')
        if (startBtn) {
            startBtn.disabled = false
        }
    }
    
    showLeadForm() {
        console.log('Showing lead form. Current state:', {
            selectedAssessmentType: this.selectedAssessmentType,
            selectedIndustry: this.selectedIndustry
        });
        
        if (!this.selectedAssessmentType || !this.selectedIndustry) {
            alert('Please select both an assessment type and industry first.');
            return;
        }
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-50 py-8">
                <div class="container mx-auto px-4">
                    <div class="max-w-2xl mx-auto">
                        <div class="text-center mb-8">
                            <h1 class="text-3xl font-bold text-gray-800 mb-4">Contact Information</h1>
                            <p class="text-gray-600">We'll use this information to provide personalized insights and send your results</p>
                        </div>
                        
                        <div class="bg-white rounded-xl shadow-lg p-8">
                            <form id="lead-form" onsubmit="app.submitLeadForm(event)">
                                <div class="grid md:grid-cols-2 gap-6">
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Contact Name *</label>
                                        <input type="text" id="contactName" required 
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Job Title</label>
                                        <input type="text" id="jobTitle"
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                                        <input type="email" id="email" required
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input type="tel" id="phoneNumber"
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                        <input type="text" id="companyName" required
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                    
                                    <div>
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                                        <select id="companySize" class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option value="">Select company size</option>
                                            <option value="1-10">1-10 employees</option>
                                            <option value="11-50">11-50 employees</option>
                                            <option value="51-200">51-200 employees</option>
                                            <option value="201-1000">201-1000 employees</option>
                                            <option value="1000+">1000+ employees</option>
                                        </select>
                                    </div>
                                    
                                    <div class="md:col-span-2">
                                        <label class="block text-sm font-medium text-gray-700 mb-2">Country</label>
                                        <input type="text" id="country"
                                               class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                    </div>
                                </div>
                                
                                <div class="mt-8 text-center">
                                    <button type="submit" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
                                        Begin Assessment
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
    
    async submitLeadForm(event) {
        event.preventDefault()
        
        const leadData = {
            contactName: document.getElementById('contactName').value,
            email: document.getElementById('email').value,
            companyName: document.getElementById('companyName').value,
            phoneNumber: document.getElementById('phoneNumber').value,
            jobTitle: document.getElementById('jobTitle').value,
            industry: this.selectedIndustry,
            companySize: document.getElementById('companySize').value,
            country: document.getElementById('country').value
        }
        
        try {
            const response = await axios.post('/api/leads', leadData)
            this.leadData = { ...leadData, id: response.data.leadId }
            
            // Load questions and start assessment
            await this.loadQuestions()
            this.startAssessment()
        } catch (error) {
            console.error('Error saving lead:', error)
            alert('Error saving information. Please try again.')
        }
    }
    
    async loadQuestions() {
        try {
            console.log('Loading questions for assessment type:', this.selectedAssessmentType)
            if (!this.selectedAssessmentType) {
                console.error('No assessment type selected!')
                alert('Please select an assessment type first.')
                return
            }
            const response = await axios.get(`/api/questions/${this.selectedAssessmentType}`)
            this.questions = response.data.questions
            console.log(`Loaded ${this.questions.length} questions`)
        } catch (error) {
            console.error('Error loading questions:', error)
            alert('Error loading assessment. Please try again.')
        }
    }
    
    startAssessment() {
        this.currentQuestionIndex = 0
        this.responses = {}
        this.showQuestion()
    }
    
    showQuestion() {
        if (!this.questions || this.questions.length === 0) {
            alert('No questions loaded. Please try again.')
            return
        }
        
        if (this.currentQuestionIndex >= this.questions.length) {
            this.showResults()
            return
        }
        
        const question = this.questions[this.currentQuestionIndex]
        const progress = Math.round((this.currentQuestionIndex / this.questions.length) * 100)
        const currentScore = this.calculateCurrentScore()
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-50">
                <!-- Progress Header -->
                <div class="bg-white shadow-sm">
                    <div class="container mx-auto px-4 py-4">
                        <div class="flex justify-between items-center mb-4">
                            <div>
                                <h1 class="text-xl font-semibold text-gray-800">SAFE-8 AI Readiness Assessment</h1>
                                <p class="text-sm text-gray-600">${this.selectedAssessmentType} • ${this.selectedIndustry}</p>
                            </div>
                            <div class="text-right">
                                <div class="text-2xl font-bold text-blue-600">${currentScore}%</div>
                                <div class="text-sm text-gray-600">Live AI Maturity Score</div>
                            </div>
                        </div>
                        
                        <div class="mb-2 flex justify-between text-sm text-gray-600">
                            <span>Progress: Question ${this.currentQuestionIndex + 1} of ${this.questions.length}</span>
                            <span>${progress}% Complete</span>
                        </div>
                        <div class="w-full bg-gray-200 rounded-full h-2">
                            <div class="progress-bar h-2 rounded-full transition-all duration-500" style="width: ${progress}%"></div>
                        </div>
                    </div>
                </div>
                
                <!-- Question Content -->
                <div class="container mx-auto px-4 py-8">
                    <div class="max-w-3xl mx-auto">
                        <div class="bg-white rounded-xl shadow-lg p-8">
                            <div class="mb-6">
                                <div class="text-sm text-blue-600 font-medium mb-2">${question.dimension}</div>
                                <h2 class="text-xl font-semibold text-gray-800 leading-relaxed">${question.question_text}</h2>
                            </div>
                            
                            <div class="space-y-3">
                                ${[
                                    { value: 4, text: 'Strongly Agree', color: 'bg-green-50 hover:bg-green-100 border-green-200' },
                                    { value: 3, text: 'Agree', color: 'bg-blue-50 hover:bg-blue-100 border-blue-200' },
                                    { value: 2, text: 'Disagree', color: 'bg-yellow-50 hover:bg-yellow-100 border-yellow-200' },
                                    { value: 1, text: 'Strongly Disagree', color: 'bg-red-50 hover:bg-red-100 border-red-200' },
                                    { value: 0, text: 'Not Applicable / Don\'t Know', color: 'bg-gray-50 hover:bg-gray-100 border-gray-200' }
                                ].map(option => `
                                    <button class="likert-option w-full p-4 text-left border-2 rounded-lg transition-all ${option.color}"
                                            onclick="app.selectAnswer(${question.id}, ${option.value})">
                                        <div class="flex items-center">
                                            <div class="w-4 h-4 border-2 border-gray-400 rounded-full mr-3 flex-shrink-0"></div>
                                            <span class="font-medium">${option.text}</span>
                                        </div>
                                    </button>
                                `).join('')}
                            </div>
                            
                            <div class="mt-8 flex justify-between">
                                <button onclick="app.previousQuestion()" 
                                        class="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors ${this.currentQuestionIndex === 0 ? 'invisible' : ''}">
                                    <i class="fas fa-arrow-left mr-2"></i>Previous
                                </button>
                                
                                <button id="next-btn" onclick="app.nextQuestion()" 
                                        class="px-6 py-2 bg-gray-300 text-gray-500 rounded-lg transition-colors cursor-not-allowed"
                                        disabled>
                                    Next<i class="fas fa-arrow-right ml-2"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
    }
    
    selectAnswer(questionId, value) {
        this.responses[questionId] = value
        
        // Update UI
        document.querySelectorAll('.likert-option').forEach(option => {
            option.classList.remove('selected', 'border-blue-500', 'bg-blue-100')
        })
        event.currentTarget.classList.add('selected', 'border-blue-500', 'bg-blue-100')
        
        // Update radio button appearance
        document.querySelectorAll('.likert-option .w-4').forEach(radio => {
            radio.innerHTML = ''
            radio.classList.remove('bg-blue-600', 'border-blue-600')
            radio.classList.add('border-gray-400')
        })
        const selectedRadio = event.currentTarget.querySelector('.w-4')
        selectedRadio.innerHTML = '<div class="w-2 h-2 bg-white rounded-full m-0.5"></div>'
        selectedRadio.classList.remove('border-gray-400')
        selectedRadio.classList.add('bg-blue-600', 'border-blue-600')
        
        // Enable next button
        const nextBtn = document.getElementById('next-btn')
        nextBtn.disabled = false
        nextBtn.classList.remove('bg-gray-300', 'text-gray-500', 'cursor-not-allowed')
        nextBtn.classList.add('bg-blue-600', 'text-white', 'hover:bg-blue-700')
    }
    
    nextQuestion() {
        this.currentQuestionIndex++
        this.showQuestion()
    }
    
    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--
            this.showQuestion()
        }
    }
    
    calculateCurrentScore() {
        const answeredQuestions = Object.keys(this.responses)
        if (answeredQuestions.length === 0) return 0
        
        const totalScore = answeredQuestions.reduce((sum, questionId) => {
            return sum + this.responses[questionId]
        }, 0)
        
        const maxPossibleScore = answeredQuestions.length * 4
        return Math.round((totalScore / maxPossibleScore) * 100)
    }
    
    calculateDimensionScores() {
        const dimensionTotals = {}
        
        this.questions.forEach(question => {
            const questionId = question.id.toString()
            if (this.responses[questionId] !== undefined) {
                if (!dimensionTotals[question.dimension]) {
                    dimensionTotals[question.dimension] = { sum: 0, count: 0 }
                }
                
                dimensionTotals[question.dimension].sum += this.responses[questionId]
                dimensionTotals[question.dimension].count += 1
            }
        })
        
        const dimensionScores = {}
        Object.keys(dimensionTotals).forEach(dimension => {
            const { sum, count } = dimensionTotals[dimension]
            dimensionScores[dimension] = Math.round((sum / count / 4) * 100)
        })
        
        return dimensionScores
    }
    
    async showResults() {
        const dimensionScores = this.calculateDimensionScores()
        const overallScore = this.calculateCurrentScore()
        
        try {
            const submissionData = {
                leadId: this.leadData.id,
                assessmentType: this.selectedAssessmentType,
                industry: this.selectedIndustry,
                responses: this.responses,
                overallScore,
                dimensionScores
            }
            
            console.log('Submitting assessment:', submissionData)
            
            const response = await axios.post('/api/assessments', submissionData)
            
            console.log('Assessment response:', response.data)
            
            this.assessmentResults = response.data
            this.renderResults()
        } catch (error) {
            console.error('Error submitting assessment:', error)
            alert('Error submitting assessment. Please try again.')
        }
    }
    
    renderResults() {
        const { overallScore, dimensionScores, insights, benchmarks } = this.assessmentResults
        
        console.log('Rendering results with data:', {
            overallScore,
            dimensionScores,
            insights,
            insightsLength: insights ? insights.length : 'undefined',
            benchmarks: benchmarks ? benchmarks.length : 'undefined'
        })
        
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen bg-gray-50 py-8">
                <div class="container mx-auto px-4">
                    <div class="max-w-6xl mx-auto">
                        <!-- Header -->
                        <div class="text-center mb-8">
                            <h1 class="text-4xl font-bold text-gray-800 mb-4">Your SAFE-8 AI Readiness Results</h1>
                            <p class="text-xl text-gray-600">${this.leadData.companyName} • ${this.selectedIndustry}</p>
                        </div>
                        
                        <!-- Overall Score -->
                        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                            <div class="text-center">
                                <h2 class="text-2xl font-semibold text-gray-800 mb-4">Overall AI Readiness Score</h2>
                                <div class="text-6xl font-bold text-blue-600 mb-4">${overallScore}%</div>
                                <p class="text-lg text-gray-600">${this.getScoreInterpretation(overallScore)}</p>
                            </div>
                        </div>
                        
                        <!-- Interactive Radar Chart and Enhanced Insights -->
                        <div class="grid lg:grid-cols-2 gap-8 mb-8">
                            <div class="bg-white rounded-xl shadow-lg p-8">
                                <h3 class="text-xl font-semibold text-gray-800 mb-6">Interactive SAFE-8 Readiness Radar</h3>
                                <div class="radar-container mx-auto">
                                    <canvas id="radarChart" style="cursor: pointer;"></canvas>
                                </div>
                                <p class="text-xs text-gray-500 text-center mt-2">💡 Click on any dimension for detailed analysis</p>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-lg p-8">
                                <h3 class="text-xl font-semibold text-gray-800 mb-6">AI-Powered Insights</h3>
                                <div class="space-y-3" id="insights-container">
                                    ${insights && insights.length > 0 ? insights.map((insight, index) => `
                                        <div class="insight-card p-3 bg-gray-50 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors" 
                                             onclick="app.showInsightDetails(${index})">
                                            <p class="text-sm">${insight}</p>
                                            <div class="text-xs text-blue-600 mt-1">Click for detailed recommendations →</div>
                                        </div>
                                    `).join('') : '<div class="p-3 bg-yellow-50 border border-yellow-200 rounded-lg"><p class="text-sm text-yellow-800">Generating AI insights... This may take a moment.</p></div>'}
                                </div>
                                
                                <!-- Action Plan Generator -->
                                <div class="mt-6 pt-6 border-t border-gray-200">
                                    <button onclick="app.generateActionPlan()" 
                                            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                        🎯 Generate 90-Day Action Plan
                                    </button>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Dimension Breakdown -->
                        <div class="bg-white rounded-xl shadow-lg p-8 mb-8">
                            <h3 class="text-xl font-semibold text-gray-800 mb-6">Dimension Breakdown vs Industry Average</h3>
                            <div class="space-y-6">
                                ${Object.entries(dimensionScores).map(([dimension, score]) => {
                                    const benchmark = benchmarks.find(b => b.dimension === dimension)
                                    const industryAvg = benchmark ? benchmark.average_score : 60
                                    
                                    return `
                                        <div>
                                            <div class="flex justify-between mb-2">
                                                <span class="font-medium text-gray-800">${dimension}</span>
                                                <span class="text-blue-600 font-semibold">${score}%</span>
                                            </div>
                                            <div class="w-full bg-gray-200 rounded-full h-3">
                                                <div class="bg-blue-600 h-3 rounded-full relative" style="width: ${score}%">
                                                    <div class="absolute right-0 top-0 w-1 h-3 bg-gray-400" style="left: ${industryAvg}%"></div>
                                                </div>
                                            </div>
                                            <div class="text-xs text-gray-600 mt-1">Industry Average: ${Math.round(industryAvg)}%</div>
                                        </div>
                                    `
                                }).join('')}
                            </div>
                        </div>
                        
                        <!-- CTA Section -->
                        <div class="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl shadow-lg p-8 text-white text-center">
                            <h3 class="text-2xl font-bold mb-4">Ready to Transform Your AI Strategy?</h3>
                            <p class="text-lg mb-6">Get expert recommendations tailored to your results</p>
                            <div class="flex flex-wrap justify-center gap-4 mb-6">
                                <div class="flex items-center">
                                    <i class="fas fa-check-circle mr-2"></i>
                                    <span>No obligation consultation</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-lightbulb mr-2"></i>
                                    <span>Expert insights</span>
                                </div>
                                <div class="flex items-center">
                                    <i class="fas fa-road mr-2"></i>
                                    <span>Tailored action plan</span>
                                </div>
                            </div>
                            <button onclick="app.requestConsultation()" 
                                    class="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                                Schedule Expert Consultation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
        
        // Initialize radar chart and load monitoring status
        setTimeout(() => {
            this.initRadarChart(dimensionScores, benchmarks)
            this.loadMonitoringStatus()
        }, 100)
    }
    
    initRadarChart(dimensionScores, benchmarks) {
        const ctx = document.getElementById('radarChart').getContext('2d')
        
        const labels = Object.keys(dimensionScores)
        const yourScores = Object.values(dimensionScores)
        const industryAvgs = labels.map(label => {
            const benchmark = benchmarks.find(b => b.dimension === label)
            return benchmark ? benchmark.average_score : 60
        })
        
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Your Score',
                    data: yourScores,
                    borderColor: '#0072CE',
                    backgroundColor: 'rgba(0, 114, 206, 0.2)',
                    pointBackgroundColor: '#0072CE'
                }, {
                    label: 'Industry Average',
                    data: industryAvgs,
                    borderColor: '#94A3B8',
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    pointBackgroundColor: '#94A3B8'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            stepSize: 20
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        })
    }
    
    getScoreInterpretation(score) {
        if (score >= 75) return "Excellent AI readiness - Leading position"
        if (score >= 60) return "Strong AI foundation - Well positioned"
        if (score >= 45) return "Moderate readiness - Room for improvement"
        if (score >= 30) return "Developing capabilities - Key gaps to address"
        return "Early stage - Significant opportunity for growth"
    }
    
    showInsightDetails(insightIndex) {
        const insight = this.assessmentResults.insights[insightIndex]
        if (!insight) return
        
        // Show modal with detailed insight breakdown
        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold text-gray-800">Detailed Analysis</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-4">
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-semibold text-blue-800 mb-2">Key Insight</h4>
                            <p class="text-blue-700">${insight}</p>
                        </div>
                        
                        <div class="p-4 bg-green-50 rounded-lg">
                            <h4 class="font-semibold text-green-800 mb-2">Recommended Actions</h4>
                            <ul class="text-green-700 space-y-1">
                                <li>• Conduct detailed assessment of current capabilities</li>
                                <li>• Develop 30-60-90 day improvement plan</li>
                                <li>• Identify key stakeholders and resources needed</li>
                                <li>• Establish success metrics and monitoring</li>
                            </ul>
                        </div>
                        
                        <div class="p-4 bg-yellow-50 rounded-lg">
                            <h4 class="font-semibold text-yellow-800 mb-2">Business Impact</h4>
                            <p class="text-yellow-700">Addressing this area could improve your overall AI readiness by 15-25% and enhance competitive positioning in your industry.</p>
                        </div>
                        
                        <div class="text-center pt-4">
                            <button onclick="app.requestConsultation()" 
                                    class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                                Schedule Expert Consultation
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
    }
    
    generateActionPlan() {
        if (!this.assessmentResults) return
        
        const { dimensionScores, overallScore } = this.assessmentResults
        
        // Find the top 3 improvement areas
        const improvements = Object.entries(dimensionScores)
            .sort(([,a], [,b]) => a - b)
            .slice(0, 3)
        
        const actionPlan = this.createActionPlan(improvements, overallScore)
        this.showActionPlanModal(actionPlan)
    }
    
    createActionPlan(improvements, overallScore) {
        const [weakest, second, third] = improvements
        
        return {
            immediate: {
                title: "Next 30 Days - Foundation Building",
                focus: weakest[0],
                actions: [
                    `Conduct detailed assessment of ${weakest[0]} capabilities`,
                    "Identify quick wins and immediate improvement opportunities", 
                    "Assemble cross-functional improvement team",
                    "Establish baseline metrics and measurement framework"
                ]
            },
            shortTerm: {
                title: "3-6 Months - Capability Development", 
                focus: second[0],
                actions: [
                    `Implement core ${second[0]} improvements`,
                    "Launch pilot programs and proof-of-concepts",
                    "Develop training and change management programs",
                    "Begin integration with existing business processes"
                ]
            },
            longTerm: {
                title: "6-12 Months - Scale and Optimize",
                focus: third[0], 
                actions: [
                    `Scale successful ${third[0]} initiatives`,
                    "Implement advanced capabilities and automation",
                    "Establish continuous improvement processes",
                    "Measure ROI and optimize performance"
                ]
            },
            investment: this.estimateInvestment(overallScore),
            roi: this.estimateROI(overallScore)
        }
    }
    
    estimateInvestment(score) {
        if (score < 40) return "High ($100K-500K) - Significant infrastructure and capability gaps"
        if (score < 60) return "Medium ($50K-200K) - Focused improvements and training needed"  
        return "Low ($10K-75K) - Optimization and advanced feature implementation"
    }
    
    estimateROI(score) {
        if (score < 40) return "18-24 months - Foundation building phase"
        if (score < 60) return "12-18 months - Accelerated improvement phase"
        return "6-12 months - Quick optimization wins"
    }
    
    showActionPlanModal(plan) {
        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-gray-800">Your Personalized 90-Day Action Plan</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <div class="grid md:grid-cols-3 gap-6 mb-6">
                        <div class="p-4 bg-red-50 border border-red-200 rounded-lg">
                            <h4 class="font-bold text-red-800 mb-3">${plan.immediate.title}</h4>
                            <p class="text-sm text-red-700 font-medium mb-2">Focus: ${plan.immediate.focus}</p>
                            <ul class="text-sm text-red-600 space-y-1">
                                ${plan.immediate.actions.map(action => `<li>• ${action}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                            <h4 class="font-bold text-yellow-800 mb-3">${plan.shortTerm.title}</h4>
                            <p class="text-sm text-yellow-700 font-medium mb-2">Focus: ${plan.shortTerm.focus}</p>
                            <ul class="text-sm text-yellow-600 space-y-1">
                                ${plan.shortTerm.actions.map(action => `<li>• ${action}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div class="p-4 bg-green-50 border border-green-200 rounded-lg">
                            <h4 class="font-bold text-green-800 mb-3">${plan.longTerm.title}</h4>
                            <p class="text-sm text-green-700 font-medium mb-2">Focus: ${plan.longTerm.focus}</p>
                            <ul class="text-sm text-green-600 space-y-1">
                                ${plan.longTerm.actions.map(action => `<li>• ${action}</li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    
                    <div class="grid md:grid-cols-2 gap-6 mb-6">
                        <div class="p-4 bg-blue-50 rounded-lg">
                            <h4 class="font-bold text-blue-800 mb-2">Investment Estimate</h4>
                            <p class="text-blue-700">${plan.investment}</p>
                        </div>
                        
                        <div class="p-4 bg-purple-50 rounded-lg">
                            <h4 class="font-bold text-purple-800 mb-2">Expected ROI Timeline</h4>
                            <p class="text-purple-700">${plan.roi}</p>
                        </div>
                    </div>
                    
                    <div class="text-center space-x-4">
                        <button onclick="app.downloadActionPlan()" 
                                class="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium">
                            📄 Download Action Plan PDF
                        </button>
                        <button onclick="app.requestConsultation()" 
                                class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                            📅 Schedule Expert Review
                        </button>
                    </div>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
    }
    
    downloadActionPlan() {
        // Simple implementation - in production you'd generate a proper PDF
        const content = `
SAFE-8 AI Readiness Action Plan
Generated: ${new Date().toLocaleDateString()}
Company: ${this.leadData.companyName}
Overall Score: ${this.assessmentResults.overallScore}%

This would be a downloadable PDF with the complete action plan.
For full implementation, we would integrate with a PDF generation service.
        `
        
        const blob = new Blob([content], { type: 'text/plain' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `SAFE8-ActionPlan-${this.leadData.companyName.replace(/\s+/g, '-')}.txt`
        a.click()
        window.URL.revokeObjectURL(url)
    }
    
    async requestConsultation() {
        if (!this.assessmentResults || !this.leadData) {
            alert('Please complete the assessment first')
            return
        }
        
        // Get consultation recommendation based on assessment
        const recommendation = this.getConsultationRecommendation()
        this.showConsultationBookingModal(recommendation)
    }
    
    getConsultationRecommendation() {
        const { overallScore, dimensionScores } = this.assessmentResults
        const criticalDimensions = Object.entries(dimensionScores).filter(([_, score]) => score < 60)
        
        if (overallScore < 40) {
            return {
                recommended: 'STRATEGY',
                reason: 'Low overall readiness requires strategic foundation planning',
                urgency: 'URGENT',
                duration: 90,
                focus: ['AI Strategy Development', 'Governance Framework', 'Leadership Alignment']
            }
        } else if (overallScore < 60) {
            if (criticalDimensions.some(([dim]) => dim.includes('Architecture') || dim.includes('Data'))) {
                return {
                    recommended: 'TECHNICAL',
                    reason: 'Technical infrastructure gaps identified',
                    urgency: 'HIGH',
                    duration: 75,
                    focus: ['Technical Architecture', 'Data Infrastructure', 'Integration Planning']
                }
            } else {
                return {
                    recommended: 'STRATEGY',
                    reason: 'Multiple readiness areas need strategic coordination',
                    urgency: 'HIGH',
                    duration: 90,
                    focus: ['Strategic Roadmapping', 'Change Management', 'Resource Planning']
                }
            }
        } else if (overallScore < 80) {
            return {
                recommended: 'IMPLEMENTATION',
                reason: 'Good foundation, ready for implementation guidance',
                urgency: 'MEDIUM',
                duration: 60,
                focus: ['Implementation Strategy', 'Best Practices', 'Performance Optimization']
            }
        } else {
            return {
                recommended: 'STRATEGY',
                reason: 'Advanced optimization and innovation opportunities',
                urgency: 'LOW',
                duration: 60,
                focus: ['Advanced Capabilities', 'Innovation Strategy', 'Competitive Advantage']
            }
        }
    }
    
    showConsultationBookingModal(recommendation) {
        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <form id="consultation-form" class="p-6">
                    <div class="flex justify-between items-start mb-6">
                        <h3 class="text-2xl font-bold text-gray-800">Schedule Expert Consultation</h3>
                        <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                    
                    <!-- Recommended Consultation Type -->
                    <div class="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 class="font-semibold text-blue-800 mb-2">Recommended for You</h4>
                        <div class="flex items-center justify-between">
                            <div>
                                <span class="inline-block px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                    ${recommendation.recommended} CONSULTATION
                                </span>
                                <p class="text-sm text-blue-700 mt-2">${recommendation.reason}</p>
                                <p class="text-xs text-blue-600 mt-1">Duration: ${recommendation.duration} minutes</p>
                            </div>
                            <div class="text-right">
                                <div class="text-xs font-medium text-blue-800">Urgency</div>
                                <span class="inline-block px-2 py-1 bg-${recommendation.urgency === 'URGENT' ? 'red' : recommendation.urgency === 'HIGH' ? 'orange' : recommendation.urgency === 'MEDIUM' ? 'yellow' : 'green'}-100 text-${recommendation.urgency === 'URGENT' ? 'red' : recommendation.urgency === 'HIGH' ? 'orange' : recommendation.urgency === 'MEDIUM' ? 'yellow' : 'green'}-800 rounded text-xs">
                                    ${recommendation.urgency}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Consultation Details Form -->
                    <div class="space-y-4">
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Consultation Type</label>
                                <select id="consultation-type" name="consultationType" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="STRATEGY" ${recommendation.recommended === 'STRATEGY' ? 'selected' : ''}>Strategy & Planning</option>
                                    <option value="TECHNICAL" ${recommendation.recommended === 'TECHNICAL' ? 'selected' : ''}>Technical Implementation</option>
                                    <option value="IMPLEMENTATION" ${recommendation.recommended === 'IMPLEMENTATION' ? 'selected' : ''}>Implementation Support</option>
                                </select>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Urgency Level</label>
                                <select id="urgency-level" name="urgencyLevel" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="LOW">Low - General guidance</option>
                                    <option value="MEDIUM" ${recommendation.urgency === 'MEDIUM' ? 'selected' : ''}>Medium - Planned initiative</option>
                                    <option value="HIGH" ${recommendation.urgency === 'HIGH' ? 'selected' : ''}>High - Current project</option>
                                    <option value="URGENT" ${recommendation.urgency === 'URGENT' ? 'selected' : ''}>Urgent - Immediate need</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
                                <input type="date" id="preferred-date" name="preferredDate" 
                                       min="${new Date().toISOString().split('T')[0]}" 
                                       class="w-full border border-gray-300 rounded-lg px-3 py-2">
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-1">Preferred Time</label>
                                <select id="preferred-time" name="preferredTime" class="w-full border border-gray-300 rounded-lg px-3 py-2">
                                    <option value="">Select time slot</option>
                                    <option value="09:00">9:00 AM</option>
                                    <option value="10:00">10:00 AM</option>
                                    <option value="11:00">11:00 AM</option>
                                    <option value="13:00">1:00 PM</option>
                                    <option value="14:00">2:00 PM</option>
                                    <option value="15:00">3:00 PM</option>
                                    <option value="16:00">4:00 PM</option>
                                </select>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Meeting Preference</label>
                            <div class="flex space-x-4">
                                <label class="flex items-center">
                                    <input type="radio" name="meetingPreference" value="VIRTUAL" checked class="mr-2">
                                    <span class="text-sm">Virtual (Teams/Zoom)</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="meetingPreference" value="PHONE" class="mr-2">
                                    <span class="text-sm">Phone Call</span>
                                </label>
                                <label class="flex items-center">
                                    <input type="radio" name="meetingPreference" value="IN_PERSON" class="mr-2">
                                    <span class="text-sm">In-Person</span>
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Focus Areas</label>
                            <div class="grid grid-cols-2 gap-2">
                                ${recommendation.focus.map(focus => `
                                    <label class="flex items-center text-sm">
                                        <input type="checkbox" name="topicFocus" value="${focus}" checked class="mr-2">
                                        ${focus}
                                    </label>
                                `).join('')}
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="topicFocus" value="ROI & Business Case" class="mr-2">
                                    ROI & Business Case
                                </label>
                                <label class="flex items-center text-sm">
                                    <input type="checkbox" name="topicFocus" value="Risk Management" class="mr-2">
                                    Risk Management
                                </label>
                            </div>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Company Background & Current AI Initiatives</label>
                            <textarea id="company-background" name="companyBackground" rows="3" 
                                      placeholder="Brief overview of your current AI initiatives, challenges, or goals..."
                                      class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">Specific Questions or Challenges</label>
                            <textarea id="specific-challenges" name="specificChallenges" rows="3" 
                                      placeholder="What specific challenges or questions would you like to discuss?"
                                      class="w-full border border-gray-300 rounded-lg px-3 py-2"></textarea>
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="flex justify-between pt-6 border-t mt-6">
                        <button type="button" onclick="this.closest('.fixed').remove()" 
                                class="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                        </button>
                        <button type="submit" 
                                class="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                            Request Consultation
                        </button>
                    </div>
                </form>
            </div>
        `
        
        document.body.appendChild(modal)
        
        // Add form submission handler
        document.getElementById('consultation-form').addEventListener('submit', (e) => {
            e.preventDefault()
            this.submitConsultationRequest(e.target)
        })
    }
    
    async submitConsultationRequest(form) {
        const formData = new FormData(form)
        
        // Collect topic focus as array
        const topicFocus = []
        form.querySelectorAll('input[name="topicFocus"]:checked').forEach(input => {
            topicFocus.push(input.value)
        })
        
        const bookingData = {
            leadId: this.leadData.leadId,
            assessmentId: this.assessmentResults.assessmentId,
            consultationType: formData.get('consultationType'),
            preferredDate: formData.get('preferredDate'),
            preferredTime: formData.get('preferredTime'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            consultationDuration: this.getConsultationRecommendation().duration,
            topicFocus: topicFocus,
            urgencyLevel: formData.get('urgencyLevel'),
            companyBackground: formData.get('companyBackground'),
            specificChallenges: formData.get('specificChallenges'),
            meetingPreference: formData.get('meetingPreference')
        }
        
        try {
            const response = await axios.post('/api/consultations', bookingData)
            
            if (response.data.bookingId) {
                // Close modal
                document.querySelector('.fixed').remove()
                
                // Show success message
                this.showConsultationConfirmation(response.data.bookingId)
            } else {
                alert('Failed to schedule consultation. Please try again.')
            }
        } catch (error) {
            console.error('Consultation booking error:', error)
            alert('Error scheduling consultation. Please try again or contact us directly.')
        }
    }
    
    showConsultationConfirmation(bookingId) {
        const modal = document.createElement('div')
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
        modal.innerHTML = `
            <div class="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 text-center">
                <div class="mb-4">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-check text-2xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-bold text-gray-800">Consultation Request Submitted!</h3>
                </div>
                
                <div class="space-y-3 text-sm text-gray-600 mb-6">
                    <p>Thank you for your consultation request. We've received your information and will respond within 24 hours.</p>
                    <p><strong>Booking ID:</strong> #${bookingId}</p>
                    <p>You'll receive a confirmation email with meeting details once your consultation is scheduled.</p>
                </div>
                
                <div class="space-y-3">
                    <button onclick="this.closest('.fixed').remove()" 
                            class="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium">
                        Continue to Results
                    </button>
                    <div class="text-xs text-gray-500">
                        <p>Need immediate assistance? Email shane@forvismazars.com</p>
                    </div>
                </div>
            </div>
        `
        
        document.body.appendChild(modal)
    }
    
    // Continuous Monitoring Features
    async loadMonitoringStatus() {
        if (!this.leadData?.leadId) return
        
        try {
            const response = await axios.get(`/api/monitoring/lead/${this.leadData.leadId}`)
            if (response.data.schedules && response.data.schedules.length > 0) {
                this.showMonitoringStatus(response.data.schedules[0])
            }
        } catch (error) {
            console.error('Error loading monitoring status:', error)
        }
    }
    
    showMonitoringStatus(schedule) {
        const nextDue = new Date(schedule.next_assessment_due)
        const today = new Date()
        const daysUntilDue = Math.ceil((nextDue - today) / (1000 * 60 * 60 * 24))
        
        // Add monitoring status to results page
        const monitoringHtml = `
            <div class="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white mb-6">
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold mb-2">🔄 Continuous Monitoring Active</h3>
                        <p class="text-purple-100 mb-1">Next assessment: ${nextDue.toLocaleDateString()}</p>
                        <p class="text-sm text-purple-200">
                            ${daysUntilDue > 0 ? `${daysUntilDue} days remaining` : 
                              daysUntilDue === 0 ? 'Due today!' : 
                              `${Math.abs(daysUntilDue)} days overdue`}
                        </p>
                    </div>
                    <div class="text-center">
                        <div class="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-2">
                            <i class="fas fa-calendar-check text-2xl"></i>
                        </div>
                        <p class="text-xs text-purple-200">${schedule.monitoring_type}</p>
                    </div>
                </div>
                
                ${daysUntilDue <= 7 ? `
                    <div class="mt-4 pt-4 border-t border-purple-400">
                        <div class="flex items-center justify-between">
                            <p class="text-sm">Your re-assessment is ${daysUntilDue <= 0 ? 'overdue' : 'coming up soon'}!</p>
                            <button onclick="app.startReAssessment()" 
                                    class="bg-white text-purple-600 px-4 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors">
                                Start Re-Assessment
                            </button>
                        </div>
                    </div>
                ` : ''}
            </div>
        `
        
        // Insert after the main results header
        const resultsContainer = document.querySelector('.max-w-6xl')
        if (resultsContainer) {
            const firstChild = resultsContainer.firstElementChild
            if (firstChild) {
                firstChild.insertAdjacentHTML('afterend', monitoringHtml)
            }
        }
    }
    
    startReAssessment() {
        // Reset assessment state for re-assessment
        this.currentStep = 'welcome'
        this.currentQuestionIndex = 0
        this.responses = {}
        this.assessmentResults = null
        
        // Show welcome screen with re-assessment context
        this.showReAssessmentWelcome()
    }
    
    async showReAssessmentWelcome() {
        document.getElementById('app').innerHTML = `
            <div class="min-h-screen forvis-gradient">
                <div class="container mx-auto px-4 pt-8 pb-4">
                    <div class="text-center text-white mb-8">
                        <h1 class="text-3xl md:text-5xl font-bold mb-4">SAFE-8 Re-Assessment</h1>
                        <p class="text-xl mb-2">Track Your AI Transformation Progress</p>
                        <p class="text-lg opacity-90">See how your AI readiness has evolved since your last assessment</p>
                    </div>
                </div>
                
                <div class="bg-white rounded-t-3xl min-h-screen shadow-2xl">
                    <div class="container mx-auto px-4 py-8">
                        <div class="max-w-4xl mx-auto">
                            <!-- Progress Reminder -->
                            <div class="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                                <h3 class="text-xl font-semibold text-blue-800 mb-4">Welcome Back, ${this.leadData.contactName}!</h3>
                                <div class="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p class="text-blue-700 mb-2"><strong>Company:</strong> ${this.leadData.companyName}</p>
                                        <p class="text-blue-700 mb-2"><strong>Industry:</strong> ${this.selectedIndustry}</p>
                                        <p class="text-blue-700"><strong>Previous Score:</strong> ${this.assessmentResults?.overallScore || 'N/A'}%</p>
                                    </div>
                                    <div>
                                        <p class="text-blue-700 mb-2"><strong>Assessment Type:</strong> ${this.selectedAssessmentType}</p>
                                        <p class="text-blue-700 mb-2"><strong>Time Since Last:</strong> ~3 months</p>
                                        <p class="text-blue-700"><strong>Expected Duration:</strong> ~5-10 minutes</p>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Re-assessment Benefits -->
                            <div class="mb-8">
                                <h3 class="text-2xl font-semibold text-gray-800 mb-4 text-center">Track Your Progress</h3>
                                <div class="grid md:grid-cols-3 gap-6">
                                    <div class="text-center p-4">
                                        <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i class="fas fa-chart-line text-green-600 text-xl"></i>
                                        </div>
                                        <h4 class="font-semibold text-gray-800 mb-2">Measure Progress</h4>
                                        <p class="text-sm text-gray-600">See how your AI readiness has improved across all dimensions</p>
                                    </div>
                                    
                                    <div class="text-center p-4">
                                        <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i class="fas fa-bullseye text-blue-600 text-xl"></i>
                                        </div>
                                        <h4 class="font-semibold text-gray-800 mb-2">Identify New Gaps</h4>
                                        <p class="text-sm text-gray-600">Discover new opportunities as the AI landscape evolves</p>
                                    </div>
                                    
                                    <div class="text-center p-4">
                                        <div class="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <i class="fas fa-route text-purple-600 text-xl"></i>
                                        </div>
                                        <h4 class="font-semibold text-gray-800 mb-2">Updated Roadmap</h4>
                                        <p class="text-sm text-gray-600">Get refreshed recommendations based on current capabilities</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div class="text-center">
                                <button onclick="app.startAssessment()" 
                                        class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-colors">
                                    Begin Re-Assessment
                                </button>
                                <p class="text-sm text-gray-600 mt-3">Using the same ${this.selectedAssessmentType} assessment format as before</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `
        
        this.hideLoadingScreen()
    }
}

// Initialize the application immediately - no waiting
console.log('Initializing SAFE8Assessment app...');
window.app = new SAFE8Assessment();
console.log('App initialized and available globally as window.app');