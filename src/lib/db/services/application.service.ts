// Application service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface Application {
  id: number;
  job_id: number;
  applicant_id: number;
  applied_date: string;
  status: string;
  jobs?: {
    title: string;
    companies: {
      name: string;
    };
  };
}

export async function getUserApplications() {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  // Get applications
  const { data, error } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs (
        title,
        companies (name)
      )
    `,
    )
    .eq("applicant_id", applicant.id)
    .order("applied_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Application[];
}

export async function submitApplication(jobId: number) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  // Check if already applied
  const { data: existing } = await supabase
    .from("applications")
    .select("id")
    .eq("applicant_id", applicant.id)
    .eq("job_id", jobId)
    .single();

  if (existing) {
    throw new Error("Already applied to this job");
  }

  // Create application
  const { data, error } = await supabase
    .from("applications")
    .insert([
      {
        job_id: jobId,
        applicant_id: applicant.id,
        status: "pending",
        applied_date: new Date().toISOString(),
      },
    ])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function updateApplicationStatus(
  applicationId: number,
  status: string,
) {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getApplicationProgress(applicationId: number) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  // Get application and verify it belongs to the user
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", applicationId)
    .eq("applicant_id", applicant.id) // Verify ownership
    .single();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error("Application not found or access denied");
  }

  return data;
}
