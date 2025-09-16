"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { BookOpen, Clock, CheckCircle, Star, Award, Target, PlayCircle, Brain, Lightbulb } from "lucide-react"
import { learningSystem, type LearningConcept, type UserProgress } from "@/lib/learning-system"

interface LearningModuleProps {
  onConceptComplete?: (conceptId: string, score: number) => void
}

export default function LearningModule({ onConceptComplete }: LearningModuleProps) {
  const [selectedConcept, setSelectedConcept] = useState<LearningConcept | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [quizResults, setQuizResults] = useState<{ correct: boolean; explanation: string; score: number } | null>(null)
  const [concepts, setConcepts] = useState<LearningConcept[]>([])
  const [userProgress, setUserProgress] = useState<Map<string, UserProgress>>(new Map())
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    setConcepts(learningSystem.getAllConcepts())
    // Load user progress (in real app, this would come from a database)
    const progressMap = new Map<string, UserProgress>()
    concepts.forEach((concept) => {
      const progress = learningSystem.getUserProgress(concept.id)
      if (progress) {
        progressMap.set(concept.id, progress)
      }
    })
    setUserProgress(progressMap)
  }, [])

  const startConcept = (concept: LearningConcept) => {
    setSelectedConcept(concept)
    setCurrentQuestionIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setQuizResults(null)
    learningSystem.startConcept(concept.id)
    setActiveTab("lesson")
  }

  const startQuiz = () => {
    if (selectedConcept?.quiz) {
      setCurrentQuestionIndex(0)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setActiveTab("quiz")
    }
  }

  const submitAnswer = () => {
    if (!selectedConcept || selectedAnswer === null || !selectedConcept.quiz) return

    const currentQuestion = selectedConcept.quiz[currentQuestionIndex]
    const result = learningSystem.submitQuizAnswer(selectedConcept.id, currentQuestion.id, selectedAnswer)

    setQuizResults(result)
    setShowExplanation(true)

    // Update local progress
    const updatedProgress = learningSystem.getUserProgress(selectedConcept.id)
    if (updatedProgress) {
      setUserProgress((prev) => new Map(prev.set(selectedConcept.id, updatedProgress)))
    }
  }

  const nextQuestion = () => {
    if (!selectedConcept?.quiz) return

    if (currentQuestionIndex < selectedConcept.quiz.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
      setQuizResults(null)
    } else {
      // Quiz completed
      const finalScore = quizResults?.score || 0
      learningSystem.completeConcept(selectedConcept.id, finalScore)
      onConceptComplete?.(selectedConcept.id, finalScore)
      setActiveTab("results")
    }
  }

  const getProgressForConcept = (conceptId: string): UserProgress | undefined => {
    return userProgress.get(conceptId)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "mastered":
        return <Star className="h-4 w-4 text-yellow-400" />
      case "in_progress":
        return <PlayCircle className="h-4 w-4 text-blue-400" />
      default:
        return <BookOpen className="h-4 w-4 text-gray-400" />
    }
  }

  const overallProgress = learningSystem.getOverallProgress()
  const recommendedConcepts = learningSystem.getRecommendedConcepts()

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lesson" disabled={!selectedConcept}>
            Lesson
          </TabsTrigger>
          <TabsTrigger value="quiz" disabled={!selectedConcept?.quiz}>
            Quiz
          </TabsTrigger>
          <TabsTrigger value="results" disabled={!quizResults}>
            Results
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Progress Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Completed</p>
                    <p className="text-2xl font-bold">{overallProgress.completedConcepts}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Mastered</p>
                    <p className="text-2xl font-bold">{overallProgress.masteredConcepts}</p>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Avg Score</p>
                    <p className="text-2xl font-bold">{overallProgress.averageScore}%</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Time Spent</p>
                    <p className="text-2xl font-bold">{Math.round(overallProgress.totalTimeSpent / 60)}h</p>
                  </div>
                  <Clock className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommended Concepts */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-400" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recommendedConcepts.map((concept) => {
                  const progress = getProgressForConcept(concept.id)
                  return (
                    <Card key={concept.id} className="bg-white/5 border-white/10">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(progress?.status || "not_started")}
                            <Badge
                              variant={
                                concept.difficulty === "beginner"
                                  ? "default"
                                  : concept.difficulty === "intermediate"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {concept.difficulty}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-white/60">
                            <Clock className="h-3 w-3" />
                            {concept.estimatedTime}m
                          </div>
                        </div>
                        <h3 className="font-medium text-white mb-2">{concept.name}</h3>
                        <p className="text-sm text-white/70 mb-3">{concept.description}</p>
                        <Button
                          onClick={() => startConcept(concept)}
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                        >
                          {progress?.status === "not_started" ? "Start Learning" : "Continue"}
                        </Button>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* All Concepts */}
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-400" />
                All Learning Concepts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {concepts.map((concept) => {
                  const progress = getProgressForConcept(concept.id)
                  return (
                    <div
                      key={concept.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(progress?.status || "not_started")}
                        <div>
                          <h4 className="font-medium text-white">{concept.name}</h4>
                          <p className="text-sm text-white/60">{concept.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant={
                                concept.difficulty === "beginner"
                                  ? "default"
                                  : concept.difficulty === "intermediate"
                                    ? "secondary"
                                    : "destructive"
                              }
                              className="text-xs"
                            >
                              {concept.difficulty}
                            </Badge>
                            <span className="text-xs text-white/60 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {concept.estimatedTime}m
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {progress && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">{progress.score}%</p>
                            <p className="text-xs text-white/60">{progress.attempts} attempts</p>
                          </div>
                        )}
                        <Button
                          onClick={() => startConcept(concept)}
                          size="sm"
                          variant="outline"
                          className="text-white border-white/20 hover:bg-white/10"
                        >
                          {progress?.status === "not_started" ? "Start" : "Review"}
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lesson">
          {selectedConcept && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-400" />
                  {selectedConcept.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-3">Description</h3>
                  <p className="text-white/80">{selectedConcept.description}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3">Key Learning Points</h3>
                  <ul className="space-y-2">
                    {selectedConcept.keyPoints.map((point, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-white/80">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedConcept.examples && selectedConcept.examples.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium mb-3">Examples</h3>
                    <div className="space-y-2">
                      {selectedConcept.examples.map((example, index) => (
                        <div key={index} className="p-3 rounded-lg bg-white/5 border border-white/10">
                          <p className="text-white/80">{example}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => setActiveTab("overview")}
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Back to Overview
                  </Button>
                  {selectedConcept.quiz && (
                    <Button onClick={startQuiz} className="bg-green-600 hover:bg-green-700">
                      Take Quiz
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="quiz">
          {selectedConcept?.quiz && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="h-5 w-5 text-yellow-400" />
                    Quiz: {selectedConcept.name}
                  </div>
                  <Badge variant="outline" className="text-white border-white/20">
                    Question {currentQuestionIndex + 1} of {selectedConcept.quiz.length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <Progress value={((currentQuestionIndex + 1) / selectedConcept.quiz.length) * 100} className="w-full" />

                <div>
                  <h3 className="text-lg font-medium mb-4">{selectedConcept.quiz[currentQuestionIndex].question}</h3>

                  <RadioGroup
                    value={selectedAnswer?.toString()}
                    onValueChange={(value) => setSelectedAnswer(Number.parseInt(value))}
                    disabled={showExplanation}
                  >
                    {selectedConcept.quiz[currentQuestionIndex].options.map((option, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                        <Label htmlFor={`option-${index}`} className="text-white/80 cursor-pointer">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {showExplanation && quizResults && (
                  <div
                    className={`p-4 rounded-lg border ${quizResults.correct ? "bg-green-500/10 border-green-500/20" : "bg-red-500/10 border-red-500/20"}`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      {quizResults.correct ? (
                        <CheckCircle className="h-5 w-5 text-green-400" />
                      ) : (
                        <Target className="h-5 w-5 text-red-400" />
                      )}
                      <span className={`font-medium ${quizResults.correct ? "text-green-400" : "text-red-400"}`}>
                        {quizResults.correct ? "Correct!" : "Incorrect"}
                      </span>
                    </div>
                    <p className="text-white/80">{quizResults.explanation}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  {!showExplanation ? (
                    <Button
                      onClick={submitAnswer}
                      disabled={selectedAnswer === null}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Submit Answer
                    </Button>
                  ) : (
                    <Button onClick={nextQuestion} className="bg-green-600 hover:bg-green-700">
                      {currentQuestionIndex < selectedConcept.quiz.length - 1 ? "Next Question" : "Finish Quiz"}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="results">
          {quizResults && selectedConcept && (
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-400" />
                  Quiz Results: {selectedConcept.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold mb-2">{quizResults.score}%</div>
                  <p className="text-white/60">
                    {quizResults.score >= 80
                      ? "Excellent! You mastered this concept!"
                      : quizResults.score >= 60
                        ? "Good job! You completed this concept."
                        : "Keep practicing to improve your understanding."}
                  </p>
                </div>

                <div className="flex justify-center gap-3">
                  <Button
                    onClick={() => setActiveTab("overview")}
                    variant="outline"
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    Back to Overview
                  </Button>
                  <Button onClick={() => setActiveTab("lesson")} className="bg-blue-600 hover:bg-blue-700">
                    Review Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
