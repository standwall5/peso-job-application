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
  changeLogged?: boolean;
}

export interface IDViewLog {
  applicant_id: number;
  admin_id: number;
  application_id?: number;
  ip_address?: string;
  user_agent?: string;
  image_type: "front" | "back" | "selfie";
}

export interface IDChangeLog {
  id?: number;
  applicant_id: number;
  application_id?: number;
  id_type: string;
  change_type: "initial_upload" | "update" | "type_change";
  old_id_front_url?: string;
  old_id_back_url?: string;
  old_selfie_url?: string;
  new_id_front_url: string;
  new_id_back_url: string;
  new_selfie_url: string;
  changed_at?: string;
  ip_address?: string;
  user_agent?: string;
}

/**
 * Upload or update applicant's ID documents
 * Files should be passed as FormData from the client
 * Supports multiple ID types per user - upserts based on id_type
 * Logs all changes for audit trail
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
    const applicationId = formData.get("applicationId") as string | null;

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
    const sanitizedIdType = idType.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
    const frontPath = `${applicantId}/${sanitizedIdType}_front_${timestamp}.jpg`;
    const backPath = `${applicantId}/${sanitizedIdType}_back_${timestamp}.jpg`;
    const selfiePath = `${applicantId}/${sanitizedIdType}_selfie_${timestamp}.jpg`;

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

    // Check if applicant already has this specific ID type
    const { data: existingID } = await supabase
      .from("applicant_ids")
      .select("id, id_front_url, id_back_url, selfie_with_id_url")
      .eq("applicant_id", applicantId)
      .eq("id_type", idType)
      .single();

    let result;
    let changeType: "initial_upload" | "update" | "type_change";

    if (existingID) {
      // Delete old images from storage for this ID type
      const oldPaths = [
        existingID.id_front_url,
        existingID.id_back_url,
        existingID.selfie_with_id_url,
      ];
      await supabase.storage.from("applicant-ids").remove(oldPaths);

      changeType = "update";

      // Update existing record for this ID type
      result = await supabase
        .from("applicant_ids")
        .update({
          id_front_url: frontPath,
          id_back_url: backPath,
          selfie_with_id_url: selfiePath,
        })
        .eq("applicant_id", applicantId)
        .eq("id_type", idType)
        .select()
        .single();
    } else {
      changeType = "initial_upload";

      // Insert new record for this ID type
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

    // Log the ID change
    const changeLogged = await logIDChange({
      applicantId,
      applicationId: applicationId ? parseInt(applicationId) : undefined,
      idType,
      changeType,
      oldIdFrontUrl: existingID?.id_front_url,
      oldIdBackUrl: existingID?.id_back_url,
      oldSelfieUrl: existingID?.selfie_with_id_url,
      newIdFrontUrl: frontPath,
      newIdBackUrl: backPath,
      newSelfieUrl: selfiePath,
    });

    // If this was an update on a submitted application, notify admins
    if (changeType === "update" && applicationId) {
      await notifyAdminsOfIDChange(
        applicantId,
        parseInt(applicationId),
        idType,
      );
    }

    return { success: true, data: result.data, changeLogged };
  } catch (error) {
    console.error("Error uploading ID:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get applicant's current ID documents metadata for a specific ID type
 */
export async function getApplicantID(
  applicantId: number,
  idType?: string,
): Promise<ApplicantIDData | null> {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from("applicant_ids")
    .select("*")
    .eq("applicant_id", applicantId);

  if (idType) {
    query = query.eq("id_type", idType);
  }

  // Get the most recently updated ID if no type specified
  const { data, error } = await query
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching applicant ID:", error);
    return null;
  }

  return data;
}

/**
 * Get all ID types uploaded by an applicant
 */
export async function getAllApplicantIDs(
  applicantId: number,
): Promise<ApplicantIDData[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("applicant_ids")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching applicant IDs:", error);
    return [];
  }

  return data || [];
}

/**
 * Get current user's ID documents for a specific type
 */
export async function getMyID(
  idType?: string,
): Promise<ApplicantIDData | null> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) return null;

  return getApplicantID(applicant.id, idType);
}

/**
 * Get all ID types uploaded by current user
 */
export async function getMyAllIDs(): Promise<ApplicantIDData[]> {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  const { data: applicant } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) return [];

  return getAllApplicantIDs(applicant.id);
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

/**
 * Log ID change for audit trail
 */
export async function logIDChange(params: {
  applicantId: number;
  applicationId?: number;
  idType: string;
  changeType: "initial_upload" | "update" | "type_change";
  oldIdFrontUrl?: string;
  oldIdBackUrl?: string;
  oldSelfieUrl?: string;
  newIdFrontUrl: string;
  newIdBackUrl: string;
  newSelfieUrl: string;
}): Promise<boolean> {
  try {
    const supabase = await getSupabaseClient();

    const { error } = await supabase.from("id_change_logs").insert({
      applicant_id: params.applicantId,
      application_id: params.applicationId,
      id_type: params.idType,
      change_type: params.changeType,
      old_id_front_url: params.oldIdFrontUrl,
      old_id_back_url: params.oldIdBackUrl,
      old_selfie_url: params.oldSelfieUrl,
      new_id_front_url: params.newIdFrontUrl,
      new_id_back_url: params.newIdBackUrl,
      new_selfie_url: params.newSelfieUrl,
      changed_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error logging ID change:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error logging ID change:", error);
    return false;
  }
}

/**
 * Get ID change history for an applicant
 */
export async function getIDChangeHistory(
  applicantId: number,
): Promise<IDChangeLog[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("id_change_logs")
    .select("*")
    .eq("applicant_id", applicantId)
    .order("changed_at", { ascending: false });

  if (error) {
    console.error("Error fetching ID change history:", error);
    return [];
  }

  return data || [];
}

/**
 * Get ID change count for a specific application
 */
export async function getIDChangeCountForApplication(
  applicationId: number,
): Promise<number> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("id_change_logs")
    .select("id", { count: "exact" })
    .eq("application_id", applicationId)
    .in("change_type", ["update", "type_change"]);

  if (error) {
    console.error("Error getting ID change count:", error);
    return 0;
  }

  return data?.length || 0;
}

/**
 * Check if ID was changed after application submission
 */
export async function wasIDChangedAfterSubmission(
  applicationId: number,
): Promise<boolean> {
  const supabase = await getSupabaseClient();

  // Get application submission date
  const { data: application } = await supabase
    .from("applications")
    .select("applied_date")
    .eq("id", applicationId)
    .single();

  if (!application) return false;

  // Check for ID changes after submission
  const { data } = await supabase
    .from("id_change_logs")
    .select("id")
    .eq("application_id", applicationId)
    .gt("changed_at", application.applied_date)
    .in("change_type", ["update", "type_change"])
    .limit(1);

  return (data?.length || 0) > 0;
}

/**
 * Notify admins when ID is changed on a submitted application
 */
async function notifyAdminsOfIDChange(
  applicantId: number,
  applicationId: number,
  idType: string,
): Promise<void> {
  try {
    const supabase = await getSupabaseClient();

    // Get applicant name
    const { data: applicant } = await supabase
      .from("applicants")
      .select("name")
      .eq("id", applicantId)
      .single();

    // Get all PESO admins
    const { data: admins } = await supabase.from("peso").select("id, auth_id");

    if (!admins || admins.length === 0) return;

    // Create notifications for all admins
    const notifications = admins.map((admin) => ({
      recipient_id: admin.auth_id,
      type: "id_changed",
      title: "Applicant Updated ID",
      message: `${applicant?.name || "An applicant"} has updated their ${idType} for application #${applicationId}. Please review.`,
      related_id: applicationId,
      created_at: new Date().toISOString(),
    }));

    await supabase.from("notifications").insert(notifications);
  } catch (error) {
    console.error("Error notifying admins of ID change:", error);
  }
}
