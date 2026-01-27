import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/utils/supabase/server";

// GET /api/admin/view-id?applicantId=...&imageType=front|back|selfie&idType=...&applicationId=...
export async function GET(req: Request) {
  const userSupabase = await createClient();
  const { searchParams } = new URL(req.url);

  const applicantId = searchParams.get("applicantId");
  const imageType = searchParams.get("imageType") as
    | "front"
    | "back"
    | "selfie";
  const idType = searchParams.get("idType");
  const applicationId = searchParams.get("applicationId");

  if (!applicantId || !imageType || !idType) {
    return NextResponse.json(
      { error: "Missing required parameters" },
      { status: 400 },
    );
  }

  if (!["front", "back", "selfie"].includes(imageType)) {
    return NextResponse.json({ error: "Invalid image type" }, { status: 400 });
  }

  // Verify admin authentication using regular client
  const {
    data: { session },
  } = await userSupabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use admin client for all database and storage operations
  const supabase = createAdminClient();

  const { data: admin, error: adminError } = await supabase
    .from("peso")
    .select("id, name")
    .eq("auth_id", session.user.id)
    .single();

  if (adminError || !admin) {
    return NextResponse.json(
      { error: "Unauthorized - Admin access required" },
      { status: 403 },
    );
  }

  // Try to get the specific ID type requested
  let { data: idData, error: idError } = await supabase
    .from("applicant_ids")
    .select("*")
    .eq("applicant_id", parseInt(applicantId))
    .eq("id_type", idType)
    .maybeSingle();

  // If not found, try to get preferred ID
  if (!idData && !idError) {
    const preferredResult = await supabase
      .from("applicant_ids")
      .select("*")
      .eq("applicant_id", parseInt(applicantId))
      .eq("is_preferred", true)
      .maybeSingle();

    idData = preferredResult.data;
    idError = preferredResult.error;
  }

  // If still not found, get most recent ID
  if (!idData && !idError) {
    const anyResult = await supabase
      .from("applicant_ids")
      .select("*")
      .eq("applicant_id", parseInt(applicantId))
      .order("uploaded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    idData = anyResult.data;
    idError = anyResult.error;
  }

  if (idError || !idData) {
    return NextResponse.json({ error: "ID not found" }, { status: 404 });
  }

  // Determine which image URL to use
  let imagePath: string;
  switch (imageType) {
    case "front":
      imagePath = idData.id_front_url;
      break;
    case "back":
      imagePath = idData.id_back_url;
      break;
    case "selfie":
      imagePath = idData.selfie_with_id_url;
      break;
    default:
      return NextResponse.json(
        { error: "Invalid image type" },
        { status: 400 },
      );
  }

  try {
    // Download original image from storage
    const { data: imageData, error: downloadError } = await supabase.storage
      .from("applicant-ids")
      .download(imagePath);

    if (downloadError || !imageData) {
      return NextResponse.json(
        { error: "Failed to retrieve image" },
        { status: 500 },
      );
    }

    // Convert blob to buffer
    const buffer = Buffer.from(await imageData.arrayBuffer());

    // Log the view
    await supabase.from("id_view_logs").insert({
      applicant_id: parseInt(applicantId),
      admin_id: admin.id,
      application_id: applicationId ? parseInt(applicationId) : null,
      ip_address:
        req.headers.get("x-forwarded-for") ||
        req.headers.get("x-real-ip") ||
        null,
      user_agent: req.headers.get("user-agent") || null,
      image_type: imageType,
    });

    // Try to use sharp for watermarking, fallback to original image if it fails
    let finalImage: Buffer;
    let isWatermarked = false;

    try {
      // Dynamically import sharp to handle potential build issues
      const sharp = (await import("sharp")).default;

      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 1000;
      const height = metadata.height || 1000;

      // Create watermark text
      const timestamp = new Date().toLocaleString("en-US", {
        timeZone: "Asia/Manila",
        dateStyle: "medium",
        timeStyle: "short",
      });
      const watermarkLines = [
        `Viewed by: ${admin.name}`,
        timestamp,
        "CONFIDENTIAL - DO NOT DISTRIBUTE",
      ];

      // Create watermark SVG with better styling
      const watermarkSvg = Buffer.from(`
        <svg width="${width}" height="${height}">
          <defs>
            <style>
              .watermark-diagonal {
                font-size: ${Math.max(24, width / 25)}px;
                font-weight: bold;
                font-family: Arial, sans-serif;
                fill: rgba(255, 0, 0, 0.3);
              }
              .watermark-bottom {
                font-size: ${Math.max(16, width / 35)}px;
                font-weight: bold;
                font-family: Arial, sans-serif;
                fill: rgba(255, 0, 0, 0.5);
              }
            </style>
          </defs>

          <!-- Diagonal watermark in center -->
          <text
            x="50%"
            y="50%"
            text-anchor="middle"
            class="watermark-diagonal"
            transform="rotate(-45, ${width / 2}, ${height / 2})"
          >
            ${watermarkLines.map((line, i) => `<tspan x="50%" dy="${i === 0 ? 0 : 1.3}em">${line}</tspan>`).join("")}
          </text>

          <!-- Bottom watermark -->
          <rect x="0" y="${height - 80}" width="${width}" height="80" fill="rgba(0, 0, 0, 0.5)" />
          <text x="20" y="${height - 50}" class="watermark-bottom" fill="rgba(255, 255, 255, 0.9)">
            ${watermarkLines[0]}
          </text>
          <text x="20" y="${height - 25}" class="watermark-bottom" fill="rgba(255, 255, 255, 0.9)">
            ${watermarkLines[1]} - ${watermarkLines[2]}
          </text>
        </svg>
      `);

      // Apply watermark
      finalImage = await sharp(buffer)
        .composite([
          {
            input: watermarkSvg,
            top: 0,
            left: 0,
          },
        ])
        .jpeg({ quality: 85 })
        .toBuffer();

      isWatermarked = true;
    } catch (sharpError) {
      console.warn(
        "Sharp watermarking failed, serving original image:",
        sharpError,
      );
      finalImage = buffer;
      isWatermarked = false;
    }

    // Determine content type from original image
    const contentType = imageData.type || "image/jpeg";

    // Return image (watermarked if possible, original otherwise)
    return new Response(new Uint8Array(finalImage), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, private",
        Pragma: "no-cache",
        Expires: "0",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'",
        "X-Watermarked": isWatermarked.toString(),
        "X-Admin-Name": admin.name,
        "X-View-Logged": "true",
      },
    });
  } catch (error) {
    console.error("Error processing ID image:", error);
    return NextResponse.json(
      {
        error: "Failed to process image",
        details:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 },
    );
  }
}
