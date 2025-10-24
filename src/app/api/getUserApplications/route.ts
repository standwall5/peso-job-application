import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch only this user's applicant data
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const { data: applicationData, error } = await supabase
    .from("applications")
    .select("*")
    .eq("applicant_id", applicantData.id);
  if (error) {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }

  // Return application data
  return NextResponse.json(applicationData);
}
