import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check if user is authenticated
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  console.log("[uploadCompanyLogo] Auth check:", { user: user?.id, authError });

  if (!user || authError) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check if user is a PESO admin
  const { data: pesoUser, error: pesoError } = await supabase
    .from("peso")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  console.log("[uploadCompanyLogo] PESO check:", {
    userId: user.id,
    pesoUser,
    pesoError,
  });

  if (!pesoUser || pesoError) {
    return NextResponse.json(
      {
        error: "Only PESO admins can upload company logos",
        debug: {
          userId: user.id,
          pesoError: pesoError?.message,
        },
      },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("logo") as File;
  const company_id = formData.get("company_id") as string;

  console.log("[uploadCompanyLogo] Form data:", {
    hasFile: !!file,
    company_id,
    company_id_type: typeof company_id,
    fileName: file?.name,
    fileSize: file?.size,
  });

  if (!file || !company_id) {
    return NextResponse.json(
      { error: "Logo file and company ID are required" },
      { status: 400 },
    );
  }

  try {
    // Convert company_id to number
    const companyIdNum = parseInt(company_id, 10);

    if (isNaN(companyIdNum)) {
      return NextResponse.json(
        { error: "Invalid company ID" },
        { status: 400 },
      );
    }

    // Check if company exists first
    const { data: existingCompany, error: checkError } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", companyIdNum)
      .single();

    console.log("[uploadCompanyLogo] Company check:", {
      existingCompany,
      checkError,
    });

    if (checkError || !existingCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    // Generate unique filename
    const fileExt = file.name.split(".").pop();
    const fileName = `${companyIdNum}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    console.log("[uploadCompanyLogo] Uploading to:", filePath);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("company-logos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (uploadError) {
      console.error("[uploadCompanyLogo] Upload error:", uploadError);
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    console.log("[uploadCompanyLogo] Upload successful:", uploadData);

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("company-logos").getPublicUrl(filePath);

    console.log("[uploadCompanyLogo] Public URL:", publicUrl);

    // Update company with new logo URL - REMOVED .single()
    const { data, error } = await supabase
      .from("companies")
      .update({ logo: publicUrl })
      .eq("id", companyIdNum)
      .select();

    console.log("[uploadCompanyLogo] Update result:", { data, error });

    if (error) {
      console.error("[uploadCompanyLogo] Database update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Check if update actually affected any rows
    if (!data || data.length === 0) {
      console.error("[uploadCompanyLogo] No rows updated");
      return NextResponse.json(
        { error: "Failed to update company logo - no rows affected" },
        { status: 500 },
      );
    }

    console.log("[uploadCompanyLogo] Success! Company updated:", data[0]);

    return NextResponse.json({
      success: true,
      logo: publicUrl,
      data: data[0],
    });
  } catch (error) {
    console.error("[uploadCompanyLogo] Unexpected error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
