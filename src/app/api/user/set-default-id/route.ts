import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { idType } = await req.json();

    if (!idType) {
      return NextResponse.json(
        { error: "ID type is required" },
        { status: 400 }
      );
    }

    // Update the applicant's default ID type
    const { error } = await supabase
      .from("applicants")
      .update({ default_id_type: idType })
      .eq("auth_id", user.id);

    if (error) {
      console.error("Error setting default ID type:", error);
      return NextResponse.json(
        { error: "Failed to set default ID type" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in set-default-id route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
