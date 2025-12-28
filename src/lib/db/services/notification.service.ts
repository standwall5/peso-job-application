// Notification service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface Notification {
  id: number;
  applicant_id: number;
  type: string;
  title: string;
  message: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export async function getNotifications(
  unreadOnly: boolean = false,
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
  type: string;
  title: string;
  message: string;
  link?: string;
}): Promise<Notification> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("notifications")
    .insert({
      ...notificationData,
      is_read: false,
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
