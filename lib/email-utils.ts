import nodemailer from "nodemailer"

interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail({ to, subject, html, from }: EmailOptions) {
  try {
    console.log("📧 Setting up email transporter...")

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    console.log("📤 Sending email to:", to)

    const mailOptions = {
      from: from || process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      html,
    }

    const result = await transporter.sendMail(mailOptions)

    console.log("✅ Email sent successfully:", result.messageId)

    return {
      success: true,
      messageId: result.messageId,
    }
  } catch (error: any) {
    console.error("❌ Error sending email:", error)

    return {
      success: false,
      error: error.message || "Failed to send email",
    }
  }
}
