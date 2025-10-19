import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.log("Not authenticated");
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.log("No file uploaded");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from("profile-pics")
      .upload(`user-${user.id}/${file.name}`, file, { upsert: true });

    if (error) {
      console.log("Storage upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("profile-pics")
      .getPublicUrl(`user-${user.id}/${file.name}`);

    // Update applicants table
    const { error: dbError } = await supabase
      .from("applicants")
      .update({ profile_pic_url: urlData.publicUrl })
      .eq("auth_id", user.id);

    if (dbError) {
      console.log("DB update error:", dbError);
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.log("Unexpected error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
