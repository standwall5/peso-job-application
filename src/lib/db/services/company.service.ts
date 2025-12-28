// Company service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface Company {
  id: number;
  name: string;
  logo: string | null;
  description?: string;
  address?: string;
  contact?: string;
  location?: string;
  industry?: string;
  website?: string;
  contact_email?: string;
}

export interface CompanyWithJobs extends Company {
  jobs: {
    id: number;
    company_id: number;
    title: string;
    place_of_assignment: string;
    sex: string;
    education: string;
    eligibility: string;
    posted_date: string;
    exam_id?: number | null;
    manpower_needed?: number;
  }[];
  totalManpower: number;
  totalJobsPosted: number;
}

export async function getCompanies() {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("name");

  if (error) {
    throw new Error(error.message);
  }

  return data as Company[];
}

export async function getCompaniesWithStats(): Promise<{
  companies: CompanyWithJobs[];
  totalJobsAllCompanies: number;
}> {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated admin

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("*");

  if (companiesError) {
    throw new Error(companiesError.message);
  }

  const results = await Promise.all(
    (companies ?? []).map(async (company) => {
      const { data: jobs } = await supabase
        .from("jobs")
        .select("*")
        .eq("company_id", company.id);

      const totalManpower = (jobs ?? []).reduce(
        (sum, job) => sum + (job.manpower_needed ?? 0),
        0,
      );

      const totalJobsPosted = jobs ? jobs.length : 0;

      return {
        ...company,
        jobs: jobs ?? [],
        totalManpower,
        totalJobsPosted,
      };
    }),
  );

  const totalJobsAllCompanies = results.reduce(
    (sum, company) => sum + (company.totalJobsPosted ?? 0),
    0,
  );

  return {
    companies: results,
    totalJobsAllCompanies,
  };
}

export async function getCompanyById(id: number) {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Company;
}

export async function createCompany(companyData: {
  name: string;
  description?: string;
  address?: string;
  contact?: string;
  location?: string;
  industry?: string;
  website?: string;
  contact_email?: string;
}) {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { data, error } = await supabase
    .from("companies")
    .insert([companyData])
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Company;
}

export async function updateCompany(id: number, updates: Partial<Company>) {
  const supabase = await getSupabaseClient();
  await getCurrentUser(); // Ensure authenticated

  const { data, error } = await supabase
    .from("companies")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as Company;
}

export async function uploadCompanyLogo(companyId: number, file: File) {
  const supabase = await getSupabaseClient();
  await getCurrentUser();

  const fileName = `${companyId}_${Date.now()}.jpg`;
  const { error: uploadError } = await supabase.storage
    .from("company-logos")
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: urlData } = supabase.storage
    .from("company-logos")
    .getPublicUrl(fileName);

  const { error: updateError } = await supabase
    .from("companies")
    .update({ logo: urlData.publicUrl })
    .eq("id", companyId);

  if (updateError) {
    throw new Error(updateError.message);
  }

  return urlData.publicUrl;
}
