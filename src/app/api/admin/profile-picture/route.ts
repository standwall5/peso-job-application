import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  console.log("📸 [Profile Picture API] POST request received");
  try {
    const supabase = await createClient();

    // Get current admin
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("❌ [Profile Picture API] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log("✅ [Profile Picture API] User authenticated:", user.id);

    // Get admin record
    const { data: admin, error: adminError } = await supabase
      .from("peso")
      .select("id, profile_picture_url")
      .eq("auth_id", user.id)
      .single();

    if (adminError || !admin) {
      console.error("❌ [Profile Picture API] Admin not found:", adminError);
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    console.log("✅ [Profile Picture API] Admin found:", admin.id);

    // Parse form data
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("❌ [Profile Picture API] No file in request");
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    console.log("📁 [Profile Picture API] File received:", {
      name: file.name,
      type: file.type,
      size: file.size,
    });

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      console.error("❌ [Profile Picture API] Invalid file type:", file.type);
      return NextResponse.json(
        { error: "Invalid file type. Only JPG, PNG, and WebP are allowed." },
        { status: 400 },
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error("❌ [Profile Picture API] File too large:", file.size);
      return NextResponse.json(
        { error: "File too large. Maximum size is 5MB." },
        { status: 400 },
      );
    }
    console.log("✅ [Profile Picture API] File validation passed");

    // Delete old profile picture if exists
    if (admin.profile_picture_url) {
      console.log(
        "🗑️ [Profile Picture API] Deleting old picture:",
        admin.profile_picture_url,
      );
      try {
        const urlParts = admin.profile_picture_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];

        if (fileName && folderName) {
          const { error: deleteError } = await supabase.storage
            .from("admin-profiles")
            .remove([`${folderName}/${fileName}`]);
          if (deleteError) {
            console.warn("⚠️ [Profile Picture API] Delete error:", deleteError);
          } else {
            console.log("✅ [Profile Picture API] Old picture deleted");
          }
        }
      } catch (deleteError) {
        console.warn(
          "⚠️ [Profile Picture API] Failed to delete old profile picture:",
          deleteError,
        );
        // Continue anyway - not critical
      }
    }

    // Upload new file
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    console.log("⬆️ [Profile Picture API] Uploading to storage:", filePath);
    const { error: uploadError } = await supabase.storage
      .from("admin-profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("❌ [Profile Picture API] Upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload file" },
        { status: 500 },
      );
    }
    console.log(
      "✅ [Profile Picture API] File uploaded to storage successfully",
    );

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("admin-profiles")
      .getPublicUrl(filePath);

    console.log(
      "🔗 [Profile Picture API] Public URL generated:",
      urlData.publicUrl,
    );

    // Update admin record
    console.log(
      "💾 [Profile Picture API] Updating database for admin:",
      admin.id,
    );
    const { error: updateError } = await supabase
      .from("peso")
      .update({ profile_picture_url: urlData.publicUrl })
      .eq("id", admin.id);

    if (updateError) {
      console.error(
        "❌ [Profile Picture API] Database update error:",
        updateError,
      );
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 },
      );
    }

    console.log("✅ [Profile Picture API] Database updated successfully");
    console.log(
      "🎉 [Profile Picture API] Upload complete! URL:",
      urlData.publicUrl,
    );

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
    });
  } catch (error) {
    console.error("❌ [Profile Picture API] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  console.log("🗑️ [Profile Picture API] DELETE request received");
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error(
        "❌ [Profile Picture API] Auth error on delete:",
        authError,
      );
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.log(
      "✅ [Profile Picture API] User authenticated for delete:",
      user.id,
    );

    const { data: admin, error: adminError } = await supabase
      .from("peso")
      .select("id, profile_picture_url")
      .eq("auth_id", user.id)
      .single();

    if (adminError || !admin) {
      console.error(
        "❌ [Profile Picture API] Admin not found on delete:",
        adminError,
      );
      return NextResponse.json({ error: "Admin not found" }, { status: 404 });
    }
    console.log("✅ [Profile Picture API] Admin found for delete:", admin.id);

    if (admin.profile_picture_url) {
      console.log(
        "🗑️ [Profile Picture API] Removing file from storage:",
        admin.profile_picture_url,
      );
      try {
        const urlParts = admin.profile_picture_url.split("/");
        const fileName = urlParts[urlParts.length - 1];
        const folderName = urlParts[urlParts.length - 2];

        if (fileName && folderName) {
          const { error: deleteError } = await supabase.storage
            .from("admin-profiles")
            .remove([`${folderName}/${fileName}`]);
          if (deleteError) {
            console.warn(
              "⚠️ [Profile Picture API] Storage delete error:",
              deleteError,
            );
          } else {
            console.log("✅ [Profile Picture API] File removed from storage");
          }
        }
      } catch (deleteError) {
        console.warn(
          "⚠️ [Profile Picture API] Failed to delete profile picture file:",
          deleteError,
        );
        // Continue anyway to clear the database reference
      }
    }

    console.log("💾 [Profile Picture API] Clearing database reference");
    const { error: updateError } = await supabase
      .from("peso")
      .update({ profile_picture_url: null })
      .eq("id", admin.id);

    if (updateError) {
      console.error(
        "❌ [Profile Picture API] Failed to update database on delete:",
        updateError,
      );
      return NextResponse.json(
        { error: "Failed to remove profile picture" },
        { status: 500 },
      );
    }

    console.log("✅ [Profile Picture API] Database reference cleared");
    console.log("🎉 [Profile Picture API] Delete complete");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(
      "❌ [Profile Picture API] Unexpected error on delete:",
      error,
    );
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
