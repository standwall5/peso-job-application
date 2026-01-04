import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const formData = await req.formData();

  const idType = formData.get("idType");
  const idFront = formData.get("idFront") as File;
  const idBack = formData.get("idBack") as File;
  const selfie = formData.get("selfie") as File;

  // Validate inputs
  if (!idType || !idFront || !idBack || !selfie) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 },
    );
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant_id
  const { data: applicantData, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicantData) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const applicantId = applicantData.id;

  try {
    // Validate file types and sizes
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (const file of [idFront, idBack, selfie]) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid file type. Only JPG and PNG are allowed." },
          { status: 400 },
        );
      }
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit." },
          { status: 400 },
        );
      }
    }

    // Upload files to NEW applicant-ids bucket
    const timestamp = Date.now();
    const folder = `${applicantId}`;
    const frontPath = `${folder}/front_${timestamp}.jpg`;
    const backPath = `${folder}/back_${timestamp}.jpg`;
    const selfiePath = `${folder}/selfie_${timestamp}.jpg`;

    const [frontRes, backRes, selfieRes] = await Promise.all([
      supabase.storage.from("applicant-ids").upload(frontPath, idFront, {
        contentType: idFront.type,
        upsert: false,
      }),
      supabase.storage.from("applicant-ids").upload(backPath, idBack, {
        contentType: idBack.type,
        upsert: false,
      }),
      supabase.storage.from("applicant-ids").upload(selfiePath, selfie, {
        contentType: selfie.type,
        upsert: false,
      }),
    ]);

    if (frontRes.error || backRes.error || selfieRes.error) {
      // Clean up any uploaded files
      await Promise.all([
        frontRes.data &&
          supabase.storage.from("applicant-ids").remove([frontPath]),
        backRes.data &&
          supabase.storage.from("applicant-ids").remove([backPath]),
        selfieRes.data &&
          supabase.storage.from("applicant-ids").remove([selfiePath]),
      ]);

      return NextResponse.json(
        { error: "Failed to upload images. Please try again." },
        { status: 500 },
      );
    }

    // Check if applicant already has IDs
    const { data: existingID } = await supabase
      .from("applicant_ids")
      .select("id, id_front_url, id_back_url, selfie_with_id_url")
      .eq("applicant_id", applicantId)
      .single();

    if (existingID) {
      // Delete old images from storage
      const oldPaths = [
        existingID.id_front_url,
        existingID.id_back_url,
        existingID.selfie_with_id_url,
      ];
      await supabase.storage.from("applicant-ids").remove(oldPaths);

      // Update existing record
      const { error: updateError } = await supabase
        .from("applicant_ids")
        .update({
          id_type: idType as string,
          id_front_url: frontPath,
          id_back_url: backPath,
          selfie_with_id_url: selfiePath,
        })
        .eq("applicant_id", applicantId);

      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 },
        );
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from("applicant_ids")
        .insert({
          applicant_id: applicantId,
          id_type: idType as string,
          id_front_url: frontPath,
          id_back_url: backPath,
          selfie_with_id_url: selfiePath,
        });

      if (insertError) {
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: existingID
        ? "ID updated successfully! This will be used for all your applications."
        : "ID uploaded successfully! This will be used for all your applications.",
    });
  } catch (error) {
    console.error("Error uploading ID:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
