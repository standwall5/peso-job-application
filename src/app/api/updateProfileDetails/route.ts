import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant record
  const { data: applicants, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicants) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const applicantId = applicants.id;
  const body = await req.json();

  // Only update allowed fields from the form
  const updateData: Record<string, string> = {};
  if (typeof body.preferred_poa === "string")
    updateData.preferred_poa = body.preferred_poa;
  if (typeof body.applicant_type === "string")
    updateData.applicant_type = body.applicant_type;

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json(
      { error: "No valid fields to update." },
      { status: 400 }
    );
  }

  const { error: updateError, data: updated } = await supabase
    .from("applicants")
    .update(updateData)
    .eq("id", applicantId)
    .select();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, user: updated?.[0] });
}
