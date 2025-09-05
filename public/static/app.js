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
            const response = await axios.post('/api/assessments', {
                leadId: this.leadData.id,
                assessmentType: this.selectedAssessmentType,
                industry: this.selectedIndustry,
                responses: this.responses,
                overallScore,
                dimensionScores
            })
            
            this.assessmentResults = response.data
            this.renderResults()
        } catch (error) {
            console.error('Error submitting assessment:', error)
            alert('Error submitting assessment. Please try again.')
        }
    }
    
    renderResults() {
        const { overallScore, dimensionScores, insights, benchmarks } = this.assessmentResults
        
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
                        
                        <!-- Radar Chart and Insights -->
                        <div class="grid lg:grid-cols-2 gap-8 mb-8">
                            <div class="bg-white rounded-xl shadow-lg p-8">
                                <h3 class="text-xl font-semibold text-gray-800 mb-6">SAFE-8 Readiness Radar</h3>
                                <div class="radar-container mx-auto">
                                    <canvas id="radarChart"></canvas>
                                </div>
                            </div>
                            
                            <div class="bg-white rounded-xl shadow-lg p-8">
                                <h3 class="text-xl font-semibold text-gray-800 mb-6">Key Insights</h3>
                                <div class="space-y-3">
                                    ${insights.map(insight => `
                                        <div class="p-3 bg-gray-50 rounded-lg">
                                            <p class="text-sm">${insight}</p>
                                        </div>
                                    `).join('')}
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
        
        // Initialize radar chart
        setTimeout(() => this.initRadarChart(dimensionScores, benchmarks), 100)
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
    
    requestConsultation() {
        // This would typically open a scheduling form or redirect to a booking page
        alert('Thank you for your interest! We will contact you shortly to schedule your expert consultation.')
    }
}

// Initialize the application immediately - no waiting
console.log('Initializing SAFE8Assessment app...');
window.app = new SAFE8Assessment();
console.log('App initialized and available globally as window.app');