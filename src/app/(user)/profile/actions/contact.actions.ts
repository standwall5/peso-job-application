"use server";

import {
  requestEmailChange,
  updatePhone,
} from "../../../../lib/db/services/contact.service";
import { updateProfileDetails } from "@/lib/db/services/user.service";

/**
 * Request email change - sends confirmation link to current email
 */
export async function requestEmailChangeAction(
  newEmail: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Validate input
    if (!newEmail || !newEmail.includes("@")) {
      return { success: false, error: "Invalid email address" };
    }

    await requestEmailChange(newEmail);
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to request email change:", error);
    const message =
      error instanceof Error ? error.message : "Failed to request email change";
    return { success: false, error: message };
  }
}

/**
 * Confirm email change using token
 */
// export async function confirmEmailChangeAction(
//   token: string,
// ): Promise<{ success: boolean; error?: string; newEmail?: string }> {
//   try {
//     if (!token) {
//       return { success: false, error: "Invalid confirmation token" };
//     }

//     // const result = await confirmEmailChange(token);
//     return { success: true, newEmail: result.newEmail };
//   } catch (error: unknown) {
//     console.error("Failed to confirm email change:", error);
//     const message =
//       error instanceof Error ? error.message : "Failed to confirm email change";
//     return { success: false, error: message };
//   }
// }

/**
 * Update phone number directly
 */
export async function updatePhoneAction(
  newPhone: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPhone || newPhone.length < 10) {
      return { success: false, error: "Invalid phone number" };
    }

    await updatePhone(newPhone);
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update phone:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update phone";
    return { success: false, error: message };
  }
}

/**
 * Update user's name
 */
export async function updateNameAction(
  name: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!name || name.trim().length === 0) {
      return { success: false, error: "Name cannot be empty" };
    }

    await updateProfileDetails({ name: name.trim() });
    return { success: true };
  } catch (error: unknown) {
    console.error("Failed to update name:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update name";
    return { success: false, error: message };
  }
}
