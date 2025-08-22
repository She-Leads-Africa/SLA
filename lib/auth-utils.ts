export function setAuthCookie(value: string): boolean {
  const isProduction = process.env.NODE_ENV === "production"
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:"

  // For cross-origin iframe contexts, we need SameSite=None and Secure
  const cookieOptions = [
    `admin-auth=${value}`,
    "Path=/",
    "Max-Age=86400", // 24 hours
    "SameSite=None", // Required for cross-site cookies
    "Secure", // Required when using SameSite=None
  ].join("; ")

  try {
    document.cookie = cookieOptions

    // Verify cookie was set
    const verification = getAuthCookie()
    console.log("Cookie set verification:", verification === value ? "SUCCESS" : "FAILED")
    
    return verification === value
  } catch (error) {
    console.error("Error setting cookie:", error)
    return false
  }
}

export function getAuthCookie(): string | null {
  if (typeof document === "undefined") return null

  const cookies = document.cookie.split(";")
  const authCookie = cookies.find((cookie) => cookie.trim().startsWith("admin-auth="))

  return authCookie ? authCookie.split("=")[1] : null
}

export function removeAuthCookie() {
  const isProduction = process.env.NODE_ENV === "production"
  const isHttps = typeof window !== "undefined" && window.location.protocol === "https:"

  const cookieOptions = [
    "admin-auth=",
    "Path=/",
    "Max-Age=0",
    "SameSite=Lax",
    ...(isProduction && isHttps ? ["Secure"] : []),
  ].join("; ")

  document.cookie = cookieOptions
}

export function isAuthenticated(): boolean {
  const cookie = getAuthCookie()
  return cookie === "authenticated"
}

export function validateCredentials(username: string, password: string): boolean {
  const adminUsername = process.env.NEXT_PUBLIC_ADMIN_USERNAME
  const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

  if (!adminUsername || !adminPassword) {
    console.error("Admin credentials not configured")
    return false
  }

  return username === adminUsername && password === adminPassword
}
