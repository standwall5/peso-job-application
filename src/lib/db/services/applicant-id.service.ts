"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface ApplicantIDData {
  id?: number;
  applicant_id: number;
  id_type: string;
  id_front_url: string;
  id_back_url: string;
  selfie_with_id_url: string;
  uploaded_at?: string;
  updated_at?: string;
  version?: number;
}

export interface UploadIDResult {
  success: boolean;
  data?: ApplicantIDData;
  error?: string;
}

export interface IDViewLog {
  applicant_id: number;
  admin_id: number;
  application_id?: number;
  ip_address?: string;
  user_agent?: string;
  image_type: "front" | "back" | "selfie";
}

/**
 * Upload or update applicant's ID documents
 * Files should be passed as FormData from the client
 */
export async function uploadApplicantID(
  formData: FormData,
): Promise<UploadIDResult> {
  try {
    const supabase = await getSupabaseClient();
    const user = await getCurrentUser();

    // Get applicant ID
    const { data: applicant, error: applicantError } = await supabase
      .from("applicants")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (applicantError || !applicant) {
      return { success: false, error: "Applicant not found" };
    }

    const applicantId = applicant.id;

    // Extract form data
    const idType = formData.get("idType") as string;
    const frontFile = formData.get("frontFile") as File;
    const backFile = formData.get("backFile") as File;
    const selfieFile = formData.get("selfieFile") as File;

    if (!idType || !frontFile || !backFile || !selfieFile) {
      return { success: false, error: "Missing required fields" };
    }

    // Validate file types and sizes
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of [frontFile, backFile, selfieFile]) {
      if (!allowedTypes.includes(file.type)) {
        return {
          success: false,
          error: `Invalid file type. Only JPG and PNG are allowed.`,
        };
      }
      if (file.size > maxSize) {
        return {
          success: false,
          error: `File size exceeds 5MB limit.`,
        };
      }
    }

    // Upload files to storage
    const timestamp = Date.now();
    const frontPath = `${applicantId}/front_${timestamp}.jpg`;
    const backPath = `${applicantId}/back_${timestamp}.jpg`;
    const selfiePath = `${applicantId}/selfie_${timestamp}.jpg`;

    const [frontUpload, backUpload, selfieUpload] = await Promise.all([
      supabase.storage.from("applicant-ids").upload(frontPath, frontFile, {
        contentType: frontFile.type,
        upsert: false,
      }),
      supabase.storage.from("applicant-ids").upload(backPath, backFile, {
        contentType: backFile.type,
        upsert: false,
      }),
      supabase.storage.from("applicant-ids").upload(selfiePath, selfieFile, {
        contentType: selfieFile.type,
        upsert: false,
      }),
    ]);

    if (frontUpload.error || backUpload.error || selfieUpload.error) {
      // Clean up uploaded files if any failed
      await Promise.all([
        frontUpload.data &&
          supabase.storage.from("applicant-ids").remove([frontPath]),
        backUpload.data &&
          supabase.storage.from("applicant-ids").remove([backPath]),
        selfieUpload.data &&
          supabase.storage.from("applicant-ids").remove([selfiePath]),
      ]);

      return {
        success: false,
        error: "Failed to upload ID images. Please try again.",
      };
    }

    // Check if applicant already has IDs (update vs insert)
    const { data: existingID } = await supabase
      .from("applicant_ids")
      .select("id, id_front_url, id_back_url, selfie_with_id_url")
      .eq("applicant_id", applicantId)
      .single();

    let result;
    if (existingID) {
      // Delete old images from storage
      const oldPaths = [
        existingID.id_front_url,
        existingID.id_back_url,
        existingID.selfie_with_id_url,
      ];
      await supabase.storage.from("applicant-ids").remove(oldPaths);

      // Update existing record
      result = await supabase
        .from("applicant_ids")
        .update({
          id_type: idType,
          id_front_url: frontPath,
          id_back_url: backPath,
          selfie_with_id_url: selfiePath,
        })
        .eq("applicant_id", applicantId)
        .select()
        .single();
    } else {
      // Insert new record
      result = await supabase
        .from("applicant_ids")
        .insert({
          applicant_id: applicantId,
          id_type: idType,
          id_front_url: frontPath,
          id_back_url: backPath,
          selfie_with_id_url: selfiePath,
        })
        .select()
        .single();
    }

    if (result.error) {
      throw new Error(result.error.message);
    }

    return { success: true, data: result.data };
  } catch (error) {
    console.error("Error uploading ID:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get applicant's current ID documents metadata (not the actual images)
 */
export async function getApplicantID(
  applicantId: number,
): Promise<ApplicantIDData | null> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("applicant_ids")
    .select("*")
    .eq("applicant_id", applicantId)
    .single();

  if (error) {
    console.error("Error fetching applicant ID:", error);
    return null;
  }

  return data;
}

/**
 * Get current user's ID documents
 */
export async function getMyID(): Promise<ApplicantIDData | null> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) return null;

  return getApplicantID(applicant.id);
}

/**
 * Log admin viewing of ID documents
 */
export async function logIDView(params: IDViewLog): Promise<void> {
  const supabase = await getSupabaseClient();

  await supabase.from("id_view_logs").insert({
    applicant_id: params.applicant_id,
    admin_id: params.admin_id,
    application_id: params.application_id,
    ip_address: params.ip_address,
    user_agent: params.user_agent,
    image_type: params.image_type,
  });
}

/**
 * Check if applicant has uploaded ID
 */
export async function hasUploadedID(applicantId: number): Promise<boolean> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("applicant_ids")
    .select("id")
    .eq("applicant_id", applicantId)
    .single();

  return !error && !!data;
}

/**
 * Get ID view history for an applicant (admin only)
 */
export async function getIDViewHistory(applicantId: number) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Verify admin
  const { data: admin } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!admin) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("id_view_logs")
    .select(
      `
      *,
      peso:admin_id(name),
      applications:application_id(id, status)
    `,
    )
    .eq("applicant_id", applicantId)
    .order("viewed_at", { ascending: false });

  if (error) {
    throw new Error("Failed to fetch view history");
  }

  return data;
}
