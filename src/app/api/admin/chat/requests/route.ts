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

  console.log("[Admin Requests API] Fetching chat requests:", {
    requestedStatus: status,
    adminId: adminData.id,
  });

  // Get chat sessions with applicant details by querying tables directly
  const { data: chatSessions, error: sessionsError } = await supabase
    .from("chat_sessions")
    .select(
      `
      id,
      user_id,
      admin_id,
      status,
      concern,
      created_at,
      closed_at,
      applicants!inner(
        name,
        phone
      )
    `,
    )
    .eq("status", status)
    .order("created_at", { ascending: false });

  console.log("[Admin Requests API] Database response:", {
    requestedStatus: status,
    sessionsCount: chatSessions?.length || 0,
    error: sessionsError?.message || null,
    sessions: chatSessions?.map(
      (s: { id: string; status: string; concern: string | null }) => ({
        id: s.id,
        status: s.status,
        concern: s.concern?.substring(0, 30),
      }),
    ),
  });

  if (sessionsError) {
    console.error("Fetch chat sessions error:", sessionsError);
    return NextResponse.json({ error: sessionsError.message }, { status: 500 });
  }

  // Format response with user details
  const formattedSessions = (chatSessions || []).map(
    (session: {
      id: string;
      user_id: string;
      admin_id: string | null;
      status: string;
      concern: string | null;
      created_at: string;
      closed_at: string | null;
      applicants: { name: string; phone: string | null }[];
    }) => {
      const applicant = Array.isArray(session.applicants)
        ? session.applicants[0]
        : session.applicants;
      const userName = applicant?.name || "Unknown User";

      return {
        id: session.id,
        userId: session.user_id,
        userName: userName,
        userEmail: applicant?.phone || "No contact",
        concern: session.concern || "",
        timestamp: new Date(session.created_at),
        status: session.status,
        adminId: session.admin_id,
        closedAt: session.closed_at ? new Date(session.closed_at) : null,
      };
    },
  );

  return NextResponse.json(formattedSessions);
}
