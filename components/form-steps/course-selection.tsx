"use client"

import { useState, useEffect } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Video, Palette, Globe, BookOpen } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

interface Course {
  id: number
  name: string
  description: string
  duration: string
  schedule: string
}

interface CourseSelectionProps {
  value: string
  onChange: (value: string) => void
  onNext: () => void
  onBack: () => void
  isSubmitting: boolean
}

export default function CourseSelection({ value, onChange, onNext, onBack, isSubmitting }: CourseSelectionProps) {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  const fetchCourses = async (attempt = 1) => {
    try {
      console.log(`🔍 Fetching courses (attempt ${attempt})...`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // 15 second timeout

      const response = await fetch("/api/courses", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Check if response is ok
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Check if response has content
      const contentLength = response.headers.get("content-length")
      if (contentLength === "0") {
        throw new Error("Empty response from server")
      }

      // Get response text first to check if it's valid JSON
      const responseText = await response.text()

      if (!responseText || responseText.trim() === "") {
        throw new Error("Empty response body")
      }

      let result
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error("JSON parse error:", parseError)
        console.error("Response text:", responseText)
        throw new Error("Invalid JSON response from server")
      }

      if (result.success && Array.isArray(result.courses)) {
        setCourses(result.courses)
        setError(null)
        console.log("✅ Loaded courses:", result.courses.length)
      } else {
        throw new Error(result.error || "Invalid response format")
      }
    } catch (err: any) {
      console.error(`❌ Error fetching courses (attempt ${attempt}):`, err)

      if (err.name === "AbortError") {
        setError("Request timed out. Please check your connection and try again.")
      } else if (err.message.includes("JSON")) {
        setError("Server response error. Please try again.")
      } else {
        setError(err.message || "Failed to load courses")
      }

      // Retry logic for certain errors
      if (attempt < 3 && (err.name === "AbortError" || err.message.includes("JSON"))) {
        console.log(`Retrying in 2 seconds... (attempt ${attempt + 1})`)
        setTimeout(() => {
          setRetryCount(attempt)
          fetchCourses(attempt + 1)
        }, 2000)
        return
      }

      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const getCourseIcon = (courseName: string) => {
    const name = courseName.toLowerCase()
    if (name.includes("video")) return Video
    if (name.includes("graphic") || name.includes("design")) return Palette
    if (name.includes("digital") || name.includes("marketing")) return Globe
    return BookOpen
  }

  const handleRetry = () => {
    setLoading(true)
    setError(null)
    setRetryCount(0)
    fetchCourses()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0087DB]">Course Selection</h2>
          <p className="text-gray-600 mt-2">
            {retryCount > 0 ? `Loading courses... (attempt ${retryCount + 1})` : "Loading available courses..."}
          </p>
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
          <h2 className="text-2xl font-bold text-[#0087DB]">Course Selection</h2>
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 mb-2">{error}</p>
            <Button onClick={handleRetry} variant="outline" className="mt-2 bg-transparent">
              Try Again
            </Button>
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

  if (courses.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#0087DB]">Course Selection</h2>
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-600 mb-2">No courses are currently available.</p>
            <Button onClick={handleRetry} variant="outline" className="mt-2 bg-transparent">
              Refresh
            </Button>
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
        <h2 className="text-2xl font-bold text-[#0087DB]">Course Selection</h2>
        <p className="text-gray-600 mt-2">Please select your preferred course.</p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Choose your preferred course</h3>

        <RadioGroup value={value} onValueChange={onChange} className="space-y-4">
          {courses.map((course) => {
            const IconComponent = getCourseIcon(course.name)
            const isSelected = value === course.id.toString()

            return (
              <Card
                key={course.id}
                className={`border-2 transition-all cursor-pointer ${
                  isSelected ? "border-[#0087DB] bg-blue-50" : "border-gray-200 hover:border-blue-300"
                }`}
                onClick={() => onChange(course.id.toString())}
              >
                <CardContent className="p-4">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value={course.id.toString()} id={`course-${course.id}`} />
                    <Label htmlFor={`course-${course.id}`} className="flex items-center cursor-pointer flex-1">
                      <IconComponent className="h-5 w-5 mr-2 text-[#0087DB]" />
                      <div className="flex-1">
                        <span className="font-medium">{course.name}</span>
                        {course.duration && <span className="text-sm text-gray-500 ml-2">({course.duration})</span>}
                      </div>
                    </Label>
                  </div>
                  {isSelected && (
                    <div className="mt-3 ml-7">
                      <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                      {course.schedule && (
                        <p className="text-sm text-[#0087DB] font-medium">📅 Schedule: {course.schedule}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </RadioGroup>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!value || isSubmitting} className="bg-[#0087DB] hover:bg-[#0076C7]">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit"
          )}
        </Button>
      </div>
    </div>
  )
}
