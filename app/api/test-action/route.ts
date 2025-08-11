import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const data = await request.json()

    return NextResponse.json({
      success: true,
      message: "Server action test successful",
      receivedData: data,
    })
  } catch (error: any) {
    console.error("Error in test action:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
