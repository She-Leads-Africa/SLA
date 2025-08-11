import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables for browser client")
    // Return a dummy client for development to prevent crashes
    if (process.env.NODE_ENV === "development") {
      return {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
        }),
      } as any
    }
    throw new Error("Missing Supabase environment variables for browser client")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // Disable auth persistence for admin app
    },
    realtime: {
      params: {
        eventsPerSecond: 2, // Reduce realtime events
      },
    },
  })
}

// Create a single supabase client for server components
const createServerClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("Missing Supabase environment variables for server client:", {
      hasUrl: !!supabaseUrl,
      hasKey: !!supabaseServiceKey,
      env: process.env.NODE_ENV,
    })

    // Return a dummy client for development to prevent crashes
    if (process.env.NODE_ENV === "development") {
      return {
        from: () => ({
          select: () => Promise.resolve({ data: [], error: null }),
          insert: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          update: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: new Error("Supabase not configured") }),
          }),
        }),
      } as any
    }

    throw new Error("Missing Supabase environment variables for server client")
  }

  try {
    console.log("Creating Supabase server client with URL:", supabaseUrl.substring(0, 20) + "...")
    return createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
      },
      realtime: {
        params: {
          eventsPerSecond: 2,
        },
      },
    })
  } catch (error) {
    console.error("Error creating Supabase server client:", error)
    throw error
  }
}

// For client components
export const supabase = createBrowserClient()

// For server actions and server components
export const serverSupabase = createServerClient()
