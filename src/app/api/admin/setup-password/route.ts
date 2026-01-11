import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Parse request body
    const { token, password } = await request.json();

    // Validate inputs
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Get invitation details
    const { data: invitation, error: inviteError } = await supabase
      .from("admin_invitation_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 }
      );
    }

    // Create the auth user with Supabase
    const { data: authData, error: authError } =
      await supabase.auth.admin.createUser({
        email: invitation.email,
        password: password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          name: invitation.admin_name,
          is_superadmin: invitation.is_superadmin,
        },
      });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return NextResponse.json(
        { error: "Failed to create admin account" },
        { status: 500 }
      );
    }

    // Create peso (admin) record
    const { error: adminError } = await supabase.from("peso").insert({
      auth_id: authData.user.id,
      name: invitation.admin_name,
      is_superadmin: invitation.is_superadmin,
      status: "active",
    });

    if (adminError) {
      console.error("Admin record creation error:", adminError);

      // Rollback: delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: "Failed to create admin record" },
        { status: 500 }
      );
    }

    // Mark invitation as used
    await supabase
      .from("admin_invitation_tokens")
      .update({
        used: true,
        used_at: new Date().toISOString(),
      })
      .eq("token", token);

    return NextResponse.json({
      success: true,
      message: "Admin account created successfully",
      email: invitation.email,
    });
  } catch (error) {
    console.error("Error setting up password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
