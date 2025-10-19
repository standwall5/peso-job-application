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
  const { data, error } = await supabase
    .from("applicants")
    .select("*")
    .eq("auth_id", user.id);

  if (error) {
    console.log(error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Combine applicant data and email
  const applicant = data?.[0] || null;
  const response = applicant
    ? { ...applicant, email: user.email }
    : { email: user.email };

  return NextResponse.json(response);
}
