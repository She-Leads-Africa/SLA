import { NextResponse } from "next/server"
import { serverSupabase } from "@/lib/supabase"
import { sendEmail } from "@/lib/email-utils"
import { generateCourseConfirmationEmail } from "@/lib/email-templates"
import { google } from 'googleapis'
import { Readable } from 'stream'


//=====================Google Sheet==================

// Function to upload form data to Google Sheets
async function uploadToGoogleSheets(formData: any, applicantId: string, applicationId: string, courseDetails: any) {
  try {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID
    if (!spreadsheetId) {
      console.error('Google Sheet ID not configured')
      return
    }

    // Prepare the data for the sheet
    const rowData = [
      new Date().toISOString(), // Timestamp
      applicantId,
      applicationId,
      formData.fullName,
      formData.email,
      formData.phoneNumber || 'N/A',
      formData.dateOfBirth || 'N/A',
      formData.location || 'N/A',
      formData.locationType || 'N/A',
      formData.academicQualification || 'N/A',
      formData.studentLevel || 'N/A',
      formData.employmentStatus || 'N/A',
      formData.isDisplaced ? 'Yes' : 'No',
      formData.hasDisability ? 'Yes' : 'No',
      formData.disabilityType || 'N/A',
      formData.hasJobbermanCertificate ? 'Yes' : 'No',
      formData.referralSource || 'N/A',
      formData.ambassadorCode,
      courseDetails.name,
      formData.pathway,
      formData.businessStatus !== "no_business" && formData.businessStatus !== "" ? 'Yes' : 'No',
      formData.businessStatus || 'N/A',
      formData.businessSector || 'N/A',
      formData.companyName || 'N/A',
      formData.takenBoosterCourse ? 'Yes' : 'No',
      formData.workInterest ? 'Yes' : 'No',
      formData.hasFormalTraining || 'N/A',
      formData.familiarityScale || 'N/A',
      formData.hasUsedTools || 'N/A',
      formData.toolsUsed || 'N/A',
      formData.courseSpecificAnswer || 'N/A',
      Array.isArray(formData.socialMediaPlatforms) ? formData.socialMediaPlatforms.join(', ') : 'N/A',
      Array.isArray(formData.digitalStrategies) ? formData.digitalStrategies.join(', ') : 'N/A',
      formData.expectations || 'N/A',
      formData.applicationEaseRating || 'N/A',
    ]

    // Append the data to the sheet
    const { appendToSheet } = await import('@/lib/sheets-utils')
    await appendToSheet(spreadsheetId, 'Sheet1!A:AE', [rowData])

    console.log('✅ Data uploaded to Google Sheets successfully')
  } catch (error) {
    console.error('Error uploading to Google Sheets:', error)
    // Don't throw the error to avoid breaking the form submission
  }
}

//==============Drive set up=================================

const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/drive'],
});

const drive = google.drive({ version: 'v3', auth });



//==========Create drive folder function
async function createFolder(parentId: string, folderName: string) {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  }

  const response = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id,name,webViewLink'
  })

  return response.data
}



//=====================Upload drive file fuction

// Add to uploadFile function
async function uploadFile(folderId: string, fileName: string, content: Buffer, mimeType: string) {
  // Add delay to prevent rate limiting
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const media = {
    mimeType: mimeType,
    body: Readable.from(content)
  };

  return drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id,name,webViewLink'
  });
}


// Function to convert a file to a buffer
async function convertBase64ToBuffer(base64Data: string): Promise<Buffer> {
  const base64Content = base64Data.split(';base64,').pop() || '';
  return Buffer.from(base64Content, 'base64');
}


// Utility functions
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function isValidFileType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.includes(mimeType);
}

async function decodeBase64File(base64Data: string, fileName: string, mimeType: string) {
  const base64Content = base64Data.split(';base64,').pop() || '';
  return {
    buffer: Buffer.from(base64Content, 'base64'),
    name: fileName,
    type: mimeType
  };
}

//==============Drive set up=================================



export async function POST(request: Request) {
  try {
    console.log("🚀 Starting form submission process...")

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    let formData
    try {
      const requestText = await request.text()
      console.log("📝 Request body length:", requestText.length)

      if (!requestText || requestText.trim() === "") {
        throw new Error("Empty request body")
      }
      formData = JSON.parse(requestText)
    } catch (parseError) {
      console.error("❌ Error parsing request body:", parseError)
      return NextResponse.json(
        { success: false, error: "Invalid request format" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("📋 Received form submission:", {
      fullName: formData.fullName,
      email: formData.email,
      preferredCourse: formData.preferredCourse,
      pathway: formData.pathway,
      businessStatus: formData.businessStatus,
      employmentStatus: formData.employmentStatus,
      locationType: formData.locationType,
    })

    // Validate required fields
    if (!formData.email || !formData.fullName || !formData.preferredCourse) {
      console.error("❌ Missing required fields:", {
        hasEmail: !!formData.email,
        hasFullName: !!formData.fullName,
        hasPreferredCourse: !!formData.preferredCourse,
      })
      return NextResponse.json(
        { success: false, error: "Required fields are missing" },
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    // Format date properly
    let formattedDateOfBirth = formData.dateOfBirth
    if (formData.dateOfBirth) {
      try {
        const date = new Date(formData.dateOfBirth)
        formattedDateOfBirth = date.toISOString().split("T")[0]
      } catch (e) {
        console.error("⚠️ Date formatting error:", e)
        formattedDateOfBirth = new Date().toISOString().split("T")[0]
      }
    }

    // Get course details
    let courseId: number
    let courseDetails: any = null

    try {
      courseId = Number.parseInt(formData.preferredCourse)
      if (isNaN(courseId)) {
        throw new Error("Invalid course selection")
      }

      console.log("🔍 Fetching course details for ID:", courseId)
      const { data: courseData, error: courseError } = await serverSupabase
        .from("courses")
        .select("*")
        .eq("id", courseId)
        .single()
        .abortSignal(controller.signal)

      if (courseError) {
        console.error("❌ Course query error:", courseError)
        clearTimeout(timeoutId)
        return NextResponse.json(
          { success: false, error: `Course not found: ${courseError.message}` },
          { status: 404, headers: { "Content-Type": "application/json" } },
        )
      }

      if (!courseData) {
        console.error("❌ No course data returned")
        clearTimeout(timeoutId)
        return NextResponse.json(
          { success: false, error: "Selected course not found. Please refresh and try again." },
          { status: 404, headers: { "Content-Type": "application/json" } },
        )
      }

      courseDetails = courseData
      console.log("✅ Course details fetched:", courseDetails.name)
    } catch (error: any) {
      console.error("❌ Error handling course:", error)
      clearTimeout(timeoutId)
      return NextResponse.json(
        { success: false, error: `Failed to process course information: ${error?.message || "Unknown error"}` },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    // Sanitize all enum values to ensure they match database constraints
    const sanitizeEmploymentStatus = (status: string) => {
      const validStatuses = ["employed", "unemployed", "self_employed", "student", "other"]
      return validStatuses.includes(status) ? status : "unemployed"
    }

    const sanitizeLocationType = (type: string) => {
      const validTypes = ["urban", "semi_urban", "rural", "suburban"]
      return validTypes.includes(type) ? type : "urban"
    }

    const sanitizeAcademicQualification = (qual: string) => {
      const validQuals = [
        "primary",
        "secondary",
        "undergraduate",
        "bachelors",
        "masters",
        "phd",
        "diploma",
        "certificate",
        "other",
      ]
      return validQuals.includes(qual) ? qual : "other"
    }

    const sanitizeStudentLevel = (level: string) => {
      const validLevels = [
        "100_level",
        "200_level",
        "300_level",
        "400_level",
        "500_level",
        "600_level",
        "graduate",
        "postgraduate",
      ]
      return validLevels.includes(level) ? level : null
    }

    const sanitizeReferralSource = (source: string) => {
      const validSources = [
        "sla_website",
        "sla_instagram",
        "sla_twitter",
        "sla_facebook",
        "sla_linkedin",
        "friend_referral",
        "google_search",
        "others",
      ]
      return validSources.includes(source) ? source : "others"
    }

    const sanitizeBusinessAge = (age: string) => {
      const validAges = ["no_business", "less_than_1_year", "1_to_3_years", "more_than_3_years"]
      return validAges.includes(age) ? age : "no_business"
    }

    // Insert applicant data
    console.log("👤 Inserting applicant data...")
    const applicantInsertData = {
      full_name: formData.fullName,
      email: formData.email,
      phone_number: formData.phoneNumber || "N/A",
      date_of_birth: formattedDateOfBirth || new Date().toISOString().split("T")[0],
      location: formData.location || "N/A",
      location_type: sanitizeLocationType(formData.locationType || "urban"),
      academic_qualification: sanitizeAcademicQualification(formData.academicQualification || "other"),
      student_level: sanitizeStudentLevel(formData.studentLevel || ""),
      employment_status: sanitizeEmploymentStatus(formData.employmentStatus || "unemployed"),
      is_displaced: formData.isDisplaced === true,
      has_disability: formData.hasDisability === true,
      disability_type: formData.hasDisability === true ? formData.disabilityType || "Not specified" : null,
      has_jobberman_certificate: formData.hasJobbermanCertificate === true,
      referral_source: sanitizeReferralSource(formData.referralSource || "others"),
    }

    console.log("📊 Applicant data to insert:", applicantInsertData)

    const { data: applicantData, error: applicantError } = await serverSupabase
      .from("applicants")
      .insert(applicantInsertData)
      .select("id")
      .single()
      .abortSignal(controller.signal)

    if (applicantError) {
      console.error("❌ Error inserting applicant:", applicantError)
      clearTimeout(timeoutId)
      return NextResponse.json(
        { success: false, error: `Failed to create applicant: ${applicantError.message}` },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("✅ Applicant created with ID:", applicantData.id)

    // Process scale values properly
    const familiarityScale = formData.familiarityScale ? Number(formData.familiarityScale) : null
    const applicationEaseRating = formData.applicationEaseRating ? Number(formData.applicationEaseRating) : null

    // Insert application data
    console.log("📄 Inserting application data...")
    const applicationInsertData = {
      applicant_id: applicantData.id,
      course_id: courseId,
      pathway: formData.pathway === "entrepreneurship" ? "entrepreneurship" : "professional",
      has_business: formData.businessStatus !== "no_business" && formData.businessStatus !== "",
      business_age: sanitizeBusinessAge(formData.businessStatus || "no_business"),
      business_sector: formData.businessSector || null,
      company_name: formData.companyName || null,
      taken_booster_course: formData.takenBoosterCourse === true,
      work_interest: formData.workInterest === true,
      has_formal_training: formData.hasFormalTraining || null,
      familiarity_scale: familiarityScale,
      has_used_tools: formData.hasUsedTools || null,
      tools_used: formData.toolsUsed || null,
      course_specific_answer: formData.courseSpecificAnswer || null,
      social_media_platforms: JSON.stringify(formData.socialMediaPlatforms || []),
      digital_strategies: JSON.stringify(formData.digitalStrategies || []),
      expectations: formData.expectations || null,
      application_ease_rating: applicationEaseRating,
      status: "approved", // Automatically approve
      email_sent: false,
    }

    console.log("📊 Application data to insert:", applicationInsertData)

    const { data: applicationData, error: applicationError } = await serverSupabase
      .from("applications")
      .insert(applicationInsertData)
      .select("id")
      .single()
      .abortSignal(controller.signal)

    if (applicationError) {
      console.error("❌ Error inserting application:", applicationError)
      clearTimeout(timeoutId)
      return NextResponse.json(
        { success: false, error: `Failed to submit application: ${applicationError.message}` },
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    console.log("✅ Application created with ID:", applicationData.id)
    clearTimeout(timeoutId)



    //============ Upload to Google Sheets (non-blocking)
    
try {
  console.log("📊 Uploading data to Google Sheets...")
  await uploadToGoogleSheets(formData, applicantData.id, applicationData.id, courseDetails)
} catch (sheetsError) {
  console.error("⚠️ Google Sheets upload failed, but continuing:", sheetsError)
  // Continue even if sheets upload fails
}

    // ================= Google Drive Upload =====================
try {
  if (!DRIVE_FOLDER_ID || !GOOGLE_CLIENT_EMAIL || !GOOGLE_PRIVATE_KEY) {
    console.error('Google Drive configuration missing. Skipping upload.');
  } else {
    // Create pathway-specific folder
    const pathwayFolderName = formData.pathway === "entrepreneurship" 
      ? "Entrepreneurship Applicants" 
      : "Professional Applicants";
    
    //const pathwayFolder = await createFolder(DRIVE_FOLDER_ID, pathwayFolderName);

    // Create applicant folder
    const applicantFolderName = `${formData.fullName || "Applicant"} - ${new Date().toISOString().split('T')[0]}`;
    const applicantFolder = await createFolder(DRIVE_FOLDER_ID, applicantFolderName);


    // Update applicant record with drive info
    const { error: updateError } = await serverSupabase
    .from('applicants')
    .update({
      drive_folder_id: applicantFolder.id,
      drive_folder_link: applicantFolder.webViewLink
    })
    .eq('id', applicantData.id);

    if (updateError) {
    console.error('Error updating applicant drive info:', updateError);
    } else {
    console.log('✅ Updated applicant drive folder info');
    }

    // Upload form data summary
    const summaryContent: any = `Application Summary\n==================\n${Object.entries(formData)
  .filter(([key]) => !['idDocument', 'cv', 'academicCertificate'].includes(key))
  .map(([key, value]) => {
    if (value && typeof value === 'object') {
      return `${key}:\n${JSON.stringify(value, null, 2)}`;
    }
    return `${key}: ${value}`;
  })
  .join('\n\n')}`;

    await uploadFile(
      applicantFolder.id!,
      'application-summary.txt',
      summaryContent,
      'text/plain'
    );

    // Upload files
   const fileFields = ['idDocument', 'cv', 'academicCertificate'];
for (const field of fileFields) {
  if (formData[field]?.data) {
    const fileInfo = formData[field];
    
    // Validate file
    if (!isValidFileType(fileInfo.type)) {
      console.warn(`Skipping invalid file type: ${fileInfo.type} for ${field}`);
      continue;
    }
    
    // Convert base64 to buffer
    const buffer = await convertBase64ToBuffer(fileInfo.data);
    
    // Check size
    if (buffer.length > MAX_FILE_SIZE) {
      console.warn(`File ${fileInfo.name} exceeds size limit (${buffer.length} bytes)`);
      continue;
    }

    // Upload to Drive
    const uploadedFile = await uploadFile(
      applicantFolder.id!,
      `${field}-${fileInfo.name}`,
      buffer,
      fileInfo.type
    );

    // Store document metadata
    await serverSupabase.from('documents').insert({
      applicant_id: applicantData.id,
      document_type: field,
      file_name: fileInfo.name,
      drive_file_id: uploadedFile.data.id!,
      drive_file_link: uploadedFile.data.webViewLink!
    });
  }
}

    // Update application with drive link
    await serverSupabase
      .from("applications")
      .update({ drive_folder_link: applicantFolder.webViewLink })
      .eq("id", applicationData.id);
  }
} catch (driveError: any) {
  console.error("Google Drive upload failed:", driveError);
  // Continue processing even if drive fails
}


    // Send confirmation email (optional - won't fail the submission if it fails)
    if (formData.email && courseDetails) {
      try {
        console.log("📧 Sending confirmation email to:", formData.email)

        const emailHtml = generateCourseConfirmationEmail({
          applicantName: formData.fullName,
          courseName: courseDetails.name,
          courseDescription: courseDetails.description,
          startDate: courseDetails.start_date,
          schedule: courseDetails.schedule,
          duration: courseDetails.duration,
          location: courseDetails.location,
          tutor: courseDetails.tutor,
          requirements: courseDetails.requirements || "Laptop with stable internet connection",
          classLink: courseDetails.class_link || "https://meet.google.com/sla-course",
        })

        const emailResult = await sendEmail({
          to: formData.email,
          subject: `🎉 She Leads Africa: Your Application for ${courseDetails.name} is Approved!`,
          html: emailHtml,
        })

        if (emailResult.success) {
          console.log("✅ Confirmation email sent successfully")
          await serverSupabase
            .from("applications")
            .update({
              email_sent: true,
              email_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", applicationData.id)
        } else {
          console.error("⚠️ Failed to send confirmation email:", emailResult.error)
        }
      } catch (emailError) {
        console.error("⚠️ Exception while sending email:", emailError)
        // Don't fail the submission if email fails
      }
    }

    console.log("🎉 Form submission completed successfully!")
    return NextResponse.json(
      {
        success: true,
        message: "Application submitted and approved successfully",
        courseId: courseId,
        status: "approved",
        courseDetails: courseDetails,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error: any) {
    console.error("💥 Error in submit-application API route:", error)

    if (error.name === "AbortError") {
      return NextResponse.json(
        { success: false, error: "Request timeout. Please try again." },
        { status: 408, headers: { "Content-Type": "application/json" } },
      )
    }

    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}