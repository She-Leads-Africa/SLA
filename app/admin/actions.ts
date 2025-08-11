"use server"

import { serverSupabase } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-utils"
import { generateCourseConfirmationEmail } from "@/lib/email-templates"

// Function to send a course confirmation email to an applicant
export async function sendCourseConfirmationEmail(applicationId: number) {
  try {
    console.log(`Sending course confirmation email for application ID: ${applicationId}`)

    // Fetch the application with applicant and course details
    const { data, error } = await serverSupabase
      .from("applications")
      .select(`
        *,
        applicant:applicant_id(*),
        course:course_id(*)
      `)
      .eq("id", applicationId)
      .single()

    if (error || !data) {
      console.error("Error fetching application details:", error)
      return { success: false, error: "Failed to fetch application details" }
    }

    const { applicant, course } = data

    if (!applicant || !course) {
      console.error("Missing applicant or course information", { applicant, course })
      return { success: false, error: "Missing applicant or course information" }
    }

    if (!applicant.email) {
      console.error("Applicant has no email address", { applicant })
      return { success: false, error: "Applicant has no email address" }
    }

    console.log("Generating email for:", {
      name: applicant.full_name,
      email: applicant.email,
      course: course.name,
    })

    // Generate email content
    const emailHtml = generateCourseConfirmationEmail({
      applicantName: applicant.full_name,
      courseName: course.name,
      courseDescription: course.description,
      startDate: course.start_date,
      schedule: course.schedule,
      duration: course.duration,
      location: course.location,
      tutor: course.tutor,
      requirements: course.requirements,
      classLink: course.class_link,
    })

    // Send the email
    const emailResult = await sendEmail({
      to: applicant.email,
      subject: `She Leads Africa: Your Application for ${course.name} is Confirmed`,
      html: emailHtml,
    })

    if (!emailResult.success) {
      console.error("Failed to send confirmation email:", emailResult.error)
      return { success: false, error: `Failed to send email: ${emailResult.error}` }
    }

    console.log("Email sent successfully, updating database record")

    // Update the application to record that an email was sent
    // Only update the updated_at timestamp which should exist in most tables
    try {
      const { error: updateError } = await serverSupabase
        .from("applications")
        .update({
          // Only update the timestamp
          updated_at: new Date().toISOString(),
        })
        .eq("id", applicationId)

      if (updateError) {
        console.error("Error updating application after email sent:", updateError)
        // We still return success since the email was sent
      }
    } catch (error) {
      console.error("Could not update application record, but email was sent:", error)
      // Don't fail the operation just because we couldn't update the record
    }

    return { success: true }
  } catch (error) {
    console.error("Error sending course confirmation email:", error)
    return { success: false, error: `An unexpected error occurred: ${error}` }
  }
}

// Function to send a status update email to an applicant
export async function sendStatusUpdateEmail(applicationId: number, status: string) {
  try {
    // Fetch the application with applicant and course details
    const { data, error } = await serverSupabase
      .from("applications")
      .select(`
        *,
        applicant:applicant_id(*),
        course:course_id(*)
      `)
      .eq("id", applicationId)
      .single()

    if (error || !data) {
      console.error("Error fetching application details:", error)
      return { success: false, error: "Failed to fetch application details" }
    }

    const { applicant, course } = data

    if (!applicant || !course) {
      return { success: false, error: "Missing applicant or course information" }
    }

    // Determine the email subject and content based on status
    let subject = ""
    let html = ""

    if (status === "approved") {
      subject = `She Leads Africa: Your Application for ${course.name} has been Approved`
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Application Approved - She Leads Africa</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #15803d;
              padding: 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>She Leads Africa</h1>
              <p>Application Approved</p>
            </div>
            <div class="content">
              <p>Dear ${applicant.full_name},</p>
              
              <p>We are pleased to inform you that your application for the <strong>${course.name}</strong> course has been approved!</p>
              
              <p>You will receive further instructions about the course start date and other details soon.</p>
              
              <p>If you have any questions, please contact our support team at support@sheleadsafrica.org.</p>
              
              <p>Best regards,<br>The She Leads Africa Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 She Leads Africa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    } else if (status === "rejected") {
      subject = `She Leads Africa: Update on Your Application for ${course.name}`
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Application Update - She Leads Africa</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #15803d;
              padding: 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>She Leads Africa</h1>
              <p>Application Update</p>
            </div>
            <div class="content">
              <p>Dear ${applicant.full_name},</p>
              
              <p>Thank you for your interest in the <strong>${course.name}</strong> course.</p>
              
              <p>After careful review, we regret to inform you that we are unable to approve your application at this time.</p>
              
              <p>We encourage you to apply for future courses that match your skills and interests.</p>
              
              <p>If you have any questions, please contact our support team at support@sheleadsafrica.org.</p>
              
              <p>Best regards,<br>The She Leads Africa Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 She Leads Africa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    } else {
      // For other statuses, we'll use a generic update email
      subject = `She Leads Africa: Update on Your Application for ${course.name}`
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Application Update - She Leads Africa</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #15803d;
              padding: 20px;
              text-align: center;
              color: white;
            }
            .content {
              padding: 20px;
              background-color: #f9fafb;
            }
            .footer {
              text-align: center;
              padding: 20px;
              font-size: 12px;
              color: #6b7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>She Leads Africa</h1>
              <p>Application Update</p>
            </div>
            <div class="content">
              <p>Dear ${applicant.full_name},</p>
              
              <p>This is to inform you that there has been an update to your application for the <strong>${course.name}</strong> course.</p>
              
              <p>Your application status has been updated to: <strong>${status}</strong>.</p>
              
              <p>If you have any questions, please contact our support team at support@sheleadsafrica.org.</p>
              
              <p>Best regards,<br>The She Leads Africa Team</p>
            </div>
            <div class="footer">
              <p>&copy; 2025 She Leads Africa. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    }

    // Send the email
    const emailResult = await sendEmail({
      to: applicant.email,
      subject,
      html,
    })

    if (!emailResult.success) {
      console.error("Failed to send status update email:", emailResult.error)
      return { success: false, error: "Failed to send email" }
    }

    // Update the application to record that an email was sent
    await serverSupabase
      .from("applications")
      .update({ status_email_sent: true, status_email_sent_at: new Date().toISOString() })
      .eq("id", applicationId)

    return { success: true }
  } catch (error) {
    console.error("Error sending status update email:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
