import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    // Validate inputs
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (!/[A-Z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one uppercase letter" },
        { status: 400 },
      );
    }

    if (!/[a-z]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one lowercase letter" },
        { status: 400 },
      );
    }

    if (!/\d/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one number" },
        { status: 400 },
      );
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain at least one special character" },
        { status: 400 },
      );
    }

    // Get invitation details
    const supabase = await createClient();
    const { data: invitation, error: inviteError } = await supabase
      .from("admin_invitation_tokens")
      .select("*")
      .eq("token", token)
      .eq("used", false)
      .single();

    if (inviteError || !invitation) {
      return NextResponse.json(
        { error: "Invalid or expired invitation" },
        { status: 400 },
      );
    }

    // Check if expired
    if (new Date(invitation.expires_at) < new Date()) {
      return NextResponse.json(
        { error: "Invitation has expired" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const adminClient = createAdminClient();
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();

    if (existingUsers?.users?.some((u) => u.email === invitation.email)) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // Create auth user with password
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: invitation.email,
        password: password,
        email_confirm: true,
        user_metadata: {
          name: invitation.admin_name,
          is_superadmin: invitation.is_superadmin,
          role: "peso_admin",
        },
      });

    if (authError || !authData.user) {
      console.error("Auth creation error:", authError);
      return NextResponse.json(
        { error: "Failed to create admin account" },
        { status: 500 },
      );
    }

    // Create peso record
    // IMPORTANT: keep is_first_login=true so when the invited admin is authenticated
    // and lands on /admin, the unclosable first-login modal forces profile pic + password setup.
    const { error: pesoError } = await supabase.from("peso").insert({
      auth_id: authData.user.id,
      name: invitation.admin_name,
      is_superadmin: invitation.is_superadmin,
      status: "active",
      is_first_login: true,
    });

    if (pesoError) {
      console.error("Peso record creation error:", pesoError);

      // Rollback: delete the auth user
      await adminClient.auth.admin.deleteUser(authData.user.id);

      return NextResponse.json(
        { error: "Failed to create admin record" },
        { status: 500 },
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
      auth_id: authData.user.id,
    });
  } catch (error) {
    console.error("Error creating admin account:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
