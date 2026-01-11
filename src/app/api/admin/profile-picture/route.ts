import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Get current admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get admin record
    const { data: admin, error: adminError } = await supabase
      .from("peso")
      .select("id, profile_picture_url")
      .eq("auth_id", user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 },
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }

    // Delete old profile picture if exists
    if (admin.profile_picture_url) {
      try {
        const urlParts = admin.profile_picture_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];

        if (fileName && folderName) {
          await supabase.storage
            .from("admin-profiles")
            .remove([`${folderName}/${fileName}`]);
        }
      } catch (deleteError) {
        console.warn("Failed to delete old profile picture:", deleteError);
        // Continue anyway - not critical
      }
    }

    // Upload new file
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("admin-profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("admin-profiles")
      .getPublicUrl(filePath);

    // Update admin record
    const { error: updateError } = await supabase
      .from("peso")
      .update({ profile_picture_url: urlData.publicUrl })
      .eq("id", admin.id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: admin, error: adminError } = await supabase
      .from("peso")
      .select("id, profile_picture_url")
      .eq("auth_id", user.id)
      .single();

    if (adminError || !admin) {
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }

    if (admin.profile_picture_url) {
      try {
        const urlParts = admin.profile_picture_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];

        if (fileName && folderName) {
          await supabase.storage
            .from("admin-profiles")
            .remove([`${folderName}/${fileName}`]);
        }
      } catch (deleteError) {
        console.warn("Failed to delete profile picture file:", deleteError);
        // Continue anyway to clear the database reference
      }
    }

    const { error: updateError } = await supabase
      .from("peso")
      .update({ profile_picture_url: null })
      .eq("id", admin.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to remove profile picture" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting profile picture:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
