import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Get the authenticated user
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check if user is a PESO admin
        const { data: pesoUser } = await supabase
          .from("peso")
          .select("id, is_superadmin, is_first_login")
          .eq("auth_id", user.id)
          .single();

        if (pesoUser) {
          // User is an admin - redirect to admin dashboard
          // The layout will handle showing first-login modal if needed
          const redirectTo = pesoUser.is_superadmin
            ? `${origin}/admin/manage-admin`
            : `${origin}/admin`;
          return NextResponse.redirect(redirectTo);
        } else {
          // User is a regular applicant - redirect to job opportunities
          return NextResponse.redirect(`${origin}/job-opportunities`);
        }
      }
    }
  }

  // If there was an error or no code, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}
