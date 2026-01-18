import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const checks: Record<string, { status: string; message: string }> = {};

    // Check 1: Verify user is authenticated
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      checks.authentication = {
        status: "failed",
        message: "Not authenticated or auth error",
      };
    } else {
      checks.authentication = {
        status: "passed",
        message: `Authenticated as ${user.email}`,
      };
    }

    // Check 2: Verify user is a super admin
    if (user) {
      const { data: admin, error: adminError } = await supabase
        .from("peso")
        .select("id, name, is_superadmin")
        .eq("auth_id", user.id)
        .single();

      if (adminError) {
        checks.admin_record = {
          status: "failed",
          message: `Admin record not found: ${adminError.message}`,
        };
      } else if (!admin.is_superadmin) {
        checks.admin_permissions = {
          status: "failed",
          message: "User is not a super administrator",
        };
      } else {
        checks.admin_record = {
          status: "passed",
          message: `Admin record found: ${admin.name}`,
        };
        checks.admin_permissions = {
          status: "passed",
          message: "User is a super administrator",
        };
      }
    }

    // Check 3: Verify admin_invitation_tokens table exists
    const { error: tableError } = await supabase
      .from("admin_invitation_tokens")
      .select("id")
      .limit(1);

    if (tableError) {
      if (tableError.code === "42P01") {
        checks.invitation_table = {
          status: "failed",
          message:
            "admin_invitation_tokens table does not exist. Please run the SQL setup script.",
        };
      } else {
        checks.invitation_table = {
          status: "warning",
          message: `Table exists but query failed: ${tableError.message}`,
        };
      }
    } else {
      checks.invitation_table = {
        status: "passed",
        message: "admin_invitation_tokens table exists",
      };
    }

    // Check 4: Verify admin-profiles storage bucket exists
    const { data: buckets, error: bucketsError } =
      await supabase.storage.listBuckets();

    if (bucketsError) {
      checks.storage_bucket = {
        status: "failed",
        message: `Failed to list buckets: ${bucketsError.message}`,
      };
    } else {
      const adminProfilesBucket = buckets?.find(
        (b) => b.name === "admin-profiles",
      );
      if (adminProfilesBucket) {
        checks.storage_bucket = {
          status: "passed",
          message: "admin-profiles bucket exists",
        };
      } else {
        checks.storage_bucket = {
          status: "failed",
          message:
            "admin-profiles bucket does not exist. Please create it in Supabase Dashboard.",
        };
      }
    }

    // Check 5: Verify environment variables
    const envVars = {
      NEXT_PUBLIC_APP_URL: !!process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };

    const missingEnvVars = Object.entries(envVars)
      .filter(([_, exists]) => !exists)
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      checks.environment_variables = {
        status: "failed",
        message: `Missing environment variables: ${missingEnvVars.join(", ")}`,
      };
    } else {
      checks.environment_variables = {
        status: "passed",
        message: "All required environment variables are set",
      };
    }

    // Count existing invitations
    if (checks.invitation_table?.status === "passed") {
      const { count, error: countError } = await supabase
        .from("admin_invitation_tokens")
        .select("*", { count: "exact", head: true })
        .eq("used", false)
        .gte("expires_at", new Date().toISOString());

      if (!countError && count !== null) {
        checks.pending_invitations = {
          status: "info",
          message: `${count} pending invitation(s)`,
        };
      }
    }

    // Overall status
    const failedChecks = Object.values(checks).filter(
      (c) => c.status === "failed",
    ).length;
    const warningChecks = Object.values(checks).filter(
      (c) => c.status === "warning",
    ).length;

    let overallStatus = "healthy";
    if (failedChecks > 0) {
      overallStatus = "unhealthy";
    } else if (warningChecks > 0) {
      overallStatus = "degraded";
    }

    return NextResponse.json({
      status: overallStatus,
      checks,
      summary: {
        total: Object.keys(checks).length,
        passed: Object.values(checks).filter((c) => c.status === "passed")
          .length,
        failed: failedChecks,
        warnings: warningChecks,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in diagnostic check:", error);
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        message: "Failed to run diagnostic checks",
      },
      { status: 500 },
    );
  }
}
