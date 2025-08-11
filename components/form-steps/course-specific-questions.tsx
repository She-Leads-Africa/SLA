"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"

interface CourseQuestion {
  id: number
  question_type: string
  question_text: string
  question_options?: string[]
  is_required: boolean
  display_order: number
}

interface CourseSpecificQuestionsProps {
  formData: any
  updateFormData: (field: string, value: any) => void
  onNext: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function CourseSpecificQuestions({
  formData,
  updateFormData,
  onNext,
  onBack,
  isSubmitting,
}: CourseSpecificQuestionsProps) {
  const [questions, setQuestions] = useState<CourseQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchQuestions = async () => {
      if (!formData.preferredCourse) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/courses/${formData.preferredCourse}/questions`)
        const result = await response.json()

        if (result.success) {
          setQuestions(result.questions)
        } else {
          setError(result.error || "Failed to load questions")
        }
      } catch (err) {
        console.error("Error fetching course questions:", err)
        setError("Failed to load course questions")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [formData.preferredCourse])

  const handleQuestionResponse = (questionType: string, value: any) => {
    updateFormData(questionType, value)
  }

  const handleMultipleChoice = (questionType: string, option: string, checked: boolean) => {
    const currentValues = formData[questionType] || []
    let newValues

    if (checked) {
      newValues = [...currentValues, option]
    } else {
      newValues = currentValues.filter((item: string) => item !== option)
    }

    updateFormData(questionType, newValues)
  }

  const renderQuestion = (question: CourseQuestion) => {
    const questionType = question.question_type
    const currentValue = formData[questionType]

    switch (questionType) {
      case "formal_training":
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.question_text}</Label>
            <RadioGroup
              value={currentValue?.toString()}
              onValueChange={(value) => handleQuestionResponse(questionType, value === "true")}
            >
              {question.question_options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={(option.toLowerCase() === "yes").toString()} id={`${questionType}-${index}`} />
                  <Label htmlFor={`${questionType}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "familiarity_scale":
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.question_text}</Label>
            <RadioGroup value={currentValue} onValueChange={(value) => handleQuestionResponse(questionType, value)}>
              {question.question_options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionType}-${index}`} />
                  <Label htmlFor={`${questionType}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      case "tools_used":
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.question_text}</Label>
            <RadioGroup
              value={currentValue?.toString()}
              onValueChange={(value) => handleQuestionResponse(questionType, value === "true")}
            >
              {question.question_options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={(option.toLowerCase() === "yes").toString()} id={`${questionType}-${index}`} />
                  <Label htmlFor={`${questionType}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            {currentValue === true && (
              <div className="mt-3">
                <Label className="text-sm font-medium">Please specify which tools:</Label>
                <Textarea
                  value={formData.toolsUsed || ""}
                  onChange={(e) => updateFormData("toolsUsed", e.target.value)}
                  placeholder="List the tools you have used..."
                  className="mt-1"
                />
              </div>
            )}
          </div>
        )

      case "specific_question":
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.question_text}</Label>
            {question.question_options && question.question_options.length > 0 ? (
              <RadioGroup
                value={currentValue}
                onValueChange={(value) => handleQuestionResponse("courseSpecificAnswer", value)}
              >
                {question.question_options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${questionType}-${index}`} />
                    <Label htmlFor={`${questionType}-${index}`} className="cursor-pointer">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <Textarea
                value={formData.courseSpecificAnswer || ""}
                onChange={(e) => updateFormData("courseSpecificAnswer", e.target.value)}
                placeholder="Please provide your answer..."
                className="mt-1"
              />
            )}
          </div>
        )

      case "expectations":
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.question_text}</Label>
            <Textarea
              value={formData.expectations || ""}
              onChange={(e) => updateFormData("expectations", e.target.value)}
              placeholder="Share your expectations for this course..."
              className="mt-1"
              rows={4}
            />
          </div>
        )

      case "ease_rating":
        return (
          <div key={question.id} className="space-y-3">
            <Label className="text-base font-medium">{question.question_text}</Label>
            <RadioGroup
              value={currentValue}
              onValueChange={(value) => handleQuestionResponse("applicationEaseRating", value)}
            >
              {question.question_options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${questionType}-${index}`} />
                  <Label htmlFor={`${questionType}-${index}`} className="cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0087DB]">Course-Specific Questions</h2>
          <p className="text-gray-600 mt-2">Loading course questions...</p>
        </div>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#0087DB]" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0087DB]">Course-Specific Questions</h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" disabled={isSubmitting}>
            Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#0087DB]">Course-Specific Questions</h2>
        <p className="text-gray-600 mt-2">Please answer these questions about your selected course.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg space-y-6">
        {questions.length > 0 ? (
          questions.map(renderQuestion)
        ) : (
          <p className="text-gray-600 text-center">No specific questions for this course.</p>
        )}
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onNext} disabled={isSubmitting} className="bg-[#0087DB] hover:bg-[#0076C7]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </div>
    </div>
  )
}
