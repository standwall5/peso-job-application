// Notification service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface Notification {
  id: number;
  applicant_id: number;
  type: "referred" | "rejected" | "id_verified" | "application_completed";
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  is_archived: boolean;
  created_at: string;
  job_id?: number;
  job_title?: string;
  company_name?: string;
  company_logo?: string;
}

export async function getNotifications(
  unreadOnly: boolean = false,
  includeArchived: boolean = false,
): Promise<Notification[]> {
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

  let query = supabase
    .from("notifications")
    .select("*")
    .eq("applicant_id", applicant.id)
    .order("created_at", { ascending: false });

  // Filter by archived status (default: exclude archived)
  if (!includeArchived) {
    query = query.eq("is_archived", false);
  }

  if (unreadOnly) {
    query = query.eq("is_read", false);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification[];
}

export async function createNotification(notificationData: {
  applicant_id: number;
  type: "referred" | "rejected" | "id_verified" | "application_completed";
  title: string;
  message: string;
  link?: string;
  job_id?: number;
  job_title?: string;
  company_name?: string;
  company_logo?: string;
}): Promise<Notification> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...notificationData,
      is_read: false,
      is_archived: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Notification;
}

export async function markNotificationAsRead(
  notificationId: number,
): Promise<void> {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export async function markAllNotificationsAsRead(): Promise<void> {
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
    .from("notifications")
    .update({ is_read: true })
    .eq("applicant_id", applicant.id)
    .eq("is_read", false);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteNotification(
  notificationId: number,
): Promise<void> {
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
    .from("notifications")
    .delete()
    .eq("id", notificationId)
    .eq("applicant_id", applicant.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function archiveNotification(
  notificationId: number,
): Promise<void> {
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
    .from("notifications")
    .update({ is_archived: true })
    .eq("id", notificationId)
    .eq("applicant_id", applicant.id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function unarchiveNotification(
  notificationId: number,
): Promise<void> {
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
    .from("notifications")
    .update({ is_archived: false })
    .eq("id", notificationId)
    .eq("applicant_id", applicant.id);

  if (error) {
    throw new Error(error.message);
  }
}

// Create notification for application status change (referred/rejected)
export async function createApplicationStatusNotification(
  applicantId: number,
  jobId: number,
  status: "referred" | "rejected",
): Promise<Notification> {
  const supabase = await getSupabaseClient();

  // Get job and company details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      companies (
        name,
        logo
      )
    `,
    )
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error("Job not found");
  }

  const companies = Array.isArray(job.companies)
    ? job.companies[0]
    : job.companies;

  const title =
    status === "referred" ? "Application Referred! 🎉" : "Application Update";
  const message =
    status === "referred"
      ? `Your application for ${job.title} has been referred to the employer.`
      : `Your application for ${job.title} has been reviewed.`;

  return createNotification({
    applicant_id: applicantId,
    type: status,
    title,
    message,
    link: "/profile?tab=applications",
    job_id: jobId,
    job_title: job.title,
    company_name: companies?.name,
    company_logo: companies?.logo,
  });
}

// Create notification for ID verification
export async function createIdVerificationNotification(
  applicantId: number,
): Promise<Notification> {
  return createNotification({
    applicant_id: applicantId,
    type: "id_verified",
    title: "ID Verified Successfully ✓",
    message: "Your identification has been verified.",
    link: "/profile",
  });
}

// Create notification for completed application
export async function createApplicationCompletedNotification(
  applicantId: number,
  jobId: number,
): Promise<Notification> {
  const supabase = await getSupabaseClient();

  // Get job and company details
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(
      `
      id,
      title,
      companies (
        name,
        logo
      )
    `,
    )
    .eq("id", jobId)
    .single();

  if (jobError || !job) {
    throw new Error("Job not found");
  }

  const companies = Array.isArray(job.companies)
    ? job.companies[0]
    : job.companies;

  return createNotification({
    applicant_id: applicantId,
    type: "application_completed",
    title: "Application Submitted! 📄",
    message: `Your application for ${job.title} has been successfully submitted.`,
    link: "/profile?tab=applications",
    job_id: jobId,
    job_title: job.title,
    company_name: companies?.name,
    company_logo: companies?.logo,
  });
}
