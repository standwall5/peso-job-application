import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Verify user is admin
  const { data: adminData, error: adminError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (adminError || !adminData) {
    console.error("Admin lookup error:", adminError);
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 },
    );
  }

  // Get status from query params
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "pending";

  // Map status values
  let statusValue = status;
  if (status === "new") {
    statusValue = "pending";
  }

  // Get chat sessions with applicant details
  const { data: chatSessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select(
      `
      id,
      user_id,
      status,
      concern,
      created_at,
      closed_at,
      admin_id,
      applicants (
        id,
        first_name,
        last_name,
        auth_id
      )
    `,
    )
    .eq("status", statusValue)
    .order("created_at", { ascending: false });

  if (sessionsError) {
    console.error("Fetch chat sessions error:", sessionsError);
    return NextResponse.json({ error: sessionsError.message }, { status: 500 });
  }

  // Format response with user details
  const formattedSessions = await Promise.all(
    (chatSessions || []).map(async (session: Record<string, unknown>) => {
      const applicants = session.applicants as Record<string, unknown> | null;
      const authId = (applicants?.auth_id as string) || "";

      // Get user email from auth
      const { data: authUser } = await supabase.auth.admin.getUserById(authId);

      const firstName = applicants?.first_name as string | null;
      const lastName = applicants?.last_name as string | null;

      return {
        id: session.id as string,
        userId: session.user_id as number,
        userName: applicants
          ? `${firstName || ""} ${lastName || ""}`.trim() || "Unknown User"
          : "Unknown User",
        userEmail: authUser?.user?.email || "No email",
        concern: (session.concern as string) || "",
        timestamp: new Date(session.created_at as string),
        status: session.status as string,
        adminId: session.admin_id as number | null,
        closedAt: session.closed_at
          ? new Date(session.closed_at as string)
          : null,
      };
    }),
  );

  return NextResponse.json(formattedSessions);
}
