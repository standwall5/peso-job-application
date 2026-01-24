import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is superadmin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from("peso")
      .select("is_superadmin")
      .eq("auth_id", user.id)
      .single();

    if (!admin?.is_superadmin) {
      return NextResponse.json(
        { error: "Only superadmins can invite new admins" },
        { status: 403 },
      );
    }

    // Parse request body
    const { email, name, is_superadmin = false } = await request.json();

    // Validate inputs
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if invitation already exists for this email
    const { data: existingInvite } = await supabase
      .from("admin_invitation_tokens")
      .select("id, used, expires_at")
      .eq("email", email)
      .single();

    if (existingInvite) {
      if (
        !existingInvite.used &&
        new Date(existingInvite.expires_at) > new Date()
      ) {
        return NextResponse.json(
          { error: "An active invitation already exists for this email" },
          { status: 400 },
        );
      }
    }

    // Generate secure random token (32 characters)
    const token = Array.from(
      { length: 32 },
      () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
          Math.floor(Math.random() * 62)
        ],
    ).join("");

    // Token expires in 48 hours
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    // Get current admin's ID
    const { data: currentAdmin } = await supabase
      .from("peso")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    // Store invitation token
    const { error: tokenError } = await supabase
      .from("admin_invitation_tokens")
      .insert({
        email,
        admin_name: name,
        token,
        is_superadmin,
        created_by: currentAdmin?.id,
        expires_at: expiresAt.toISOString(),
        used: false,
      });

    if (tokenError) {
      console.error("Token creation error:", tokenError);
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 },
      );
    }

    // Generate setup URL (admin will set password/profile after arriving in app)
    // IMPORTANT: we redirect through /auth/callback so Supabase can exchange the code for a session.
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const setupUrl = `${appUrl}/auth/callback?next=/admin&token=${token}`;

    // Send invitation email via Supabase Auth (delivered using Supabase SMTP which you configured to AWS SES)
    // This requires the service role client (createAdminClient).
    let emailSent = false;
    let emailError: string | null = null;

    try {
      const adminClient = createAdminClient();

      const { error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          data: {
            name,
            is_superadmin,
            invitation_token: token,
            role: "peso_admin",
          },
          redirectTo: setupUrl,
        });

      if (inviteError) {
        emailError = inviteError.message;
        console.error("Supabase inviteUserByEmail error:", inviteError);
      } else {
        emailSent = true;
      }
    } catch (e) {
      emailError = e instanceof Error ? e.message : "Unknown error";
      console.error("Admin client error (service role missing?):", e);
    }

    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Invitation created and email sent successfully"
        : "Invitation created but email could not be sent automatically",
      inviteUrl: setupUrl, // for manual sending fallback
      emailSent,
      emailError,
      email,
      name,
      is_superadmin,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// GET: Validate invitation token
export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    const { data: invitation, error } = await supabase
      .from("admin_invitation_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (error || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 404 },
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      email: invitation.email,
      name: invitation.admin_name,
      is_superadmin: invitation.is_superadmin,
    });
  } catch (error) {
    console.error("Error validating invitation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
