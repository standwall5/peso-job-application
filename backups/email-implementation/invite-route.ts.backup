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
        { status: 403 }
      );
    }

    // Parse request body
    const { email, name, is_superadmin = false } = await request.json();

    // Validate inputs
    if (!email || !name) {
      return NextResponse.json(
        { error: "Email and name are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if email already exists
    const { data: existingAdmin } = await supabase
      .from("peso")
      .select("id")
      .eq("auth_id", (await supabase.from("peso").select("auth_id").eq("name", name).single()).data?.auth_id)
      .single();

    if (existingAdmin) {
      return NextResponse.json(
        { error: "An admin with this email already exists" },
        { status: 400 }
      );
    }

    // Generate secure token
    const token = Array.from({ length: 32 }, () =>
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"[
        Math.floor(Math.random() * 62)
      ]
    ).join("");

    // Store invitation token (expires in 48 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    const { data: currentAdmin } = await supabase
      .from("peso")
      .select("id")
      .eq("auth_id", user.id)
      .single();

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
      return NextResponse.json(
        { error: "Failed to create invitation" },
        { status: 500 }
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
      }
    );

    if (inviteError) {
      console.error("Supabase invite error:", inviteError);

      // If admin invite fails, try regular email
      // Create a custom email using Supabase Auth
      const { error: emailError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: inviteUrl,
        }
      );

      if (emailError) {
        console.error("Email send error:", emailError);
        return NextResponse.json(
          { error: "Failed to send invitation email. Token created but email not sent." },
          { status: 500 }
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
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
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
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
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
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
      { status: 500 }
    );
  }
}
