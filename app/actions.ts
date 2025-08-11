"use server"

import { serverSupabase } from "@/lib/supabase"
import { revalidatePath } from "next/cache"

export async function getCourses() {
  try {
    if (!serverSupabase.from) {
      console.error("Supabase server client not properly initialized")
      return []
    }

    const { data, error } = await serverSupabase.from("courses").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching courses:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching courses:", error)
    return []
  }
}

export async function getApplications(status?: string) {
  try {
    if (!serverSupabase.from) {
      console.error("Supabase server client not properly initialized")
      return []
    }

    let query = serverSupabase
      .from("applications")
      .select(`
        *,
        applicant:applicant_id(full_name, email, phone_number, location, employment_status),
        course:course_id(name)
      `)
      .order("submitted_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching applications:", error)
      return []
    }

    return data
  } catch (error) {
    console.error("Error fetching applications:", error)
    return []
  }
}

export async function getApplicationDetails(id: number) {
  try {
    const { data, error } = await serverSupabase
      .from("applications")
      .select(`
        *,
        applicant:applicant_id(*),
        course:course_id(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching application details:", error)
      return null
    }

    return data
  } catch (error) {
    console.error("Error fetching application details:", error)
    return null
  }
}

export async function updateApplicationStatus(id: number, status: string) {
  try {
    const { error } = await serverSupabase.from("applications").update({ status }).eq("id", id)

    if (error) {
      console.error("Error updating application status:", error)
      return { success: false, error: "Failed to update status" }
    }

    revalidatePath("/admin/applications")
    revalidatePath(`/admin/applications/${id}`)

    return { success: true }
  } catch (error) {
    console.error("Error updating application status:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getApplicationsForExport(status?: string) {
  try {
    if (!serverSupabase.from) {
      console.error("Supabase server client not properly initialized")
      return { success: false, data: [], error: "Database connection error" }
    }

    let query = serverSupabase
      .from("applications")
      .select(`
        *,
        applicant:applicant_id(*),
        course:course_id(*)
      `)
      .order("submitted_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching applications for export:", error)
      return { success: false, data: [], error: error.message }
    }

    return { success: true, data: data || [] }
  } catch (error: any) {
    console.error("Error fetching applications for export:", error)
    return { success: false, data: [], error: error?.message || "Unknown error" }
  }
}

export async function getApplicationForExport(id: number) {
  try {
    const { data, error } = await serverSupabase
      .from("applications")
      .select(`
        *,
        applicant:applicant_id(*),
        course:course_id(*)
      `)
      .eq("id", id)
      .single()

    if (error) {
      console.error("Error fetching application for export:", error)
      return { success: false, data: null, error: error.message }
    }

    return { success: true, data: data }
  } catch (error: any) {
    console.error("Error fetching application for export:", error)
    return { success: false, data: null, error: error?.message || "Unknown error" }
  }
}
