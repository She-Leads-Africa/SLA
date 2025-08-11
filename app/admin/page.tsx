"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Users,
  BookOpen,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Download,
  Eye,
} from "lucide-react"
import { getApplications, getCourses } from "@/app/actions"
import Link from "next/link"
import Image from "next/image"

interface Application {
  id: number
  status: string
  submitted_at: string
  applicant: {
    full_name: string
    email: string
    location: string
    employment_status: string
  }
  course: {
    name: string
  }
}

interface Course {
  id: number
  name: string
  description: string
  start_date: string
  created_at: string
}

export default function AdminDashboard() {
  const [applications, setApplications] = useState<Application[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsData, coursesData] = await Promise.all([getApplications(), getCourses()])
        setApplications(applicationsData)
        setCourses(coursesData)
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Calculate metrics
  const totalApplications = applications.length
  const approvedApplications = applications.filter((app) => app.status === "approved").length
  const pendingApplications = applications.filter((app) => app.status === "pending").length
  const rejectedApplications = applications.filter((app) => app.status === "rejected").length
  const totalCourses = courses.length

  // Recent applications (last 7 days)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentApplications = applications.filter((app) => new Date(app.submitted_at) >= sevenDaysAgo).length

  // Completion rate
  const completionRate = totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0

  // Active enrollments (approved applications)
  const activeEnrollments = approvedApplications

  // Get recent applications for display
  const recentApplicationsList = applications
    .sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())
    .slice(0, 5)

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "rejected":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#0087DB]"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Image src="/images/sla-logo.png" alt="SLA Logo" width={60} height={60} className="rounded-lg" />
          <div>
            <h1 className="text-3xl font-bold text-[#0087DB]">Admin Dashboard</h1>
            <p className="text-gray-600">Manage applications and courses</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Last updated</p>
          <p className="text-sm font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
            <Users className="h-4 w-4 text-[#0087DB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0087DB]">{totalApplications}</div>
            <p className="text-xs text-gray-600">All time applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Applications</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{recentApplications}</div>
            <p className="text-xs text-gray-600">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{completionRate}%</div>
            <p className="text-xs text-gray-600">Approved applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{totalCourses}</div>
            <p className="text-xs text-gray-600">Available courses</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Applications</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{rejectedApplications}</div>
            <p className="text-xs text-gray-600">Declined applications</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingApplications}</div>
            <p className="text-xs text-gray-600">Awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Enrollments</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeEnrollments}</div>
            <p className="text-xs text-gray-600">Enrolled students</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#0087DB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0087DB]">{completionRate}%</div>
            <p className="text-xs text-gray-600">Application approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Application Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0087DB]">Application Status Distribution</CardTitle>
          <CardDescription>Overview of application statuses</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center">
                <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                Approved ({approvedApplications})
              </span>
              <span>{totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0}%</span>
            </div>
            <Progress
              value={totalApplications > 0 ? (approvedApplications / totalApplications) * 100 : 0}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center">
                <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                Pending ({pendingApplications})
              </span>
              <span>{totalApplications > 0 ? Math.round((pendingApplications / totalApplications) * 100) : 0}%</span>
            </div>
            <Progress
              value={totalApplications > 0 ? (pendingApplications / totalApplications) * 100 : 0}
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="flex items-center">
                <XCircle className="h-4 w-4 text-red-500 mr-2" />
                Rejected ({rejectedApplications})
              </span>
              <span>{totalApplications > 0 ? Math.round((rejectedApplications / totalApplications) * 100) : 0}%</span>
            </div>
            <Progress
              value={totalApplications > 0 ? (rejectedApplications / totalApplications) * 100 : 0}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Recent Applications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-[#0087DB] flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Recent Applications
          </CardTitle>
          <CardDescription>Latest application submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentApplicationsList.length > 0 ? (
            <div className="space-y-4">
              {recentApplicationsList.map((application) => (
                <div key={application.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getStatusIcon(application.status)}
                    <div>
                      <p className="font-medium">{application.applicant.full_name}</p>
                      <p className="text-sm text-gray-600">{application.course.name}</p>
                      <p className="text-xs text-gray-500">{new Date(application.submitted_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(application.status)}>{application.status}</Badge>
                    <Link href={`/admin/applications/${application.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent applications</p>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-[#0087DB]">Applications</CardTitle>
            <CardDescription>Manage student applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/applications">
                <Button className="w-full bg-[#0087DB] hover:bg-[#0076C7]">
                  <Users className="h-4 w-4 mr-2" />
                  View All Applications
                </Button>
              </Link>
              <Link href="/admin/applications?status=pending">
                <Button variant="outline" className="w-full bg-transparent">
                  <Clock className="h-4 w-4 mr-2" />
                  Pending Reviews ({pendingApplications})
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0087DB]">Courses</CardTitle>
            <CardDescription>Manage course offerings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Link href="/admin/courses">
                <Button className="w-full bg-[#0087DB] hover:bg-[#0076C7]">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Courses
                </Button>
              </Link>
              <Button variant="outline" className="w-full bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                Course Analytics
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-[#0087DB]">Reports</CardTitle>
            <CardDescription>Export and analyze data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Export Applications
              </Button>
              <Button variant="outline" className="w-full bg-transparent">
                <TrendingUp className="h-4 w-4 mr-2" />
                Generate Reports
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
