"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Request an email change.
 * Supabase will send a confirmation email to the **new email**.
 */
export async function requestEmailChange(newEmail: string): Promise<void> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  // Validate new email
  if (!newEmail || !newEmail.includes("@")) {
    throw new Error("Invalid email address");
  }

  if (user.email === newEmail) {
    throw new Error("New email must be different from current email");
  }

  // Update email with redirect URL
  const { error: authError } = await supabase.auth.updateUser(
    {
      email: newEmail,
    },
    {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/`,
    },
  );

  if (authError) {
    throw new Error(`Failed to request email change: ${authError.message}`);
  }
}

/**
 * Update user's phone number in your applicants table
 */
export async function updatePhone(newPhone: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Not authenticated");
  }

  if (!newPhone || newPhone.length < 10) {
    throw new Error("Invalid phone number");
  }

  const { error } = await supabase
    .from("applicants")
    .update({ phone: newPhone })
    .eq("auth_id", user.id);

  if (error) {
    throw new Error(`Failed to update phone: ${error.message}`);
  }
}
