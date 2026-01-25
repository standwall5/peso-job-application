// User/Applicant service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface ApplicantData {
  name: string;
  birth_date: string;
  age: number;
  address: string;
  sex: string;
  barangay: string;
  district: string;
  email: string;
  phone: string;
  profile_pic_url: string | null;
  preferred_poa: string;
  applicant_type: string;
}

export async function getUser() {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .eq("auth_id", user.id)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return {
    ...data,
    email: user.email,
  } as ApplicantData;
}

export async function updateProfileDetails(updates: {
  preferred_poa?: string;
  applicant_type?: string;
  name?: string;
  birth_date?: string;
  address?: string;
  sex?: string;
  barangay?: string;
  district?: string;
}) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Only update provided fields
  const updateData: Record<string, string> = {};
  if (updates.preferred_poa !== undefined) {
    updateData.preferred_poa = updates.preferred_poa;
  }
  if (updates.applicant_type !== undefined) {
    updateData.applicant_type = updates.applicant_type;
  }
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  if (updates.birth_date !== undefined) {
    updateData.birth_date = updates.birth_date;
  }
  if (updates.address !== undefined) {
    updateData.address = updates.address;
  }
  if (updates.sex !== undefined) {
    updateData.sex = updates.sex;
  }
  if (updates.barangay !== undefined) {
    updateData.barangay = updates.barangay;
  }
  if (updates.district !== undefined) {
    updateData.district = updates.district;
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No valid fields to update");
  }

  const { data, error } = await supabase
    .from("applicants")
    .update(updateData)
    .eq("auth_id", user.id)
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function uploadProfilePicture(file: File) {
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

  // Upload to storage (using same bucket name as API route)
  const fileName = `user-${user.id}/${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("profile-pics") // Fixed: matches API route
    .upload(fileName, file, { upsert: true });

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("profile-pics") // Fixed: matches API route
    .getPublicUrl(fileName);

  // Update applicant record
  const { error: updateError } = await supabase
    .from("applicants")
    .update({ profile_pic_url: urlData.publicUrl })
    .eq("auth_id", user.id); // Using auth_id like API route

  if (updateError) {
    throw new Error(updateError.message);
  }

  return urlData.publicUrl;
}
