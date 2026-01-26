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

  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json(
        { error: "Search query must be at least 2 characters" },
        { status: 400 },
      );
    }

    // Search applicants by name or phone
    const { data: applicants, error: searchError } = await supabase
      .from("applicants")
      .select("id, name, phone")
      .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
      .order("name", { ascending: true })
      .limit(20);

    if (searchError) {
      console.error("Search error:", searchError);
      return NextResponse.json(
        { error: "Failed to search applicants" },
        { status: 500 },
      );
    }

    // Format response
    const formattedApplicants = (applicants || []).map((applicant) => ({
      id: applicant.id,
      name: applicant.name,
      email: applicant.phone || "No contact",
      phone: applicant.phone,
    }));

    return NextResponse.json(formattedApplicants);
  } catch (error) {
    console.error("Error searching applicants:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
