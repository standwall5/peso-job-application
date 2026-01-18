// Admin Invitation API - Sends invitation emails to new admin users
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check if user is superadmin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      console.error("Auth error in invite route:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin } = await supabase
      .from("peso")
      .select("is_superadmin")
      .eq("auth_id", user.id)
      .single();

    if (!admin?.is_superadmin) {
      console.error(
        "Non-superadmin attempted to invite:",
        user.id,
        admin?.is_superadmin,
      );
      return NextResponse.json(
        { error: "Only superadmins can invite new admins" },
        { status: 403 },
      );
    }

    // Parse request body
    const { email, name, is_superadmin = false } = await request.json();

    // Validate inputs
    if (!email || !name) {
      console.error("Missing required fields:", {
        email: !!email,
        name: !!name,
      });
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.error("Invalid email format provided:", email);
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 },
      );
    }

    // Check if email already exists in auth users
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const emailExists = existingUsers?.users?.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase(),
    );

    if (emailExists) {
      console.error("Email already exists:", email);
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 400 },
      );
    }

    // Check if an invitation with this email is already pending
    const { data: existingInvitation } = await supabase
      .from("admin_invitation_tokens")
      .select("id")
      .eq("email", email)
      .eq("used", false)
      .gte("expires_at", new Date().toISOString())
      .maybeSingle();

    if (existingInvitation) {
      console.error("Pending invitation already exists for:", email);
      return NextResponse.json(
        { error: "An invitation for this email is already pending" },
        { status: 400 },
      );
    }

    // Generate secure token
    const token = Array.from(
      { length: 32 },
      () =>
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
          Math.floor(Math.random() * 62)
        ],
    ).join("");

    // Store invitation token (expires in 48 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const { data: currentAdmin, error: currentAdminError } = await supabase
      .from("peso")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    if (currentAdminError) {
      console.error("Error fetching current admin:", currentAdminError);
      return NextResponse.json(
        { error: "Failed to verify admin account" },
        { status: 500 },
      );
    }

    const { error: tokenError } = await supabase
      .from("admin_invitation_tokens")
      .insert({
        email,
        admin_name: name,
        token,
        is_superadmin,
        created_by: currentAdmin?.id,
        expires_at: expiresAt.toISOString(),
      });

    if (tokenError) {
      console.error("Token creation error:", tokenError);
      console.error("Token error details:", {
        code: tokenError.code,
        message: tokenError.message,
        details: tokenError.details,
        hint: tokenError.hint,
      });

      // Check if table doesn't exist
      if (tokenError.code === "42P01") {
        return NextResponse.json(
          {
            error:
              "Database not configured. Please run the admin setup SQL script.",
            hint: "The admin_invitation_tokens table does not exist.",
          },
          { status: 500 },
        );
      }

      return NextResponse.json(
        {
          error: "Failed to create invitation",
          details: tokenError.message,
        },
        { status: 500 },
      );
    }

    // Create the invitation link
    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/admin/setup-password?token=${token}`;

    // Use Supabase Admin API to invite user
    // This sends an email with a magic link
    const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
      email,
      {
        data: {
          name,
          is_superadmin,
          invitation_token: token,
          role: "admin",
        },
        redirectTo: inviteUrl,
      },
    );

    if (inviteError) {
      console.error("Supabase invite error:", inviteError);

      // If admin invite fails, try regular email
      // Create a custom email using Supabase Auth
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: inviteUrl,
        },
      );

      if (emailError) {
        console.error("Email send error:", emailError);
        return NextResponse.json(
          {
            error:
              "Failed to send invitation email. Token created but email not sent.",
          },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      email,
      expiresAt: expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Error inviting admin:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

// GET: Check if invitation token is valid
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
