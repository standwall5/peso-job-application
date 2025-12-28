// Admin client for privileged operations
import { createClient } from "@supabase/supabase-js";

let adminClientInstance: ReturnType<typeof createClient> | null = null;

export function getSupabaseAdminClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY - This is required for admin operations. " +
        "Add it to your .env.local file.",
    );
  }

  // Reuse singleton instance
  if (adminClientInstance) {
    return adminClientInstance;
  }

  adminClientInstance = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );

  return adminClientInstance;
}
