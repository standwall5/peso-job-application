import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // ensure this is server-safe

export async function GET() {
  const supabase = await createClient();
  const { data: jobs, error } = await supabase
    .from("jobs")
    .select("*, companies(*)");

  if (error) {
    console.error("Fetch jobs error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(jobs);
}
