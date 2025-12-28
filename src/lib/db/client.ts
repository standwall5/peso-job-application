// Database client singleton
import { createClient } from "@/utils/supabase/server";

export async function getSupabaseClient() {
  return await createClient();
}

export async function getCurrentUser() {
  const supabase = await getSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user;
}
