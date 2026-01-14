import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

export async function createClient() {
  const cookieStore = await cookies();

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    redirect("/error?reason=missing-env-vars");
  }

  //################# FOR DEVELOPMENT #################
  //

  // Development fallback: if Supabase env vars are missing, return a minimal stub
  // if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  //   const makeQueryResult = () => {
  //     const result: any = {
  //       select: () => result,
  //       eq: () => result,
  //       single: async () => ({ data: null, error: null }),
  //       insert: () => result,
  //       then: (onFulfilled: any, onRejected: any) =>
  //         Promise.resolve({ data: [], error: null }).then(onFulfilled, onRejected),
  //       catch: (onRejected: any) => Promise.resolve({ data: [], error: null }).catch(onRejected),
  //     };
  //     return result;
  //   };

  //   return {
  //     auth: {
  //       async getUser() {
  //         return { data: { user: null }, error: null };
  //       },
  //       async signInWithPassword() {
  //         return {
  //           data: { user: null, session: null },
  //           error: { message: "Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local" }
  //         };
  //       },
  //       async signUp() {
  //         return {
  //           data: { user: null, session: null },
  //           error: { message: "Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local" }
  //         };
  //       },
  //       async signOut() {
  //         return { error: null };
  //       },
  //       async signInWithOAuth() {
  //         return {
  //           data: { url: null },
  //           error: { message: "Supabase credentials not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local" }
  //         };
  //       },
  //     },
  //     from() {
  //       return makeQueryResult();
  //     },
  //   } as any;
  // }
  //####################################################################
  //

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Create a Supabase client with service role key for admin operations
 * This bypasses RLS (Row Level Security) policies
 * ONLY use this for admin/server-side operations where you've verified the user is an admin
 */
export function createAdminClient() {
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    throw new Error("Missing Supabase service role credentials");
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
