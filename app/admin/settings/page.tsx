"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Eye, EyeOff, Save, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Validate passwords
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation must match",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // Check current password against environment variable
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    if (passwordForm.currentPassword !== adminPassword) {
      toast({
        title: "Incorrect password",
        description: "Current password is incorrect",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    // In a real app, you would update the password in the database
    // For this demo, we'll just show a success message
    setTimeout(() => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
      })
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleClearCache = () => {
    setIsLoading(true)

    // Simulate cache clearing
    setTimeout(() => {
      toast({
        title: "Cache cleared",
        description: "Application cache has been cleared  successfully",
      })
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-gray-500">Manage your admin account and application settings</p>
      </div>

      <Tabs defaultValue="account" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="application">Application</TabsTrigger>
        </TabsList>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your admin account password</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={handlePasswordChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="bg-green-700 hover:bg-green-800" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Password
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="application">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>Manage general application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="appName">Application Name</Label>
                <Input id="appName" defaultValue="She Leads Africa" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input id="supportEmail" type="email" defaultValue="support@sheleadsafrica.org" />
              </div>

              <div className="space-y-2">
                <Label>Cache Management</Label>
                <p className="text-sm text-gray-500">
                  Clear the application cache to refresh data and fix potential issues.
                </p>
                <Button variant="outline" onClick={handleClearCache} disabled={isLoading} className="mt-2">
                  {isLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Clearing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Clear Cache
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-green-700 hover:bg-green-800">
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
