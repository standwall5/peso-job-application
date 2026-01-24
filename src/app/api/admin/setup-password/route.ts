import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Parse request body
    const { token, password } = await request.json();

    // Validate inputs
    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 },
      );
    }

    // Validate password strength - must meet all requirements
    const passwordRequirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[^A-Za-z0-9]/.test(password),
    };

    const allRequirementsMet =
      Object.values(passwordRequirements).every(Boolean);

    if (!allRequirementsMet) {
      const missingRequirements = [];
      if (!passwordRequirements.length)
        missingRequirements.push("at least 8 characters");
      if (!passwordRequirements.uppercase)
        missingRequirements.push("one uppercase letter");
      if (!passwordRequirements.lowercase)
        missingRequirements.push("one lowercase letter");
      if (!passwordRequirements.number) missingRequirements.push("one number");
      if (!passwordRequirements.special)
        missingRequirements.push("one special character");

      return NextResponse.json(
        {
          error: `Password must contain: ${missingRequirements.join(", ")}`,
          requirements: passwordRequirements,
        },
        { status: 400 },
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

    // Check if email already exists in auth users
    try {
      const adminClient = createAdminClient();
      const { data: existingUsers, error: listError } =
        await adminClient.auth.admin.listUsers();

      if (!listError && existingUsers?.users) {
        const emailExists = existingUsers.users.some(
          (u) => u.email?.toLowerCase() === invitation.email.toLowerCase(),
        );

        if (emailExists) {
          return NextResponse.json(
            { error: "An admin with this email already exists" },
            { status: 400 },
          );
        }
      }

      // Create the auth user with password using admin client
      const { data: authData, error: authError } =
        await adminClient.auth.admin.createUser({
          email: invitation.email,
          password: password,
          email_confirm: true, // Auto-confirm email
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

      // Create peso (admin) record
      // NOTE: We intentionally keep is_first_login=true so that after the invited admin
      // lands on /admin authenticated, the unclosable first-login modal is shown.
      const { error: adminError } = await supabase.from("peso").insert({
        auth_id: authData.user.id,
        name: invitation.admin_name,
        email: invitation.email,
        is_superadmin: invitation.is_superadmin,
        status: "active",
        is_first_login: true,
      });

      if (adminError) {
        console.error("Admin record creation error:", adminError);

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
    } catch (adminError) {
      console.error("Error creating admin client:", adminError);
      return NextResponse.json(
        {
          error:
            "Failed to create admin account. Please ensure SUPABASE_SERVICE_ROLE_KEY is configured.",
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("Error setting up password:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
