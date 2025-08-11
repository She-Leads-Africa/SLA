"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle, Download } from "lucide-react"

interface ThankYouProps {
  selectedCourse?: string
  courseId?: number | null
}

export default function ThankYou({ selectedCourse, courseId }: ThankYouProps) {
  const handleDownloadPDF = async () => {
    if (!courseId) return

    try {
      const response = await fetch(`/api/generate-course-pdf?courseId=${courseId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.style.display = "none"
        a.href = url
        a.download = `course-details-${courseId}.pdf`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error("Error downloading PDF:", error)
    }
  }

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="rounded-full bg-blue-100 p-6">
          <CheckCircle className="h-16 w-16 text-[#0087DB]" />
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-bold text-[#0087DB] mb-4">🎉 Congratulations!</h2>
        <p className="text-xl text-gray-700 mb-2">Your application has been approved!</p>
        <p className="text-gray-600">
          You have been successfully enrolled in <strong>{selectedCourse}</strong>
        </p>
      </div>

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-[#0087DB] mb-3">What's Next?</h3>
        <div className="space-y-2 text-left">
          <p className="flex items-center">
            <span className="w-2 h-2 bg-[#0087DB] rounded-full mr-3"></span>
            Check your email for course details and joining instructions
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-[#0087DB] rounded-full mr-3"></span>
            Save the course schedule to your calendar
          </p>
          <p className="flex items-center">
            <span className="w-2 h-2 bg-[#0087DB] rounded-full mr-3"></span>
            Prepare any required materials mentioned in the course details
          </p>
        </div>
      </div>

      {courseId && (
        <Button onClick={handleDownloadPDF} className="bg-[#0087DB] hover:bg-[#0076C7]">
          <Download className="mr-2 h-4 w-4" />
          Download Course Details (PDF)
        </Button>
      )}

      <div className="text-sm text-gray-500">
        <p>If you have any questions, please contact us at support@sheleadsafrica.org</p>
      </div>
    </div>
  )
}
