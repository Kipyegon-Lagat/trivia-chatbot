"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Question {
  question: string
  answer: string // The correct answer string
  category: "Geography" | "History"
  options: string[] // Array of multiple choice options
}

const allTriviaQuestions: Question[] = [
  {
    question: "What is the capital of France?",
    answer: "Paris",
    category: "Geography",
    options: ["London", "Berlin", "Paris", "Rome"],
  },
  {
    question: "Which is the longest river in the world?",
    answer: "Nile",
    category: "Geography",
    options: ["Amazon", "Nile", "Mississippi", "Yangtze"],
  },
  {
    question: "What is the highest mountain in Africa?",
    answer: "Mount Kilimanjaro",
    category: "Geography",
    options: ["Mount Kenya", "Mount Kilimanjaro", "Mount Everest", "Table Mountain"],
  },
  {
    question: "Who was the first President of the United States?",
    answer: "George Washington",
    category: "History",
    options: ["Thomas Jefferson", "Abraham Lincoln", "George Washington", "John Adams"],
  },
  {
    question: "In what year did World War II end?",
    answer: "1945",
    category: "History",
    options: ["1939", "1941", "1945", "1950"],
  },
  {
    question: "Who discovered America?",
    answer: "Christopher Columbus",
    category: "History",
    options: ["Vasco da Gama", "Ferdinand Magellan", "Christopher Columbus", "Marco Polo"],
  },
  {
    question: "What is the largest ocean on Earth?",
    answer: "Pacific Ocean",
    category: "Geography",
    options: ["Atlantic Ocean", "Indian Ocean", "Arctic Ocean", "Pacific Ocean"],
  },
  {
    question: "Who wrote 'Romeo and Juliet'?",
    answer: "William Shakespeare",
    category: "History",
    options: ["Charles Dickens", "Jane Austen", "William Shakespeare", "Leo Tolstoy"],
  },
  {
    question: "Which country is known as the Land of the Rising Sun?",
    answer: "Japan",
    category: "Geography",
    options: ["China", "South Korea", "Japan", "Thailand"],
  },
  {
    question: "When did the Titanic sink?",
    answer: "1912",
    category: "History",
    options: ["1905", "1912", "1918", "1923"],
  },
  {
    question: "What is the capital of Canada?",
    answer: "Ottawa",
    category: "Geography",
    options: ["Toronto", "Vancouver", "Montreal", "Ottawa"],
  },
  {
    question: "Who was the first man on the moon?",
    answer: "Neil Armstrong",
    category: "History",
    options: ["Buzz Aldrin", "Yuri Gagarin", "Neil Armstrong", "Michael Collins"],
  },
]

const MIN_QUESTIONS = 10 // Define the minimum number of questions

export default function TriviaChatbot() {
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Geography" | "History" | null>(null)
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState("")
  const [gameEnded, setGameEnded] = useState(false)
  const [timeLeft, setTimeLeft] = useState(5)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [answerSubmitted, setAnswerSubmitted] = useState(false)

  const currentQuestion = filteredQuestions[currentQuestionIndex]
  const totalQuestions = filteredQuestions.length

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    setTimeLeft(5)
    timerRef.current = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1)
    }, 1000)
  }, [])

  const handleAnswerSubmit = useCallback(
    (chosenOption: string | null) => {
      if (answerSubmitted || gameEnded) return

      setAnswerSubmitted(true)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }

      const normalizedCorrectAnswer = currentQuestion.answer.toLowerCase()
      let isCorrect = false
      let feedbackMessage = ""

      if (chosenOption === null) {
        // Time ran out
        feedbackMessage = `Time's up! The correct answer was: ${currentQuestion.answer}`
        isCorrect = false
      } else {
        const normalizedChosenOption = chosenOption.trim().toLowerCase()
        // Flexible matching: if user's answer contains correct answer or vice-versa
        isCorrect =
          normalizedChosenOption === normalizedCorrectAnswer ||
          normalizedCorrectAnswer.includes(normalizedChosenOption) ||
          normalizedChosenOption.includes(normalizedCorrectAnswer)

        if (isCorrect) {
          setScore((prevScore) => prevScore + 1)
          feedbackMessage = "Correct!"
        } else {
          feedbackMessage = `Incorrect. The correct answer was: ${currentQuestion.answer}`
        }
      }

      setFeedback(feedbackMessage)

      setTimeout(() => {
        setFeedback("")
        setSelectedOption(null)
        setAnswerSubmitted(false)
        if (currentQuestionIndex < totalQuestions - 1) {
          setCurrentQuestionIndex((prevIndex) => prevIndex + 1)
        } else {
          setGameEnded(true)
        }
      }, 2000) // Give user time to read feedback
    },
    [answerSubmitted, gameEnded, currentQuestion, currentQuestionIndex, totalQuestions],
  )

  useEffect(() => {
    if (selectedCategory && !gameEnded) {
      resetTimer()
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [currentQuestionIndex, selectedCategory, gameEnded, resetTimer])

  useEffect(() => {
    if (timeLeft === 0 && !gameEnded && selectedCategory && !answerSubmitted) {
      handleAnswerSubmit(null) // Time's up, submit null answer
    }
  }, [timeLeft, gameEnded, selectedCategory, answerSubmitted]) // Added handleAnswerSubmit to dependencies

  const handleCategorySelect = (category: "All" | "Geography" | "History") => {
    setSelectedCategory(category)
    let questionsToUse: Question[] = []

    if (category === "All") {
      questionsToUse = [...allTriviaQuestions]
    } else {
      questionsToUse = allTriviaQuestions.filter((q) => q.category === category)
    }

    // Ensure minimum number of questions
    if (questionsToUse.length < MIN_QUESTIONS) {
      const existingQuestionSet = new Set(questionsToUse.map((q) => q.question))
      const otherQuestions = allTriviaQuestions.filter((q) => !existingQuestionSet.has(q.question))

      // Add questions from other categories until MIN_QUESTIONS is met or all questions are used
      let i = 0
      while (questionsToUse.length < MIN_QUESTIONS && i < otherQuestions.length) {
        questionsToUse.push(otherQuestions[i])
        i++
      }
    }

    // Shuffle the final list of questions
    setFilteredQuestions(questionsToUse.sort(() => Math.random() - 0.5))
    setCurrentQuestionIndex(0)
    setScore(0)
    setFeedback("")
    setGameEnded(false)
    setSelectedOption(null)
    setAnswerSubmitted(false)
  }

  const handleRestart = () => {
    setSelectedCategory(null)
    setFilteredQuestions([])
    setCurrentQuestionIndex(0)
    setScore(0)
    setFeedback("")
    setGameEnded(false)
    setTimeLeft(5)
    setSelectedOption(null)
    setAnswerSubmitted(false)
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
  }

  if (!selectedCategory) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome to Trivia!</CardTitle>
            <CardDescription className="text-center">Choose a category to start your game.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Button onClick={() => handleCategorySelect("Geography")}>Geography Trivia</Button>
            <Button onClick={() => handleCategorySelect("History")}>History Trivia</Button>
            <Button onClick={() => handleCategorySelect("All")}>All Categories</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Trivia Chatbot</CardTitle>
          <CardDescription className="text-center">Test your knowledge in {selectedCategory}!</CardDescription>
        </CardHeader>
        <CardContent>
          {!gameEnded ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <p className="text-lg font-medium">
                  Question {currentQuestionIndex + 1} of {totalQuestions} ({currentQuestion.category}):
                </p>
                <div className="text-2xl font-bold text-red-500" aria-live="polite">
                  {timeLeft}s
                </div>
              </div>
              <p className="text-xl font-semibold">{currentQuestion.question}</p>
              <div className="grid grid-cols-1 gap-2">
                {currentQuestion.options.map((option, index) => (
                  <Button
                    key={index}
                    variant={selectedOption === option ? "default" : "outline"}
                    onClick={() => setSelectedOption(option)}
                    disabled={answerSubmitted}
                    className="justify-start text-left"
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {feedback && (
                <p
                  className={`text-center font-medium ${feedback.startsWith("Correct") ? "text-green-600" : "text-red-600"}`}
                >
                  {feedback}
                </p>
              )}
            </div>
          ) : (
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-bold">Game Over!</h2>
              <p className="text-xl">
                You scored {score} out of {totalQuestions} questions correctly.
              </p>
              {score === totalQuestions && (
                <p className="text-green-600 font-semibold">Amazing! You're a trivia master!</p>
              )}
              {score >= totalQuestions / 2 && score < totalQuestions && (
                <p className="text-blue-600 font-semibold">Good job! You have a solid knowledge base.</p>
              )}
              {score < totalQuestions / 2 && (
                <p className="text-red-600 font-semibold">Keep learning! There's always more to discover.</p>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          {!gameEnded ? (
            <Button onClick={() => handleAnswerSubmit(selectedOption)} disabled={!selectedOption || answerSubmitted}>
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleRestart}>Play Again</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
