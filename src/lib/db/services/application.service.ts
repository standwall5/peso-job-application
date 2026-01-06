// Application service
// Functions: getUserApplications: used in /profile, submitApplication: used at the end of jobs, updateApplicationStatus, getApplicationProgress, getApplicantAppliedJobs, withdrawApplication
//
//
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

export interface AppliedJob {
  id: number;
  job_id: number;
  company_id: number;
  company_name: string;
  company_logo: string | null;
  job_title: string;
  place_of_assignment: string;
  status: string;
  applied_date: string;
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

export async function getApplicantAppliedJobs(applicantId: number) {
  const supabase = await getSupabaseClient();

  try {
    // Fetch all applications for this applicant with job and company details
    const { data: applications, error } = await supabase
      .from("applications")
      .select(
        `
        id,
        job_id,
        status,
        applied_date,
        jobs!inner (
          id,
          title,
          place_of_assignment,
          company_id,
          companies!inner (
            id,
            name,
            logo
          )
        )
      `,
      )
      .eq("applicant_id", applicantId)
      .order("applied_date", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      throw new Error(error.message);
    }

    console.log("Applications fetched:", applications);

    if (!applications) {
      return [];
    }

    // Define the structure we expect from Supabase (nested relations are arrays)
    type SupabaseJob = {
      id: number;
      title: string;
      place_of_assignment: string;
      company_id: number;
      companies: {
        id: number;
        name: string;
        logo: string | null;
      }[];
    };

    type SupabaseApplication = {
      id: number;
      job_id: number;
      status: string;
      applied_date: string;
      jobs: SupabaseJob[];
    };

    // Transform the data to match our AppliedJob interface
    const jobs: AppliedJob[] = applications.map((app) => {
      const typedApp = app as unknown as SupabaseApplication;
      const job = typedApp.jobs?.[0]; // Get first job from array
      const company = job?.companies?.[0]; // Get first company from array

      return {
        id: typedApp.id,
        job_id: typedApp.job_id,
        company_id: job?.company_id || 0,
        company_name: company?.name || "Unknown Company",
        company_logo: company?.logo || null,
        job_title: job?.title || "Unknown Position",
        place_of_assignment: job?.place_of_assignment || "N/A",
        status: typedApp.status || "pending",
        applied_date: typedApp.applied_date,
      };
    });

    console.log("Transformed jobs:", jobs);
    return jobs;
  } catch (error) {
    console.error("Error fetching applied jobs:", error);
    throw error;
  }
}

export async function withdrawApplication(jobId: number) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id, name")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    throw new Error("Applicant not found");
  }

  // Get the application with job details
  const { data: application, error: fetchError } = await supabase
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
    .eq("job_id", jobId)
    .single();

  if (fetchError || !application) {
    throw new Error("Application not found");
  }

  // Check if application can be withdrawn (only Pending applications)
  if (application.status !== "Pending" && application.status !== "pending") {
    throw new Error(
      `Cannot withdraw application with status: ${application.status}. Only pending applications can be withdrawn.`,
    );
  }

  // Delete the application
  const { error: deleteError } = await supabase
    .from("applications")
    .delete()
    .eq("id", application.id);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  // Delete application progress if exists
  await supabase
    .from("application_progress")
    .delete()
    .eq("applicant_id", applicant.id)
    .eq("job_id", jobId);

  return {
    success: true,
    message: "Application withdrawn successfully",
  };
}
