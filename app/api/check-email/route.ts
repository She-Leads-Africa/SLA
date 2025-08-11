import { NextResponse } from "next/server"
import { serverSupabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 })
    }

    console.log("🔍 Checking email:", email)

    const { data: existingApplicant, error } = await serverSupabase
      .from("applicants")
      .select("id, email")
      .eq("email", email.toLowerCase())
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("❌ Error checking email:", error)
      return NextResponse.json({ success: false, error: "Failed to check email" }, { status: 500 })
    }

    const exists = !!existingApplicant
    console.log(exists ? "⚠️ Email already exists" : "✅ Email is available")

    return NextResponse.json({
      success: true,
      exists,
      message: exists ? "Email already registered" : "Email is available",
    })
  } catch (error: any) {
    console.error("💥 Error in check-email API route:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
