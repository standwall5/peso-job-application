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

export async function updateCompany(
  id: number,
  updates: Partial<{
    name: string;
    description: string;
    address: string;
    contact: string;
  }>,
) {
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
