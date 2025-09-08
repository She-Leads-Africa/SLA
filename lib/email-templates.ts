interface CourseConfirmationEmailProps {
  applicantName: string
  courseName: string
  courseDescription: string
  startDate: string
  schedule: string
  duration: string
  location: string
  tutor: string
  requirements: string
  classLink: string
}

export function generateCourseConfirmationEmail({
  applicantName,
  courseName,
  courseDescription,
  startDate,
  schedule,
  duration,
  location,
  tutor,
  requirements,
  classLink,
}: CourseConfirmationEmailProps): string {
  const formattedStartDate = new Date(startDate).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Course Confirmation - She Leads Africa</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #0087DB;
        }
        .logo {
          font-size: 24px;
          font-weight: bold;
          color: #0087DB;
          margin-bottom: 10px;
        }
        .title {
          font-size: 28px;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .subtitle {
          font-size: 18px;
          color: #7f8c8d;
        }
        .course-info {
          background-color: #f8f9fa;
          border-left: 4px solid #0087DB;
          padding: 20px;
          margin: 20px 0;
          border-radius: 5px;
        }
        .course-title {
          font-size: 22px;
          font-weight: bold;
          color: #2c3e50;
          margin-bottom: 10px;
        }
        .info-row {
          display: flex;
          margin-bottom: 10px;
          align-items: flex-start;
        }
        .info-label {
          font-weight: bold;
          color: #34495e;
          min-width: 120px;
          margin-right: 10px;
        }
        .info-value {
          color: #2c3e50;
          flex: 1;
        }
        .cta-button {
          display: inline-block;
          background-color: #0087DB;
          color: #2c3e50;
          padding: 15px 30px;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
          text-align: center;
        }
        .requirements {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        .requirements-title {
          font-weight: bold;
          color: #856404;
          margin-bottom: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #ecf0f1;
          color: #7f8c8d;
          font-size: 14px;
        }
        .contact-info {
          background-color: #e8f5e8;
          border-radius: 5px;
          padding: 15px;
          margin: 20px 0;
        }
        @media (max-width: 600px) {
          body {
            padding: 10px;
          }
          .container {
            padding: 20px;
          }
          .info-row {
            flex-direction: column;
          }
          .info-label {
            min-width: auto;
            margin-bottom: 5px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">She Leads Africa</div>
          <h1 class="title">🎉 Congratulations!</h1>
          <p class="subtitle">Your application has been approved</p>
        </div>

        <p>Dear <strong>${applicantName}</strong>,</p>

        <p>We are thrilled to inform you that your application for our <strong>${courseName}</strong> course has been <span style="color: #27ae60; font-weight: bold;">APPROVED</span>!</p>

        <div class="course-info">
          <div class="course-title">${courseName}</div>
          <p style="color: #7f8c8d; margin-bottom: 15px;">${courseDescription}</p>
          
          <div class="info-row">
            <span class="info-label">📅 Start Date:</span>
            <span class="info-value">${formattedStartDate}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">⏰ Schedule:</span>
            <span class="info-value">${schedule}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">📚 Duration:</span>
            <span class="info-value">${duration}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">📍 Location:</span>
            <span class="info-value">${location}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">👩‍🏫 Instructor:</span>
            <span class="info-value">${tutor}</span>
          </div>
        </div>

        <div class="requirements">
          <div class="requirements-title">📋 Course Requirements:</div>
          <p>${requirements}</p>
        </div>

        <div style="text-align: center;">
          <a href="${classLink}" class="cta-button">Join Class Link</a>
        </div>

        <div style="text-align: center;">
          <a href="https://t.me/+3tGfoFJmO44wOTQ8" class="cta-button">Join BoostHer Community</a>
        </div>

        <div class="contact-info">
          <p><strong>📞 Need Help?</strong></p>
          <p>If you have any questions or need assistance, please don't hesitate to reach out to our support team. We're here to help you succeed!</p>
        </div>

        <p>We're excited to have you join our community of empowered women leaders. Get ready for an amazing learning journey!</p>

        <p>Best regards,<br>
        <strong>The She Leads Africa Team</strong></p>

        <div class="footer">
          <p>© 2025 She Leads Africa. All rights reserved.</p>
          <p>This email was sent because you applied for a course with She Leads Africa.</p>
        </div>
      </div>
    </body>
    </html>
  `
}
