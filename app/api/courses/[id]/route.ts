import { NextResponse } from "next/server"
import { serverSupabase } from "@/lib/supabase"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // Add timeout and error handling
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

    // Fetch course from database
    const { data, error } = await serverSupabase
      .from("courses")
      .select("*")
      .eq("id", id)
      .single()
      .abortSignal(controller.signal)

    clearTimeout(timeoutId)

    if (error) {
      console.error("Error fetching course by ID:", error)
      return NextResponse.json(
        { success: false, error: "Course not found" },
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    return NextResponse.json(
      {
        success: true,
        course: data,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  } catch (error: any) {
    console.error("Error in courses/[id] API route:", error)

    // Handle abort error specifically
    if (error.name === "AbortError") {
      return NextResponse.json(
        {
          success: false,
          error: "Request timeout",
        },
        {
          status: 408,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "An unexpected error occurred",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
