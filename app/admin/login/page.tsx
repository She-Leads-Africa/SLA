"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, AlertCircle, CheckCircle } from "lucide-react"
import { setAuthCookie, isAuthenticated, validateCredentials } from "@/lib/auth-utils"
import Image from "next/image"

export default function AdminLogin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState("")
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    if (isAuthenticated()) {
      router.push("/admin")
    }

    // Add debug info in development
    if (process.env.NODE_ENV === "development") {
      setDebugInfo(`
        Environment: ${process.env.NODE_ENV}
        Username configured: ${!!process.env.NEXT_PUBLIC_ADMIN_USERNAME}
        Password configured: ${!!process.env.NEXT_PUBLIC_ADMIN_PASSWORD}
        Protocol: ${window.location.protocol}
      `)
    }
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // Validate credentials
      if (!validateCredentials(username, password)) {
        setError("Invalid username or password")
        setIsLoading(false)
        return
      }

      // Set authentication cookie
      const cookieSet = setAuthCookie("authenticated")

      if (!cookieSet) {
        setError("Failed to set authentication cookie. Please try again.")
        setIsLoading(false)
        return
      }

      // Small delay to ensure cookie is set
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Redirect to admin dashboard
      window.location.href = "/admin"
    } catch (error) {
      console.error("Login error:", error)
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Image src="/images/sla-logo.png" alt="She Leads Africa" width={120} height={60} className="h-12 w-auto" />
          </div>
          <CardTitle className="text-2xl font-bold text-[#0087DB]">Admin Login</CardTitle>
          <CardDescription>Sign in to access the admin dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
                disabled={isLoading}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full bg-[#0087DB] hover:bg-[#0076C7]" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          
        </CardContent>
      </Card>
    </div>
  )
}
