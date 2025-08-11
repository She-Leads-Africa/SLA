"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getApplicationDetails, updateApplicationStatus, getApplicationForExport } from "@/app/actions"
import { sendCourseConfirmationEmail, sendStatusUpdateEmail } from "@/app/admin/actions"
import { downloadExcel } from "@/lib/excel-export"
import { ArrowLeft, CheckCircle, XCircle, Clock, FileSpreadsheet, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ApplicationDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [sendingEmail, setSendingEmail] = useState(false)

  useEffect(() => {
    const fetchApplicationDetails = async () => {
      try {
        const data = await getApplicationDetails(Number.parseInt(params.id))
        setApplication(data)
      } catch (error) {
        console.error("Error fetching application details:", error)
        toast({
          title: "Error",
          description: "Failed to load application details",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchApplicationDetails()
  }, [params.id, toast])

  const handleStatusUpdate = async (status: string) => {
    setUpdating(true)

    try {
      const result = await updateApplicationStatus(Number.parseInt(params.id), status)

      if (result.success) {
        toast({
          title: "Status Updated",
          description: `Application has been ${status}`,
        })

        setApplication((prev: any) => ({
          ...prev,
          status,
        }))

        try {
          setSendingEmail(true)
          const emailResult = await sendStatusUpdateEmail(Number.parseInt(params.id), status)

          if (emailResult.success) {
            toast({
              title: "Email Sent",
              description: `Status update email has been sent to the applicant`,
            })
          } else {
            toast({
              title: "Email Not Sent",
              description: emailResult.error || "Failed to send status update email",
              variant: "destructive",
            })
          }
        } catch (emailError) {
          console.error("Error sending status update email:", emailError)
          toast({
            title: "Email Not Sent",
            description: "An error occurred while sending the status update email",
            variant: "destructive",
          })
        } finally {
          setSendingEmail(false)
        }
      } else {
        toast({
          title: "Update Failed",
          description: result.error || "Failed to update application status",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "An error occurred while updating the status",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleSendConfirmationEmail = async () => {
    setSendingEmail(true)

    try {
      const result = await sendCourseConfirmationEmail(Number.parseInt(params.id))

      if (result.success) {
        toast({
          title: "Email Sent",
          description: "Course confirmation email has been sent to the applicant",
        })

        const refreshedData = await getApplicationDetails(Number.parseInt(params.id))
        if (refreshedData) {
          setApplication(refreshedData)
        }
      } else {
        toast({
          title: "Email Not Sent",
          description: result.error || "Failed to send confirmation email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending confirmation email:", error)
      toast({
        title: "Email Not Sent",
        description: "An error occurred while sending the confirmation email",
        variant: "destructive",
      })
    } finally {
      setSendingEmail(false)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const result = await getApplicationForExport(Number.parseInt(params.id))

      if (result.success && result.data) {
        const dataToExport = [result.data]
        const applicantName = result.data.applicant.full_name.replace(/\s+/g, "_").toLowerCase()
        const fileName = `application_${applicantName}_${params.id}.xlsx`

        downloadExcel(dataToExport, fileName)

        toast({
          title: "Export Successful",
          description: "Application exported to Excel",
        })
      } else {
        toast({
          title: "Export Failed",
          description: result.error || "Failed to export application",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "An error occurred during export",
        variant: "destructive",
      })
    } finally {
      setExporting(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Approved
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Rejected
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatBusinessStatus = (status: string) => {
    switch (status) {
      case "has_business_less_3":
        return "Has business (less than 3 years)"
      case "has_business_more_3":
        return "Has business (more than 3 years)"
      case "no_business":
        return "No business"
      default:
        return status || "N/A"
    }
  }

  const formatEmploymentStatus = (status: string) => {
    switch (status) {
      case "unemployed":
        return "Unemployed"
      case "self_employed":
        return "Self-employed"
      case "employed":
        return "Employed"
      case "student":
        return "Student"
      default:
        return status || "N/A"
    }
  }

  const formatLocationType = (type: string) => {
    switch (type) {
      case "rural":
        return "Rural"
      case "semi_urban":
        return "Semi-Urban"
      case "urban":
        return "Urban"
      default:
        return type || "N/A"
    }
  }

  const formatAcademicQualification = (qualification: string) => {
    switch (qualification) {
      case "ssce":
        return "SSCE"
      case "undergraduate":
        return "Undergraduate"
      case "ond_nce":
        return "OND/NCE"
      case "hnd":
        return "HND"
      case "bachelors":
        return "Bachelor's Degree"
      case "masters":
        return "Master's Degree"
      default:
        return qualification || "N/A"
    }
  }

  const formatStudentLevel = (level: string) => {
    switch (level) {
      case "100_level":
        return "100 Level"
      case "200_level":
        return "200 Level"
      case "300_level":
        return "300 Level"
      case "400_level":
        return "400 Level"
      case "500_level":
        return "500 Level"
      default:
        return level || "N/A"
    }
  }

  const formatReferralSource = (source: string) => {
    switch (source) {
      case "sla_facebook":
        return "SLA's Facebook page"
      case "sla_instagram":
        return "SLA's Instagram page"
      case "sla_email":
        return "SLA's email"
      case "linkedin":
        return "LinkedIn"
      case "others":
        return "Others"
      default:
        return source || "N/A"
    }
  }

  const parseSocialMediaPlatforms = (platforms: string) => {
    try {
      const parsed = JSON.parse(platforms || "[]")
      return Array.isArray(parsed) ? parsed.join(", ") : "N/A"
    } catch {
      return platforms || "N/A"
    }
  }

  const parseDigitalStrategies = (strategies: string) => {
    try {
      const parsed = JSON.parse(strategies || "[]")
      return Array.isArray(parsed) ? parsed.join(", ") : "N/A"
    } catch {
      return strategies || "N/A"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#0087DB] border-r-transparent"></div>
          <p className="mt-2 text-gray-500">Loading application details...</p>
        </div>
      </div>
    )
  }

  if (!application) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="text-center">
          <p className="text-xl font-semibold">Application not found</p>
          <Button onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Application Details</h2>
          </div>
          <p className="text-gray-500">Review and manage application</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            onClick={handleSendConfirmationEmail}
            disabled={sendingEmail}
            className="border-blue-200 text-blue-700 hover:bg-blue-50 bg-transparent"
          >
            <Mail className="mr-2 h-4 w-4" />
            {sendingEmail ? "Sending..." : "Send Course Email"}
          </Button>

          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="border-[#0087DB] text-[#0087DB] hover:bg-blue-50 bg-transparent"
          >
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            {exporting ? "Exporting..." : "Export to Excel"}
          </Button>

          {application.status === "pending" && (
            <>
              <Button
                variant="outline"
                className="border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
                onClick={() => handleStatusUpdate("rejected")}
                disabled={updating || sendingEmail}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
              <Button
                className="bg-[#0087DB] hover:bg-[#0076C7]"
                onClick={() => handleStatusUpdate("approved")}
                disabled={updating || sendingEmail}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Approve
              </Button>
            </>
          )}

          {application.status === "approved" && (
            <Button
              variant="outline"
              className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 bg-transparent"
              onClick={() => handleStatusUpdate("pending")}
              disabled={updating || sendingEmail}
            >
              <Clock className="mr-2 h-4 w-4" />
              Mark as Pending
            </Button>
          )}

          {application.status === "rejected" && (
            <Button
              variant="outline"
              className="border-yellow-200 text-yellow-700 hover:bg-yellow-50 bg-transparent"
              onClick={() => handleStatusUpdate("pending")}
              disabled={updating || sendingEmail}
            >
              <Clock className="mr-2 h-4 w-4" />
              Mark as Pending
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Application Information</CardTitle>
              {getStatusBadge(application.status)}
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="personal">
              <TabsList className="mb-4">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="application">Application Details</TabsTrigger>
                <TabsTrigger value="course">Course Info</TabsTrigger>
                <TabsTrigger value="responses">Course Responses</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                    <p className="mt-1">{application.applicant.full_name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Email</h3>
                    <p className="mt-1">{application.applicant.email}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Phone Number</h3>
                    <p className="mt-1">{application.applicant.phone_number}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                    <p className="mt-1">{formatDate(application.applicant.date_of_birth)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1">{application.applicant.location}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location Type</h3>
                    <p className="mt-1">{formatLocationType(application.applicant.location_type)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Academic Qualification</h3>
                    <p className="mt-1">{formatAcademicQualification(application.applicant.academic_qualification)}</p>
                  </div>
                  {application.applicant.student_level && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Student Level</h3>
                      <p className="mt-1">{formatStudentLevel(application.applicant.student_level)}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Employment Status</h3>
                    <p className="mt-1">{formatEmploymentStatus(application.applicant.employment_status)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Internally Displaced</h3>
                    <p className="mt-1">{application.applicant.is_displaced ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Disability Status</h3>
                    <p className="mt-1">{application.applicant.has_disability ? "Yes" : "No"}</p>
                  </div>
                  {application.applicant.has_disability && (
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Disability Type</h3>
                      <p className="mt-1">{application.applicant.disability_type}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Referral Source</h3>
                    <p className="mt-1">{formatReferralSource(application.applicant.referral_source)}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="application" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Pathway</h3>
                    <p className="mt-1 capitalize">{application.pathway}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Submission Date</h3>
                    <p className="mt-1">{formatDate(application.submitted_at)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Business Status</h3>
                    <p className="mt-1">{formatBusinessStatus(application.business_age)}</p>
                  </div>
                  {application.business_sector && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Business Sector</h3>
                      <p className="mt-1 capitalize">{application.business_sector.replace(/_/g, " ")}</p>
                    </div>
                  )}
                  {application.company_name && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Company Name</h3>
                      <p className="mt-1">{application.company_name}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Taken Booster Course</h3>
                    <p className="mt-1">{application.taken_booster_course ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Work Interest</h3>
                    <p className="mt-1">{application.work_interest ? "Yes" : "No"}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="course" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Course Name</h3>
                    <p className="mt-1">{application.course.name}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Start Date</h3>
                    <p className="mt-1">{formatDate(application.course.start_date)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Duration</h3>
                    <p className="mt-1">{application.course.duration}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Location</h3>
                    <p className="mt-1">{application.course.location}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-1">{application.course.description}</p>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-sm font-medium text-gray-500">Requirements</h3>
                    <p className="mt-1">{application.course.requirements}</p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="responses" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Has Formal Training</h3>
                    <p className="mt-1">{application.has_formal_training ? "Yes" : "No"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Familiarity Scale (1-5)</h3>
                    <p className="mt-1">{application.familiarity_scale || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Has Used Tools</h3>
                    <p className="mt-1">{application.has_used_tools ? "Yes" : "No"}</p>
                  </div>
                  {application.tools_used && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Tools Used</h3>
                      <p className="mt-1">{application.tools_used}</p>
                    </div>
                  )}
                  {application.course_specific_answer && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Course Specific Answer</h3>
                      <p className="mt-1">{application.course_specific_answer}</p>
                    </div>
                  )}
                  {application.social_media_platforms && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Social Media Platforms</h3>
                      <p className="mt-1">{parseSocialMediaPlatforms(application.social_media_platforms)}</p>
                    </div>
                  )}
                  {application.digital_strategies && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Digital Strategies</h3>
                      <p className="mt-1">{parseDigitalStrategies(application.digital_strategies)}</p>
                    </div>
                  )}
                  {application.expectations && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Expectations</h3>
                      <p className="mt-1">{application.expectations}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Application Ease Rating (1-5)</h3>
                    <p className="mt-1">{application.application_ease_rating || "N/A"}</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Applicant Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-center">
              <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-[#0087DB]">
                  {application.applicant.full_name
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")}
                </span>
              </div>
            </div>

            <div className="text-center">
              <h3 className="font-medium">{application.applicant.full_name}</h3>
              <p className="text-sm text-gray-500">{application.applicant.email}</p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Application Timeline</h4>
              <div className="space-y-3">
                <div className="flex items-start">
                  <div className="mr-2 h-4 w-4 rounded-full bg-[#0087DB] mt-0.5"></div>
                  <div>
                    <p className="text-sm font-medium">Application Submitted</p>
                    <p className="text-xs text-gray-500">{formatDate(application.submitted_at)}</p>
                  </div>
                </div>

                {application.status !== "pending" && (
                  <div className="flex items-start">
                    <div
                      className={`mr-2 h-4 w-4 rounded-full mt-0.5 ${application.status === "approved" ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <div>
                      <p className="text-sm font-medium">
                        Application {application.status === "approved" ? "Approved" : "Rejected"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {application.updated_at ? formatDate(application.updated_at) : "Date not available"}
                      </p>
                    </div>
                  </div>
                )}

                {application.email_sent_at && (
                  <div className="flex items-start">
                    <div className="mr-2 h-4 w-4 rounded-full bg-blue-500 mt-0.5"></div>
                    <div>
                      <p className="text-sm font-medium">Course Email Sent</p>
                      <p className="text-xs text-gray-500">{formatDate(application.email_sent_at)}</p>
                    </div>
                  </div>
                )}

                {application.status_email_sent_at && (
                  <div className="flex items-start">
                    <div className="mr-2 h-4 w-4 rounded-full bg-blue-500 mt-0.5"></div>
                    <div>
                      <p className="text-sm font-medium">Status Update Email Sent</p>
                      <p className="text-xs text-gray-500">{formatDate(application.status_email_sent_at)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
