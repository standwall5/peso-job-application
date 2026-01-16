import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Get applicant's verification status
    const { data: applicant, error } = await supabase
      .from("applicants")
      .select("id_verified, id_verified_at")
      .eq("auth_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching verification status:", error);
      return NextResponse.json(
        { error: "Failed to fetch verification status" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      id_verified: applicant?.id_verified || false,
      id_verified_at: applicant?.id_verified_at || null,
    });
  } catch (error) {
    console.error("Error in verification-status route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
