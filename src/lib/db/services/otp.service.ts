"use server";

import { getSupabaseClient } from "../client";

/**
 * Generate a random 6-digit OTP
 */
export async function generateOTP(): Promise<string> {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Store OTP in database with expiration
 */
export async function storeOTP(
  userId: string,
  type: "email" | "phone",
  value: string,
  otp: string,
): Promise<void> {
  const supabase = await getSupabaseClient();

  // Set expiration to 10 minutes from now
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);

  // Store OTP in a dedicated table (you'll need to create this table)
  // For now, we'll use a simple approach with metadata
  const { error } = await supabase.from("otp_verifications").upsert(
    {
      user_id: userId,
      type,
      value,
      otp_code: otp,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString(),
      verified: false,
    },
    {
      onConflict: "user_id,type,value",
    },
  );

  if (error) {
    throw new Error(`Failed to store OTP: ${error.message}`);
  }
}

/**
 * Validate OTP
 */
export async function validateOTP(
  userId: string,
  type: "email" | "phone",
  value: string,
  otp: string,
): Promise<boolean> {
  const supabase = await getSupabaseClient();

  // Fetch the OTP record
  const { data, error } = await supabase
    .from("otp_verifications")
    .select("*")
    .eq("user_id", userId)
    .eq("type", type)
    .eq("value", value)
    .eq("otp_code", otp)
    .eq("verified", false)
    .single();

  if (error || !data) {
    return false;
  }

  // Check if OTP has expired
  const expiresAt = new Date(data.expires_at);
  const now = new Date();

  if (now > expiresAt) {
    // OTP has expired, delete it
    await supabase
      .from("otp_verifications")
      .delete()
      .eq("user_id", userId)
      .eq("type", type)
      .eq("value", value);

    return false;
  }

  // Mark as verified
  await supabase
    .from("otp_verifications")
    .update({ verified: true })
    .eq("user_id", userId)
    .eq("type", type)
    .eq("value", value);

  return true;
}

/**
 * Clean up expired OTPs (should be run periodically)
 */
export async function cleanupExpiredOTPs(): Promise<void> {
  const supabase = await getSupabaseClient();

  const now = new Date().toISOString();

  await supabase.from("otp_verifications").delete().lt("expires_at", now);
}
