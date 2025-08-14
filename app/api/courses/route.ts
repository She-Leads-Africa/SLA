import { NextResponse } from "next/server"
import { serverSupabase } from "@/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Fetching courses from database...")

    const { data: courses, error } = await serverSupabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

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

export async function POST(request: Request) {
  try {
    console.log("🔍 Creating new course...")

    const body = await request.json()
    console.log("📝 Course data received:", body)

    // Validate required fields
    if (
      !body.name ||
      !body.description ||
      !body.schedule ||
      !body.start_date ||
      !body.duration ||
      !body.location ||
      !body.tutor
    ) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    const courseData = {
      name: body.name,
      description: body.description,
      schedule: body.schedule,
      start_date: body.start_date,
      duration: body.duration,
      location: body.location,
      tutor: body.tutor,
      class_link: body.class_link || "https://meet.google.com/sla-default",
      tutor_bio: body.tutor_bio || "Experienced instructor",
      requirements: body.requirements || "Laptop with stable internet connection",
    }

    const { data: course, error } = await serverSupabase.from("courses").insert([courseData]).select().single()

    if (error) {
      console.error("❌ Error creating course:", error)
      return NextResponse.json({ success: false, error: "Failed to create course" }, { status: 500 })
    }

    console.log("✅ Course created successfully:", course.id)

    return NextResponse.json({
      success: true,
      course: course,
    })
  } catch (error: any) {
    console.error("💥 Error in course creation:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    console.log("🔍 Updating course...")

    const body = await request.json()
    console.log("📝 Course update data received:", body)

    if (!body.id) {
      return NextResponse.json({ success: false, error: "Course ID is required" }, { status: 400 })
    }

    const courseData = {
      name: body.name,
      description: body.description,
      schedule: body.schedule,
      start_date: body.start_date,
      duration: body.duration,
      location: body.location,
      tutor: body.tutor,
      class_link: body.class_link,
      tutor_bio: body.tutor_bio,
      requirements: body.requirements,
    }

    const { data: course, error } = await serverSupabase
      .from("courses")
      .update(courseData)
      .eq("id", body.id)
      .select()
      .single()

    if (error) {
      console.error("❌ Error updating course:", error)
      return NextResponse.json({ success: false, error: "Failed to update course" }, { status: 500 })
    }

    console.log("✅ Course updated successfully:", course.id)

    return NextResponse.json({
      success: true,
      course: course,
    })
  } catch (error: any) {
    console.error("💥 Error in course update:", error)
    return NextResponse.json(
      { success: false, error: error.message || "An unexpected error occurred" },
      { status: 500 },
    )
  }
}
