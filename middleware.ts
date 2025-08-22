// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Only apply middleware to admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
    // Skip middleware for login page and API routes
    if (request.nextUrl.pathname === "/admin/login" || request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.next()
    }

    // Check for authentication cookie
    const authCookie = request.cookies.get("admin-auth")

    if (!authCookie || authCookie.value !== "authenticated") {
      // Redirect to login page
      const loginUrl = new URL("/admin/login", request.url)
      
      // Create response and add CORS headers for iframe
      const response = NextResponse.redirect(loginUrl)
      response.headers.set('Access-Control-Allow-Origin', 'https://sheleadsafrica.org')
      response.headers.set('Access-Control-Allow-Credentials', 'true')
      
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}