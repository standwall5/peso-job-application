// Dashboard service for admin overview statistics
"use server";

import { getSupabaseClient } from "../client";

export interface DashboardOverview {
  totalJobseekers: number;
  totalApplications: number;
  totalCompanies: number;
  totalJobsListed: number;
}

export interface MonthlyData {
  month: number;
  year: number;
  applications: number;
  // Note: "referrals" might need clarification - using applications with status for now
}

export async function getDashboardOverview(): Promise<DashboardOverview> {
  const supabase = await getSupabaseClient();

  // Get total jobseekers
  const { count: totalJobseekers } = await supabase
    .from("applicants")
    .select("*", { count: "exact", head: true });

  // Get total applications
  const { count: totalApplications } = await supabase
    .from("applications")
    .select("*", { count: "exact", head: true });

  // Get total companies
  const { count: totalCompanies } = await supabase
    .from("companies")
    .select("*", { count: "exact", head: true });

  // Get total jobs listed
  const { count: totalJobsListed } = await supabase
    .from("jobs")
    .select("*", { count: "exact", head: true });

  return {
    totalJobseekers: totalJobseekers || 0,
    totalApplications: totalApplications || 0,
    totalCompanies: totalCompanies || 0,
    totalJobsListed: totalJobsListed || 0,
  };
}

export async function getMonthlyApplicationData(
  year: number,
): Promise<MonthlyData[]> {
  const supabase = await getSupabaseClient();

  // Get applications grouped by month for the specified year
  const { data: applications, error } = await supabase
    .from("applications")
    .select("applied_date, status")
    .gte("applied_date", `${year}-01-01`)
    .lte("applied_date", `${year}-12-31`);

  if (error) {
    throw new Error(error.message);
  }

  // Initialize months array (Jan=0, Dec=11)
  const monthlyData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    year,
    applications: 0,
  }));

  // Count applications by month
  applications?.forEach((app) => {
    const date = new Date(app.applied_date);
    const month = date.getMonth(); // 0-11
    monthlyData[month].applications++;
  });

  return monthlyData;
}

// Get applications by status that could be considered "referrals"
// This assumes referrals might be applications with a specific status
// Adjust based on your actual business logic
export async function getMonthlyReferralData(
  year: number,
): Promise<MonthlyData[]> {
  const supabase = await getSupabaseClient();

  // Assuming "Referred" or "Hired" status indicates a referral
  // Adjust the status check based on your needs
  const { data: referrals, error } = await supabase
    .from("applications")
    .select("applied_date, status")
    .in("status", ["Referred", "Hired", "Accepted"])
    .gte("applied_date", `${year}-01-01`)
    .lte("applied_date", `${year}-12-31`);

  if (error) {
    throw new Error(error.message);
  }

  // Initialize months array
  const monthlyData: MonthlyData[] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    year,
    applications: 0,
  }));

  // Count referrals by month
  referrals?.forEach((ref) => {
    const date = new Date(ref.applied_date);
    const month = date.getMonth(); // 0-11
    monthlyData[month].applications++;
  });

  return monthlyData;
}

// Get available years from applications data
export async function getAvailableYears(): Promise<number[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("applications")
    .select("applied_date")
    .order("applied_date", { ascending: false });

  if (error || !data || data.length === 0) {
    return [new Date().getFullYear()];
  }

  // Extract unique years
  const years = new Set<number>();
  data.forEach((app) => {
    const year = new Date(app.applied_date).getFullYear();
    years.add(year);
  });

  return Array.from(years).sort((a, b) => b - a); // Descending order
}
