import { type NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseId = Number.parseInt(params.id)

    if (isNaN(courseId)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 })
    }

    const { data: questions, error } = await supabase
      .from("course_questions")
      .select("*")
      .eq("course_id", courseId)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching course questions:", error)
      return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
    }

    // Parse question_options JSON strings
    const parsedQuestions = questions.map((question) => ({
      ...question,
      question_options: question.question_options ? JSON.parse(question.question_options) : null,
    }))

    return NextResponse.json({
      success: true,
      questions: parsedQuestions,
    })
  } catch (error) {
    console.error("Error in course questions API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
