"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, User, Download, ExternalLink } from "lucide-react"

interface CourseDetailsProps {
  selectedCourse: string
  courseId: number | null
}

interface CourseInfo {
  id: number
  name: string
  description: string
  schedule: string
  start_date: string
  duration: string
  location: string
  tutor: string
  class_link?: string
  tutor_bio?: string
  requirements?: string
}

export default function CourseDetails({ selectedCourse, courseId }: CourseDetailsProps) {
  const [courseInfo, setCourseInfo] = useState<CourseInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [isInIframe, setIsInIframe] = useState(false)

  useEffect(() => {
    // Check if the page is inside an iframe
    setIsInIframe(window.self !== window.top)
  }, [])
  
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) {
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/courses/${courseId}`)
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            setCourseInfo(result.course)
          }
        }
      } catch (error) {
        console.error("Error fetching course details:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchCourseDetails()
  }, [courseId])

  const handleDownloadPDF = async () => {
    if (!courseId) return

    try {
      // If in iframe, open in new tab
      if (isInIframe) {
        window.open(`/api/generate-course-pdf?courseId=${courseId}`, '_blank')
        return
      }
      
      // Regular download for non-iframe scenarios
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
      
      // Fallback: try opening in new tab if fetch fails
      window.open(`/api/generate-course-pdf?courseId=${courseId}`, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "TBD"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="text-center space-y-6">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0087DB] border-r-transparent"></div>
        <p className="text-gray-500">Loading course details...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-blue-100 p-6">
            <Calendar className="h-16 w-16 text-[#0087DB]" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-[#0087DB] mb-2">🎉 You're All Set!</h2>
        <p className="text-xl text-gray-700">Welcome to {courseInfo?.name || selectedCourse}</p>
      </div>

      {courseInfo && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl text-[#0087DB]">{courseInfo.name}</CardTitle>
              <Badge className="bg-blue-100 text-[#0087DB] border-[#0087DB]">Enrolled</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-gray-700">{courseInfo.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-[#0087DB]" />
                <div>
                  <p className="font-medium">Start Date</p>
                  <p className="text-gray-600">{formatDate(courseInfo.start_date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="h-5 w-5 text-[#0087DB]" />
                <div>
                  <p className="font-medium">Duration</p>
                  <p className="text-gray-600">{courseInfo.duration}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-[#0087DB]" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-gray-600">{courseInfo.location}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-[#0087DB]" />
                <div>
                  <p className="font-medium">Instructor</p>
                  <p className="text-gray-600">{courseInfo.tutor}</p>
                </div>
              </div>
            </div>

            {courseInfo.schedule && (
              <div>
                <h4 className="font-medium mb-2">Schedule</h4>
                <p className="text-gray-600">{courseInfo.schedule}</p>
              </div>
            )}

            {courseInfo.requirements && (
              <div>
                <h4 className="font-medium mb-2">Requirements</h4>
                <p className="text-gray-600">{courseInfo.requirements}</p>
              </div>
            )}

            {courseInfo.tutor_bio && (
              <div>
                <h4 className="font-medium mb-2">About Your Instructor</h4>
                <p className="text-gray-600">{courseInfo.tutor_bio}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              {/* <Button onClick={handleDownloadPDF} className="bg-[#0087DB] hover:bg-[#0076C7]">
                <Download className="mr-2 h-4 w-4" />
                Download Course Details
              </Button> */}

              {courseInfo.class_link && (
                <a href={courseInfo.class_link} target="_blank">
                <Button
                  variant="outline"
                  //onClick={() => window.open(courseInfo.class_link, "_blank")}
                  className="border-[#0087DB] text-[#0087DB] hover:bg-blue-50"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Join Class
                </Button>
                </a>
              )}   
            </div>

             

            {/* Add direct link for iframe scenarios
            {isInIframe && (
              <div className="mt-4 p-3 bg-yellow-50 rounded-md text-sm">
                <p className="text-yellow-800">
                  If the download doesn't start automatically,{" "}
                  <a 
                    href={`/api/generate-course-pdf?courseId=${courseId}`} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0087DB] underline font-medium"
                  >
                    click here to open the PDF in a new tab
                  </a>
                  , then use the download button in the PDF viewer.
                </p>
              </div>
            )} */}
            
          </CardContent>
        </Card>
      )}

      <div className="bg-blue-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-[#0087DB] mb-3">What's Next?</h3>
        <div className="space-y-2">
          <p className="flex items-center text-sm">
            <span className="w-2 h-2 bg-[#0087DB] rounded-full mr-3"></span>
            Check your email for detailed course information and calendar invite
          </p>
          <p className="flex items-center text-sm">
            <span className="w-2 h-2 bg-[#0087DB] rounded-full mr-3"></span>
            Prepare any required materials mentioned above
          </p>
          <p className="flex items-center text-sm">
            <span className="w-2 h-2 bg-[#0087DB] rounded-full mr-3"></span>
            Join our community group for updates and networking
          </p>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500">
        <p>Questions? Contact us at support@sheleadsafrica.org</p>
      </div>
    </div>
  )
}
