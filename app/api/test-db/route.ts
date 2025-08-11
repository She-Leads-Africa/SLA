import { NextResponse } from "next/server"
import { serverSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    // Log environment variables (without exposing sensitive values)
    console.log("Supabase environment check:", {
      hasUrl: !!process.env.SUPABASE_URL || !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasAnonKey: !!process.env.SUPABASE_ANON_KEY || !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })

    // Test the Supabase connection
    const { data, error } = await serverSupabase.from("courses").select("count").limit(1)

    if (error) {
      console.error("Supabase connection test failed:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Supabase connection successful",
      data,
    })
  } catch (error: any) {
    console.error("Unexpected error in database test:", error)
    return NextResponse.json({ success: false, error: error.message || "Unknown error" }, { status: 500 })
  }
}
