import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // ensure this is server-safe

export async function GET() {
  const supabase = await createClient();
  const { data: companies, error } = await supabase
    .from("companies")
    .select("*");

  if (error) {
    console.error("Fetch companies error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(companies);
}
