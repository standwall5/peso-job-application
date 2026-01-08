// Job service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string;
  company_id: number;
  manpower_needed?: number;
  skills?: string[];
  companies: {
    name: string;
    logo: string | null;
  };
}

export async function getJobs() {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*, companies(name, logo)")
    .order("posted_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Job[];
}

export async function getJobById(id: number) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*, companies(name, logo)")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job;
}

export async function createJob(jobData: {
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  company_id: number;
  skills?: string[]; // NEW: Add skills parameter
}) {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { data, error } = await supabase
    .from("jobs")
    .insert([jobData])
    .select("*, companies(*)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job;
}

export async function updateJob(
  id: number,
  updates: Partial<{
    title: string;
    description: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    skills: string[]; // NEW: Add skills parameter
  }>,
) {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { data, error } = await supabase
    .from("jobs")
    .update(updates)
    .eq("id", id)
    .select("*, companies(*)")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Job;
}

export async function deleteJob(id: number) {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { error } = await supabase.from("jobs").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}

export async function getJobsByCompany(companyId: number) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("jobs")
    .select("*, companies(name, logo)")
    .eq("company_id", companyId)
    .order("posted_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data as Job[];
}
