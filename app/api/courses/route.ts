import { NextResponse } from "next/server"
import { serverSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching courses from database...")

    const { data: courses, error } = await serverSupabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: true })

    if (error) {
      console.error("❌ Error fetching courses:", error)
      return NextResponse.json({ success: false, error: "Failed to fetch courses" }, { status: 500 })
    }

    console.log("✅ Successfully fetched courses:", courses?.length || 0)

    return NextResponse.json({
      success: true,
      courses: courses || [],
    })
  } catch (error: any) {
    console.error("💥 Error in courses API route:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
