import { NextResponse } from "next/server"
import { jsPDF } from "jspdf"
import { serverSupabase } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get("courseId")

    if (!courseId) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 })
    }

    // Fetch course data from database
    const { data: course, error } = await serverSupabase.from("courses").select("*").eq("id", courseId).single()

    if (error || !course) {
      return NextResponse.json({ success: false, error: "Course not found" }, { status: 404 })
    }

    // Create a new PDF document
    const doc = new jsPDF()

    // Set up colors and fonts
    const primaryColor = [0, 135, 219] // Blue color #0087DB
    const secondaryColor = [75, 85, 99] // Gray color

    // Add header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 30, "F")

    // Add logo/title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("She Leads Africa", 20, 20)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Course Details", 20, 26)

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Add course title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text(course.name, 20, 50)

    // Add approval status
    doc.setFillColor(219, 234, 254) // Light blue background
    doc.rect(20, 55, 50, 8, "F")
    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.setFont("helvetica", "bold")
    doc.text("✓ APPROVED", 22, 61)

    // Reset text color
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")

    // Add description
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const splitDescription = doc.splitTextToSize(course.description || "Course description not available", 170)
    doc.text(splitDescription, 20, 75)

    let yPosition = 75 + splitDescription.length * 5 + 10

    // Add course details section
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text("Course Information", 20, yPosition)
    yPosition += 10

    // Course details
    const details = [
      {
        label: "Start Date",
        value: course.start_date
          ? new Date(course.start_date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : "TBD",
      },
      { label: "Schedule", value: course.schedule || "TBD" },
      { label: "Duration", value: course.duration || "TBD" },
      { label: "Location", value: course.location || "TBD" },
      { label: "Class Link", value: course.class_link || "Will be provided" },
    ]

    doc.setFontSize(11)
    doc.setTextColor(...secondaryColor)
    doc.setFont("helvetica", "normal")

    details.forEach((detail) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${detail.label}:`, 20, yPosition)
      doc.setFont("helvetica", "normal")
      const splitValue = doc.splitTextToSize(detail.value, 120)
      doc.text(splitValue, 60, yPosition)
      yPosition += splitValue.length * 5 + 3
    })

    yPosition += 5

    // Add tutor information
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text("Your Tutor", 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setTextColor(...secondaryColor)
    doc.setFont("helvetica", "bold")
    doc.text("Name:", 20, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(course.tutor || "TBD", 60, yPosition)
    yPosition += 7

    if (course.tutor_bio) {
      doc.setFont("helvetica", "bold")
      doc.text("Bio:", 20, yPosition)
      doc.setFont("helvetica", "normal")
      const splitBio = doc.splitTextToSize(course.tutor_bio, 120)
      doc.text(splitBio, 60, yPosition)
      yPosition += splitBio.length * 5 + 8
    }

    // Add requirements
    if (course.requirements) {
      doc.setFontSize(16)
      doc.setFont("helvetica", "bold")
      doc.setTextColor(...primaryColor)
      doc.text("Requirements", 20, yPosition)
      yPosition += 10

      doc.setFontSize(11)
      doc.setTextColor(...secondaryColor)
      doc.setFont("helvetica", "normal")
      const splitRequirements = doc.splitTextToSize(course.requirements, 170)
      doc.text(splitRequirements, 20, yPosition)
      yPosition += splitRequirements.length * 5 + 10
    }

    // Add important notes
    doc.setFillColor(254, 243, 199) // Light yellow background
    doc.rect(20, yPosition, 170, 25, "F")
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(146, 64, 14) // Orange text
    doc.text("Important Reminders", 25, yPosition + 8)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    const reminders = [
      "• Mandatory orientation session details will be sent via email",
      "• Ensure you have all required materials before the course starts",
      "• Save the class link and add the schedule to your calendar",
    ]

    reminders.forEach((reminder, index) => {
      doc.text(reminder, 25, yPosition + 15 + index * 4)
    })

    yPosition += 35

    // Add footer
    doc.setFillColor(...primaryColor)
    doc.rect(0, 280, 210, 17, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("© 2025 She Leads Africa. All rights reserved.", 20, 290)
    doc.text("Generated on " + new Date().toLocaleDateString(), 20, 294)

    // Generate PDF as buffer
    const pdfBuffer = doc.output("arraybuffer")

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${course.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_course_details.pdf"`,
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { course, applicantName } = await request.json()

    if (!course) {
      return NextResponse.json({ success: false, error: "Course data is required" }, { status: 400 })
    }

    // Create a new PDF document
    const doc = new jsPDF()

    // Set up colors and fonts
    const primaryColor = [0, 135, 219] // Blue color #0087DB
    const secondaryColor = [75, 85, 99] // Gray color

    // Add header
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 30, "F")

    // Add logo/title
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("She Leads Africa", 20, 20)

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Course Details", 20, 26)

    // Reset text color
    doc.setTextColor(0, 0, 0)

    // Add course title
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text(course.name, 20, 50)

    // Add approval status
    doc.setFillColor(219, 234, 254) // Light blue background
    doc.rect(20, 55, 50, 8, "F")
    doc.setFontSize(10)
    doc.setTextColor(...primaryColor)
    doc.setFont("helvetica", "bold")
    doc.text("✓ APPROVED", 22, 61)

    // Reset text color
    doc.setTextColor(0, 0, 0)
    doc.setFont("helvetica", "normal")

    // Add description
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    const splitDescription = doc.splitTextToSize(course.description, 170)
    doc.text(splitDescription, 20, 75)

    let yPosition = 75 + splitDescription.length * 5 + 10

    // Add course details section
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text("Course Information", 20, yPosition)
    yPosition += 10

    // Course details
    const details = [
      {
        label: "Start Date",
        value: new Date(course.start_date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      },
      { label: "Schedule", value: course.schedule },
      { label: "Duration", value: course.duration },
      { label: "Location", value: course.location },
      { label: "Class Link", value: course.class_link },
    ]

    doc.setFontSize(11)
    doc.setTextColor(...secondaryColor)
    doc.setFont("helvetica", "normal")

    details.forEach((detail) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${detail.label}:`, 20, yPosition)
      doc.setFont("helvetica", "normal")
      const splitValue = doc.splitTextToSize(detail.value, 120)
      doc.text(splitValue, 60, yPosition)
      yPosition += splitValue.length * 5 + 3
    })

    yPosition += 5

    // Add tutor information
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text("Your Tutor", 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setTextColor(...secondaryColor)
    doc.setFont("helvetica", "bold")
    doc.text("Name:", 20, yPosition)
    doc.setFont("helvetica", "normal")
    doc.text(course.tutor, 60, yPosition)
    yPosition += 7

    doc.setFont("helvetica", "bold")
    doc.text("Bio:", 20, yPosition)
    doc.setFont("helvetica", "normal")
    const splitBio = doc.splitTextToSize(course.tutor_bio, 120)
    doc.text(splitBio, 60, yPosition)
    yPosition += splitBio.length * 5 + 8

    // Add requirements
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(...primaryColor)
    doc.text("Requirements", 20, yPosition)
    yPosition += 10

    doc.setFontSize(11)
    doc.setTextColor(...secondaryColor)
    doc.setFont("helvetica", "normal")
    const splitRequirements = doc.splitTextToSize(course.requirements, 170)
    doc.text(splitRequirements, 20, yPosition)
    yPosition += splitRequirements.length * 5 + 10

    // Add important notes
    doc.setFillColor(254, 243, 199) // Light yellow background
    doc.rect(20, yPosition, 170, 25, "F")
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.setTextColor(146, 64, 14) // Orange text
    doc.text("Important Reminders", 25, yPosition + 8)

    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.setTextColor(0, 0, 0)
    const reminders = [
      "• Mandatory orientation session on " + new Date(course.start_date).toLocaleDateString() + " at 2:00 PM WAT",
      "• Ensure you have all required materials before the course starts",
      "• Save the class link and add the schedule to your calendar",
    ]

    reminders.forEach((reminder, index) => {
      doc.text(reminder, 25, yPosition + 15 + index * 4)
    })

    yPosition += 35

    // Add footer
    doc.setFillColor(...primaryColor)
    doc.rect(0, 280, 210, 17, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")
    doc.text("© 2025 She Leads Africa. All rights reserved.", 20, 290)
    doc.text("Generated on " + new Date().toLocaleDateString(), 20, 294)

    // Generate PDF as buffer
    const pdfBuffer = doc.output("arraybuffer")

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${course.name.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_course_details.pdf"`,
        "Cache-Control": "no-cache",
        "X-Frame-Options": "ALLOWALL", // Or specify specific domains
        "Access-Control-Allow-Origin": "*", // Or restrict to your WordPress domain
      },
    })
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ success: false, error: "Failed to generate PDF" }, { status: 500 })
  }
}
