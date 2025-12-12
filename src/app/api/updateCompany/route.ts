import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[updateCompany] Auth check:", { user: user?.id, authError });

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is a PESO admin
  const { data: pesoUser, error: pesoError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  console.log("[updateCompany] PESO check:", {
    userId: user.id,
    pesoUser,
    pesoError,
  });

  if (!pesoUser || pesoError) {
    return NextResponse.json(
      {
        error: "Only PESO admins can update companies",
        debug: {
          userId: user.id,
          pesoError: pesoError?.message,
        },
      },
      { status: 403 },
    );
  }

  const { company_id, name, contact_email, location, industry, description } =
    await request.json();

  console.log("[updateCompany] Request data:", {
    company_id,
    name,
    contact_email,
    location,
    industry,
  });

  if (!company_id) {
    return NextResponse.json(
      { error: "Company ID is required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("companies")
    .update({
      name,
      contact_email,
      location,
      industry,
      description,
    })
    .eq("id", company_id)
    .select();

  console.log("[updateCompany] Update result:", { data, error });

  if (error) {
    console.error("[updateCompany] Error updating company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data?.[0] });
}
