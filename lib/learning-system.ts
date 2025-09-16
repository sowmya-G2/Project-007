export interface LearningConcept {
  id: string
  name: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  prerequisites: string[]
  estimatedTime: number // in minutes
  keyPoints: string[]
  examples: string[]
  quiz?: QuizQuestion[]
}

export interface QuizQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

export interface UserProgress {
  conceptId: string
  status: "not_started" | "in_progress" | "completed" | "mastered"
  score: number
  timeSpent: number
  lastAccessed: Date
  attempts: number
  correctAnswers: number
  totalQuestions: number
}

export interface LearningPath {
  id: string
  name: string
  description: string
  concepts: string[]
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number
}

export class LearningSystem {
  private concepts: Map<string, LearningConcept> = new Map()
  private userProgress: Map<string, UserProgress> = new Map()
  private learningPaths: Map<string, LearningPath> = new Map()

  constructor() {
    this.initializeConcepts()
    this.initializeLearningPaths()
  }

  private initializeConcepts() {
    const concepts: LearningConcept[] = [
      {
        id: "basics-intro",
        name: "Trading Fundamentals",
        description: "Introduction to financial markets and basic trading concepts",
        difficulty: "beginner",
        prerequisites: [],
        estimatedTime: 15,
        keyPoints: [
          "What is trading and investing",
          "Types of financial markets",
          "Basic market terminology",
          "Risk and reward concepts",
        ],
        examples: [
          "Stock market example: Buying Apple shares",
          "Forex example: EUR/USD currency pair",
          "Commodity example: Gold trading",
        ],
        quiz: [
          {
            id: "q1",
            question: "What is the primary difference between trading and investing?",
            options: [
              "Trading is short-term, investing is long-term",
              "Trading is safer than investing",
              "Investing requires more money",
              "There is no difference",
            ],
            correctAnswer: 0,
            explanation:
              "Trading typically involves shorter time horizons and more frequent transactions, while investing focuses on long-term wealth building.",
          },
        ],
      },
      {
        id: "technical-analysis",
        name: "Technical Analysis Basics",
        description: "Learn to read charts and identify patterns",
        difficulty: "beginner",
        prerequisites: ["basics-intro"],
        estimatedTime: 25,
        keyPoints: [
          "Chart types and timeframes",
          "Support and resistance levels",
          "Trend identification",
          "Basic chart patterns",
        ],
        examples: [
          "Identifying uptrend in AAPL stock",
          "Finding support level at $150",
          "Recognizing head and shoulders pattern",
        ],
        quiz: [
          {
            id: "q1",
            question: "What does a support level represent?",
            options: [
              "A price level where buying interest is strong",
              "The highest price a stock can reach",
              "A technical indicator",
              "A type of order",
            ],
            correctAnswer: 0,
            explanation:
              "Support levels are price points where demand is strong enough to prevent further price declines.",
          },
        ],
      },
      {
        id: "risk-management",
        name: "Risk Management",
        description: "Protect your capital with proper risk management",
        difficulty: "intermediate",
        prerequisites: ["basics-intro"],
        estimatedTime: 20,
        keyPoints: ["Position sizing", "Stop-loss orders", "Risk-reward ratios", "Portfolio diversification"],
        examples: [
          "2% rule: Never risk more than 2% per trade",
          "Setting stop-loss at 5% below entry",
          "3:1 risk-reward ratio example",
        ],
        quiz: [
          {
            id: "q1",
            question: "What is the 2% rule in trading?",
            options: [
              "Never risk more than 2% of your account on a single trade",
              "Always make 2% profit per trade",
              "Trade only 2% of available stocks",
              "Use 2% commission maximum",
            ],
            correctAnswer: 0,
            explanation:
              "The 2% rule helps preserve capital by limiting the maximum loss on any single trade to 2% of your total account value.",
          },
        ],
      },
      {
        id: "market-psychology",
        name: "Market Psychology",
        description: "Understand emotions and behavior in trading",
        difficulty: "intermediate",
        prerequisites: ["basics-intro", "risk-management"],
        estimatedTime: 18,
        keyPoints: ["Fear and greed cycles", "Cognitive biases", "Emotional discipline", "Market sentiment indicators"],
        examples: [
          "FOMO (Fear of Missing Out) in bull markets",
          "Panic selling during market crashes",
          "Confirmation bias in analysis",
        ],
      },
      {
        id: "options-basics",
        name: "Options Trading Fundamentals",
        description: "Introduction to options contracts and strategies",
        difficulty: "advanced",
        prerequisites: ["technical-analysis", "risk-management"],
        estimatedTime: 30,
        keyPoints: [
          "Call and put options",
          "Option pricing factors",
          "Basic strategies",
          "Greeks (Delta, Gamma, Theta, Vega)",
        ],
        examples: ["Buying a call option on TSLA", "Protective put strategy", "Covered call writing"],
      },
    ]

    concepts.forEach((concept) => {
      this.concepts.set(concept.id, concept)
    })
  }

  private initializeLearningPaths() {
    const paths: LearningPath[] = [
      {
        id: "beginner-path",
        name: "Complete Beginner",
        description: "Start your trading journey from the very basics",
        concepts: ["basics-intro", "technical-analysis", "risk-management"],
        difficulty: "beginner",
        estimatedDuration: 60,
      },
      {
        id: "intermediate-path",
        name: "Intermediate Trader",
        description: "Build on your foundation with advanced concepts",
        concepts: ["technical-analysis", "risk-management", "market-psychology"],
        difficulty: "intermediate",
        estimatedDuration: 63,
      },
      {
        id: "advanced-path",
        name: "Advanced Strategies",
        description: "Master complex trading instruments and strategies",
        concepts: ["market-psychology", "options-basics"],
        difficulty: "advanced",
        estimatedDuration: 48,
      },
    ]

    paths.forEach((path) => {
      this.learningPaths.set(path.id, path)
    })
  }

  // Get learning concepts
  getConcept(id: string): LearningConcept | undefined {
    return this.concepts.get(id)
  }

  getAllConcepts(): LearningConcept[] {
    return Array.from(this.concepts.values())
  }

  getConceptsByDifficulty(difficulty: "beginner" | "intermediate" | "advanced"): LearningConcept[] {
    return Array.from(this.concepts.values()).filter((concept) => concept.difficulty === difficulty)
  }

  // Get learning paths
  getLearningPath(id: string): LearningPath | undefined {
    return this.learningPaths.get(id)
  }

  getAllLearningPaths(): LearningPath[] {
    return Array.from(this.learningPaths.values())
  }

  // User progress management
  getUserProgress(conceptId: string): UserProgress | undefined {
    return this.userProgress.get(conceptId)
  }

  updateProgress(conceptId: string, updates: Partial<UserProgress>) {
    const existing = this.userProgress.get(conceptId) || {
      conceptId,
      status: "not_started",
      score: 0,
      timeSpent: 0,
      lastAccessed: new Date(),
      attempts: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    }

    const updated = { ...existing, ...updates, lastAccessed: new Date() }
    this.userProgress.set(conceptId, updated)
    return updated
  }

  startConcept(conceptId: string): UserProgress {
    return this.updateProgress(conceptId, { status: "in_progress" })
  }

  completeConcept(conceptId: string, score: number): UserProgress {
    const status = score >= 80 ? "mastered" : "completed"
    return this.updateProgress(conceptId, { status, score })
  }

  // Quiz functionality
  submitQuizAnswer(
    conceptId: string,
    questionId: string,
    answer: number,
  ): {
    correct: boolean
    explanation: string
    score: number
  } {
    const concept = this.getConcept(conceptId)
    if (!concept || !concept.quiz) {
      throw new Error("Concept or quiz not found")
    }

    const question = concept.quiz.find((q) => q.id === questionId)
    if (!question) {
      throw new Error("Question not found")
    }

    const correct = answer === question.correctAnswer
    const progress = this.getUserProgress(conceptId) || {
      conceptId,
      status: "in_progress",
      score: 0,
      timeSpent: 0,
      lastAccessed: new Date(),
      attempts: 0,
      correctAnswers: 0,
      totalQuestions: 0,
    }

    const updatedProgress = this.updateProgress(conceptId, {
      attempts: progress.attempts + 1,
      correctAnswers: progress.correctAnswers + (correct ? 1 : 0),
      totalQuestions: progress.totalQuestions + 1,
    })

    const score = (updatedProgress.correctAnswers / updatedProgress.totalQuestions) * 100

    return {
      correct,
      explanation: question.explanation,
      score: Math.round(score),
    }
  }

  // Recommendations
  getRecommendedConcepts(userId?: string): LearningConcept[] {
    const allConcepts = this.getAllConcepts()
    const userProgressMap = new Map(Array.from(this.userProgress.entries()))

    // Filter concepts based on prerequisites and progress
    return allConcepts
      .filter((concept) => {
        // Check if prerequisites are met
        const prerequisitesMet = concept.prerequisites.every((prereqId) => {
          const prereqProgress = userProgressMap.get(prereqId)
          return prereqProgress && (prereqProgress.status === "completed" || prereqProgress.status === "mastered")
        })

        // Check if concept is not already mastered
        const conceptProgress = userProgressMap.get(concept.id)
        const notMastered = !conceptProgress || conceptProgress.status !== "mastered"

        return prerequisitesMet && notMastered
      })
      .slice(0, 3) // Return top 3 recommendations
  }

  // Progress analytics
  getOverallProgress(): {
    totalConcepts: number
    completedConcepts: number
    masteredConcepts: number
    averageScore: number
    totalTimeSpent: number
  } {
    const allProgress = Array.from(this.userProgress.values())
    const totalConcepts = this.concepts.size
    const completedConcepts = allProgress.filter((p) => p.status === "completed" || p.status === "mastered").length
    const masteredConcepts = allProgress.filter((p) => p.status === "mastered").length
    const averageScore =
      allProgress.length > 0 ? allProgress.reduce((sum, p) => sum + p.score, 0) / allProgress.length : 0
    const totalTimeSpent = allProgress.reduce((sum, p) => sum + p.timeSpent, 0)

    return {
      totalConcepts,
      completedConcepts,
      masteredConcepts,
      averageScore: Math.round(averageScore),
      totalTimeSpent,
    }
  }
}

// Global learning system instance
export const learningSystem = new LearningSystem()
