// Admin Invitation API - Sends invitation emails to new admin users
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
    // Use admin client to check (requires service role key)
    try {
      const adminClient = createAdminClient();
      const { data: existingUsers, error: listError } =
        await adminClient.auth.admin.listUsers();

      if (listError) {
        console.error("Error listing users:", listError);
        // Continue anyway - duplicate will be caught during account creation
      } else {
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
      }
    } catch (adminError) {
      console.error("Error creating admin client:", adminError);
      return NextResponse.json(
        {
          error:
            "Failed to verify email availability. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured.",
        },
        { status: 500 },
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

    console.log("Sending invitation email to:", email);

    // Send invitation email using Supabase's built-in invite method
    // The admin will receive an email to set their password
    // On first login (is_first_login = true), they'll be redirected to complete their profile
    let emailSent = false;
    let emailError = null;
    let authUserId = null;

    try {
      const adminClient = createAdminClient();

      // Create the auth user first
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email,
          email_confirm: false, // User needs to confirm via invite email
          user_metadata: {
            name,
            is_superadmin,
            role: "peso_admin", // Mark this user as a PESO admin
          },
        });

      if (authError || !authData.user) {
        console.error("Auth creation error:", authError);
        throw new Error("Failed to create auth user");
      }

      authUserId = authData.user.id;

      // Create peso record immediately
      const { error: pesoError } = await supabase.from("peso").insert({
        auth_id: authUserId,
        name,
        is_superadmin,
        status: "active",
        is_first_login: true,
      });

      if (pesoError) {
        console.error("Peso record creation error:", pesoError);
        // Rollback: delete the auth user
        await adminClient.auth.admin.deleteUser(authUserId);
        throw new Error("Failed to create admin record");
      }

      // Now send the invitation email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const { error: inviteError } =
        await adminClient.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${appUrl}/auth/callback`,
        });

      if (inviteError) {
        console.error("Invitation email error:", inviteError);
        emailError = inviteError.message;
        emailSent = false;
        // Don't rollback - account is created, just email failed
      } else {
        console.log("Invitation sent successfully");
        emailSent = true;
      }
    } catch (error) {
      console.error("Exception sending invitation:", error);
      emailError = error instanceof Error ? error.message : "Unknown error";
      emailSent = false;

      return NextResponse.json(
        {
          error: emailError,
        },
        { status: 500 },
      );
    }

    // Return success with invitation details
    return NextResponse.json({
      success: true,
      message: emailSent
        ? "Invitation email sent successfully"
        : `Invitation created but email failed to send: ${emailError}`,
      email,
      name,
      is_superadmin,
      expiresAt: expiresAt.toISOString(),
      emailSent,
      emailError,
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
