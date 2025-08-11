import * as XLSX from "xlsx"

interface ExportData {
  id: number
  status: string
  submitted_at: string
  updated_at?: string
  email_sent_at?: string
  status_email_sent_at?: string
  pathway: string
  has_business: boolean
  business_age?: string
  business_sector?: string
  company_name?: string
  taken_booster_course: boolean
  work_interest: boolean
  has_formal_training?: boolean
  familiarity_scale?: number
  has_used_tools?: boolean
  tools_used?: string
  course_specific_answer?: string
  social_media_platforms?: string
  digital_strategies?: string
  expectations?: string
  application_ease_rating?: number
  applicant: {
    full_name: string
    email: string
    phone_number: string
    date_of_birth: string
    location: string
    location_type?: string
    academic_qualification: string
    student_level?: string
    employment_status?: string
    is_displaced: boolean
    has_disability: boolean
    disability_type?: string
    referral_source: string
  }
  course: {
    name: string
    description: string
    start_date: string
    duration: string
    location: string
    tutor: string
    schedule: string
    requirements?: string
  }
}

// Function to convert application data to Excel file
export function generateExcel(data: ExportData[], fileName = "applications.xlsx"): Blob {
  // Create a new workbook
  const workbook = XLSX.utils.book_new()

  // Process the data to make it Excel-friendly
  const processedData = data.map((app) => {
    // Extract applicant and course data
    const applicant = app.applicant || {}
    const course = app.course || {}

    // Format date fields
    const formatDate = (dateString: string) => {
      if (!dateString) return "N/A"
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    // Parse JSON fields
    const parseSocialMedia = (platforms: string) => {
      try {
        const parsed = JSON.parse(platforms || "[]")
        return Array.isArray(parsed) ? parsed.join(", ") : platforms || ""
      } catch {
        return platforms || ""
      }
    }

    const parseDigitalStrategies = (strategies: string) => {
      try {
        const parsed = JSON.parse(strategies || "[]")
        return Array.isArray(parsed) ? strategies.join(", ") : strategies || ""
      } catch {
        return strategies || ""
      }
    }

    // Format business status
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

    // Format employment status
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

    // Format location type
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

    // Format academic qualification
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

    // Format student level
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

    // Format referral source
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

    // Return a flattened object for Excel
    return {
      // Application Info
      "Application ID": app.id,
      Status: app.status.charAt(0).toUpperCase() + app.status.slice(1),
      "Submission Date": formatDate(app.submitted_at),
      "Last Updated": formatDate(app.updated_at || ""),
      "Email Sent Date": formatDate(app.email_sent_at || ""),
      "Status Email Sent": formatDate(app.status_email_sent_at || ""),

      // Personal Information
      "Full Name": applicant.full_name,
      Email: applicant.email,
      "Phone Number": applicant.phone_number,
      "Date of Birth": formatDate(applicant.date_of_birth),
      Location: applicant.location,
      "Location Type": formatLocationType(applicant.location_type || ""),
      "Academic Qualification": formatAcademicQualification(applicant.academic_qualification),
      "Student Level": formatStudentLevel(applicant.student_level || ""),
      "Employment Status": formatEmploymentStatus(applicant.employment_status || ""),
      "Internally Displaced": applicant.is_displaced ? "Yes" : "No",
      "Has Disability": applicant.has_disability ? "Yes" : "No",
      "Disability Type": applicant.disability_type || "N/A",
      "Referral Source": formatReferralSource(applicant.referral_source),

      // Application Details
      Pathway: app.pathway.charAt(0).toUpperCase() + app.pathway.slice(1),
      "Business Status": formatBusinessStatus(app.business_age || ""),
      "Business Sector": app.business_sector
        ? app.business_sector.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
        : "N/A",
      "Company Name": app.company_name || "N/A",
      "Taken Booster Course": app.taken_booster_course ? "Yes" : "No",
      "Work Interest": app.work_interest ? "Yes" : "No",

      // Course Information
      Course: course.name,
      "Course Description": course.description,
      "Course Start Date": formatDate(course.start_date),
      "Course Duration": course.duration,
      "Course Location": course.location,
      "Course Tutor": course.tutor,
      "Course Schedule": course.schedule,
      "Course Requirements": course.requirements || "N/A",

      // Course-Specific Responses
      "Has Formal Training": app.has_formal_training ? "Yes" : "No",
      "Familiarity Scale (1-5)": app.familiarity_scale || "N/A",
      "Has Used Tools": app.has_used_tools ? "Yes" : "No",
      "Tools Used": app.tools_used || "N/A",
      "Course Specific Answer": app.course_specific_answer || "N/A",
      "Social Media Platforms": parseSocialMedia(app.social_media_platforms || ""),
      "Digital Strategies": parseDigitalStrategies(app.digital_strategies || ""),
      Expectations: app.expectations || "N/A",
      "Application Ease Rating (1-5)": app.application_ease_rating || "N/A",
    }
  })

  // Create a worksheet from the data
  const worksheet = XLSX.utils.json_to_sheet(processedData)

  // Auto-size columns
  const colWidths = [
    { wch: 15 }, // Application ID
    { wch: 12 }, // Status
    { wch: 18 }, // Submission Date
    { wch: 18 }, // Last Updated
    { wch: 18 }, // Email Sent Date
    { wch: 20 }, // Status Email Sent
    { wch: 25 }, // Full Name
    { wch: 30 }, // Email
    { wch: 18 }, // Phone Number
    { wch: 15 }, // Date of Birth
    { wch: 15 }, // Location
    { wch: 15 }, // Location Type
    { wch: 20 }, // Academic Qualification
    { wch: 15 }, // Student Level
    { wch: 18 }, // Employment Status
    { wch: 18 }, // Internally Displaced
    { wch: 15 }, // Has Disability
    { wch: 20 }, // Disability Type
    { wch: 20 }, // Referral Source
    { wch: 15 }, // Pathway
    { wch: 25 }, // Business Status
    { wch: 20 }, // Business Sector
    { wch: 25 }, // Company Name
    { wch: 20 }, // Taken Booster Course
    { wch: 15 }, // Work Interest
    { wch: 30 }, // Course
    { wch: 50 }, // Course Description
    { wch: 18 }, // Course Start Date
    { wch: 15 }, // Course Duration
    { wch: 20 }, // Course Location
    { wch: 20 }, // Course Tutor
    { wch: 25 }, // Course Schedule
    { wch: 40 }, // Course Requirements
    { wch: 20 }, // Has Formal Training
    { wch: 20 }, // Familiarity Scale (1-5)
    { wch: 15 }, // Has Used Tools
    { wch: 30 }, // Tools Used
    { wch: 40 }, // Course Specific Answer
    { wch: 30 }, // Social Media Platforms
    { wch: 30 }, // Digital Strategies
    { wch: 50 }, // Expectations
    { wch: 25 }, // Application Ease Rating (1-5)
  ]
  worksheet["!cols"] = colWidths

  // Add the worksheet to the workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications")

  // Generate Excel file as a binary string
  const excelBinary = XLSX.write(workbook, { bookType: "xlsx", type: "binary" })

  // Convert binary string to Blob
  const buffer = new ArrayBuffer(excelBinary.length)
  const view = new Uint8Array(buffer)
  for (let i = 0; i < excelBinary.length; i++) {
    view[i] = excelBinary.charCodeAt(i) & 0xff
  }

  return new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" })
}

// Helper function to download the Excel file
export function downloadExcel(data: ExportData[], filename: string) {
  const blob = generateExcel(data, filename)
  const url = URL.createObjectURL(blob)

  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()

  // Clean up
  setTimeout(() => {
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, 0)
}
