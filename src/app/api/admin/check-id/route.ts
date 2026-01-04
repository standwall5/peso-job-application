import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// GET /api/admin/check-id?applicantId=...
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const applicantId = searchParams.get("applicantId");

  if (!applicantId) {
    return NextResponse.json({ error: "Missing applicantId" }, { status: 400 });
  }

  // Verify admin authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data: admin } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!admin) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 },
    );
  }

  // Check if applicant has uploaded ID
  const { data: idData } = await supabase
    .from("applicant_ids")
    .select("id, id_type, uploaded_at")
    .eq("applicant_id", parseInt(applicantId))
    .single();

  return NextResponse.json({
    hasID: !!idData,
    idData: idData || null,
  });
}
