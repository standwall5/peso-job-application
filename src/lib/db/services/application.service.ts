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
  exam_id?: number | null;
  exam_title?: string | null;
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

  // Get the application with job and applicant details
  const { data: application, error: appError } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs (
        title,
        companies (name)
      ),
      applicants (
        id,
        name
      )
    `,
    )
    .eq("id", applicationId)
    .single();

  if (appError || !application) {
    throw new Error(appError?.message || "Application not found");
  }

  // Update the application status
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", applicationId)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // Create notification for the applicant
  const job = Array.isArray(application.jobs)
    ? application.jobs[0]
    : application.jobs;
  const company =
    job && Array.isArray(job.companies) ? job.companies[0] : job?.companies;
  const applicant = Array.isArray(application.applicants)
    ? application.applicants[0]
    : application.applicants;

  const statusMessages: Record<string, { title: string; message: string }> = {
    referred: {
      title: "Application Referred! 🎉",
      message: `Your application for ${job?.title || "the position"} at ${
        company?.name || "the company"
      } has been referred. Good luck!`,
    },
    rejected: {
      title: "Application Update",
      message: `Your application for ${job?.title || "the position"} at ${
        company?.name || "the company"
      } has been updated to rejected.`,
    },
    pending: {
      title: "Application Status Changed",
      message: `Your application for ${job?.title || "the position"} at ${
        company?.name || "the company"
      } is now pending review.`,
    },
  };

  const notificationContent = statusMessages[status.toLowerCase()] || {
    title: "Application Status Changed",
    message: `Your application status has been updated to ${status}.`,
  };

  // Send notification
  if (applicant?.id) {
    await supabase.from("notifications").insert({
      applicant_id: applicant.id,
      type: "application_status",
      title: notificationContent.title,
      message: notificationContent.message,
      link: `/profile?tab=applications`,
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    });
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

  // Define the expected structure from Supabase
  interface SupabaseApplicationData {
    id: number;
    job_id: number;
    status: string;
    applied_date: string;
    jobs: {
      id: number;
      title: string;
      place_of_assignment: string;
      company_id: number;
      exam_id?: number | null;
      companies: {
        id: number;
        name: string;
        logo: string | null;
      }[];
      exams: {
        id: number;
        title?: string;
      }[];
    }[];
  }

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
    jobs (
      id,
      title,
      place_of_assignment,
      company_id,
      exam_id,
      exams (
        id,
        title
      ),
      companies (
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

    console.log(
      "Raw applications fetched:",
      JSON.stringify(applications, null, 2),
    );

    if (!applications || applications.length === 0) {
      return [];
    }

    // Transform the data to match our AppliedJob interface
    const jobs = applications
      .map((app: SupabaseApplicationData) => {
        const job = app.jobs?.[0];
        const company = job?.companies?.[0];
        const exam = job?.exams?.[0];

        if (!job) {
          return null;
        }

        return {
          id: app.id,
          job_id: job.id,
          company_id: job.company_id || 0,
          company_name: company?.name || "Unknown Company",
          company_logo: company?.logo || null,
          job_title: job.title || "Unknown Position",
          place_of_assignment: job.place_of_assignment || "N/A",
          status: app.status || "pending",
          applied_date: app.applied_date,
          exam_id: job.exam_id ?? exam?.id ?? null,
          exam_title: exam?.title ?? null,
        } as AppliedJob;
      })
      .filter((job): job is AppliedJob => job !== null);

    console.log("Final transformed jobs:", jobs);
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

// Application Progress Functions

export interface ApplicationProgress {
  job_id: number;
  applicant_id: number;
  resume_viewed: boolean;
  exam_completed: boolean;
  verified_id_uploaded: boolean;
  updated_at: string;
}

export async function getApplicationProgressForJob(jobId: number) {
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

  const { data, error } = await supabase
    .from("application_progress")
    .select("*")
    .eq("job_id", jobId)
    .eq("applicant_id", applicant.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ApplicationProgress | null;
}

export async function getAllApplicationProgress() {
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

  const { data, error } = await supabase
    .from("application_progress")
    .select("*")
    .eq("applicant_id", applicant.id);

  if (error) {
    throw new Error(error.message);
  }

  return (data || []) as ApplicationProgress[];
}

export async function upsertApplicationProgress(
  jobId: number,
  progress: {
    resumeViewed?: boolean;
    examCompleted?: boolean;
    verifiedIdUploaded?: boolean;
  },
) {
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

  const { data, error } = await supabase
    .from("application_progress")
    .upsert(
      {
        job_id: jobId,
        applicant_id: applicant.id,
        resume_viewed: progress.resumeViewed ?? false,
        exam_completed: progress.examCompleted ?? false,
        verified_id_uploaded: progress.verifiedIdUploaded ?? false,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "job_id,applicant_id",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ApplicationProgress;
}

export async function deleteApplicationProgress(jobId: number) {
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

  const { error } = await supabase
    .from("application_progress")
    .delete()
    .eq("job_id", jobId)
    .eq("applicant_id", applicant.id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

/**
 * Get application ID for a specific job for the current user
 * Used for tracking ID changes on submitted applications
 */
export async function getApplicationIdByJobId(
  jobId: number,
): Promise<number | null> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    return null;
  }

  // Get application
  const { data: application } = await supabase
    .from("applications")
    .select("id")
    .eq("job_id", jobId)
    .eq("applicant_id", applicant.id)
    .single();

  return application?.id || null;
}

/**
 * Get all jobseekers (all applicants with their most recent application if any)
 * Uses optimized queries to fetch all applicants, even those without applications
 * @param isArchived - Filter by archived status (default: false)
 */
export async function getAllJobseekers(isArchived: boolean = false) {
  const supabase = await getSupabaseClient();

  // First, fetch all applicants filtered by archive status
  const { data: applicants, error: applicantsError } = await supabase
    .from("applicants")
    .select("*")
    .eq("is_archived", isArchived)
    .order("created_at", { ascending: false });

  if (applicantsError) {
    console.error("Error fetching applicants:", applicantsError);
    throw new Error(applicantsError.message);
  }

  if (!applicants || applicants.length === 0) {
    return [];
  }

  const applicantIds = applicants.map((a) => a.id);

  // Fetch all applications for these applicants with job and company details
  const { data: applications, error: appsError } = await supabase
    .from("applications")
    .select(
      `
      id,
      job_id,
      applicant_id,
      applied_date,
      status,
      jobs (
        id,
        title,
        place_of_assignment,
        company_id,
        companies (
          id,
          name,
          logo
        )
      )
    `,
    )
    .in("applicant_id", applicantIds)
    .order("applied_date", { ascending: false });

  if (appsError) {
    console.error("Error fetching applications:", appsError);
  }

  // Fetch all resumes for these applicants
  const { data: resumes, error: resumeError } = await supabase
    .from("resume")
    .select("*")
    .in("applicant_id", applicantIds);

  if (resumeError) {
    console.error("Error fetching resumes:", resumeError);
  }

  // Create maps for quick lookup
  const resumeMap = new Map();
  (resumes || []).forEach((resume) => {
    resumeMap.set(resume.applicant_id, resume);
  });

  // Group applications by applicant_id and get the most recent one
  const applicantApplicationMap = new Map();
  (applications || []).forEach((app) => {
    const existing = applicantApplicationMap.get(app.applicant_id);
    if (
      !existing ||
      new Date(app.applied_date) > new Date(existing.applied_date)
    ) {
      applicantApplicationMap.set(app.applicant_id, app);
    }
  });

  // Build results - one entry per applicant with their most recent application (if any)
  const results = applicants.map((applicant) => {
    const app = applicantApplicationMap.get(applicant.id);
    const resume = resumeMap.get(applicant.id);

    if (app) {
      // Applicant has applications - return with application data
      const job = Array.isArray(app.jobs) ? app.jobs[0] : app.jobs;
      const company =
        job && Array.isArray(job.companies) ? job.companies[0] : job?.companies;

      const resumeWithDetails = resume
        ? {
            ...resume,
            profile_pic_url: applicant.profile_pic_url ?? null,
            job: job ?? null,
            company: company ?? null,
            applicant: applicant,
          }
        : null;

      return {
        id: app.id,
        job_id: app.job_id,
        applicant_id: applicant.id,
        applied_date: app.applied_date,
        status: app.status,
        applicant,
        job,
        company,
        resume: resumeWithDetails,
      };
    } else {
      // Applicant has no applications - return with null application data
      const resumeWithDetails = resume
        ? {
            ...resume,
            profile_pic_url: applicant.profile_pic_url ?? null,
            job: null,
            company: null,
            applicant: applicant,
          }
        : null;

      return {
        id: null,
        job_id: null,
        applicant_id: applicant.id,
        applied_date: applicant.created_at, // Use registration date
        status: null,
        applicant,
        job: null,
        company: null,
        resume: resumeWithDetails,
      };
    }
  });

  return results;
}
