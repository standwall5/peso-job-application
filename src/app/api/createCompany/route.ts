import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is a PESO admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: pesoUser } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!pesoUser) {
    return NextResponse.json(
      { error: "Only PESO admins can create companies" },
      { status: 403 },
    );
  }

  const {
    name,
    contact_number,
    contact_email,
    location,
    industry,
    description,
  } = await request.json();

  if (!name || !contact_email || !location || !industry) {
    return NextResponse.json(
      { error: "Name, email, location, and industry are required" },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("companies")
    .insert({
      name,
      contact_number,
      contact_email,
      location,
      industry,
      description,
      website: "", // Default empty, can be added later
      logo: null, // Will be uploaded separately if provided
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, data });
}
