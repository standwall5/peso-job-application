// User Auto-Archive Service
"use server";

import { getSupabaseClient } from "../client";

// Archive users who haven't logged in for specified days
export async function autoArchiveInactiveUsers(
  inactiveDays: number = 180,
): Promise<{ archived: number; errors: string[] }> {
  const supabase = await getSupabaseClient();
  const errors: string[] = [];
  let archived = 0;

  try {
    // Calculate the cutoff date (current date - inactive days)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    const cutoffISO = cutoffDate.toISOString();

    console.log(`[Auto-Archive] Checking for users inactive since: ${cutoffISO}`);

    // Find inactive users (last_login older than cutoff or null)
    const { data: inactiveUsers, error: fetchError } = await supabase
      .from("applicants")
      .select("id, name, email, last_login, is_archived")
      .or(`last_login.lt.${cutoffISO},last_login.is.null`)
      .eq("is_archived", false);

    if (fetchError) {
      console.error("[Auto-Archive] Error fetching inactive users:", fetchError);
      errors.push(fetchError.message);
      return { archived, errors };
    }

    if (!inactiveUsers || inactiveUsers.length === 0) {
      console.log("[Auto-Archive] No inactive users found");
      return { archived, errors };
    }

    console.log(`[Auto-Archive] Found ${inactiveUsers.length} inactive users`);

    // Archive each inactive user
    for (const user of inactiveUsers) {
      try {
        const { error: archiveError } = await supabase
          .from("applicants")
          .update({
            is_archived: true,
            archived_at: new Date().toISOString(),
          })
          .eq("id", user.id);

        if (archiveError) {
          console.error(`[Auto-Archive] Failed to archive user ${user.id}:`, archiveError);
          errors.push(`Failed to archive ${user.name}: ${archiveError.message}`);
        } else {
          archived++;
          console.log(`[Auto-Archive] Archived user: ${user.name} (ID: ${user.id})`);
        }
      } catch (err) {
        console.error(`[Auto-Archive] Exception archiving user ${user.id}:`, err);
        errors.push(`Exception archiving ${user.name}: ${String(err)}`);
      }
    }

    console.log(`[Auto-Archive] Completed. Archived: ${archived}, Errors: ${errors.length}`);
    return { archived, errors };
  } catch (error) {
    console.error("[Auto-Archive] Unexpected error:", error);
    errors.push(String(error));
    return { archived, errors };
  }
}

// Update last login timestamp when user logs in
export async function updateLastLogin(userId: number): Promise<void> {
  const supabase = await getSupabaseClient();

  try {
    const { error } = await supabase
      .from("applicants")
      .update({
        last_login: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[Update Last Login] Error:", error);
      throw new Error(error.message);
    }

    console.log(`[Update Last Login] Updated for user ID: ${userId}`);
  } catch (error) {
    console.error("[Update Last Login] Exception:", error);
    throw error;
  }
}

// Get inactive users count without archiving
export async function getInactiveUsersCount(
  inactiveDays: number = 180,
): Promise<number> {
  const supabase = await getSupabaseClient();

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    const cutoffISO = cutoffDate.toISOString();

    const { count, error } = await supabase
      .from("applicants")
      .select("*", { count: "exact", head: true })
      .or(`last_login.lt.${cutoffISO},last_login.is.null`)
      .eq("is_archived", false);

    if (error) {
      console.error("[Inactive Users Count] Error:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Inactive Users Count] Exception:", error);
    return 0;
  }
}

// Get list of inactive users for review
export async function getInactiveUsers(inactiveDays: number = 180): Promise<
  {
    id: number;
    name: string;
    email: string;
    last_login: string | null;
    days_inactive: number;
  }[]
> {
  const supabase = await getSupabaseClient();

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);
    const cutoffISO = cutoffDate.toISOString();

    const { data, error } = await supabase
      .from("applicants")
      .select("id, name, email, last_login")
      .or(`last_login.lt.${cutoffISO},last_login.is.null`)
      .eq("is_archived", false)
      .order("last_login", { ascending: true, nullsFirst: true });

    if (error) {
      console.error("[Get Inactive Users] Error:", error);
      return [];
    }

    if (!data) return [];

    // Calculate days inactive for each user
    const now = new Date();
    return data.map((user) => {
      let daysInactive = inactiveDays;
      if (user.last_login) {
        const lastLogin = new Date(user.last_login);
        daysInactive = Math.floor(
          (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        last_login: user.last_login,
        days_inactive: daysInactive,
      };
    });
  } catch (error) {
    console.error("[Get Inactive Users] Exception:", error);
    return [];
  }
}
