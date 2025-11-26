import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const formData = await req.formData();

  const jobId = formData.get("jobId");
  const idType = formData.get("idType");
  const idFront = formData.get("idFront") as File;
  const idBack = formData.get("idBack") as File;
  const selfie = formData.get("selfie") as File;

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Get applicant_id
  const { data: applicantData } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();
  if (!applicantData)
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });

  const applicantId = applicantData.id;

  // Upload files to Supabase Storage
  const folder = `applicant_${applicantId}/job_${jobId}`;
  const [frontRes, backRes, selfieRes] = await Promise.all([
    supabase.storage
      .from("verified-ids")
      .upload(`${folder}/front.jpg`, idFront, { upsert: true }),
    supabase.storage
      .from("verified-ids")
      .upload(`${folder}/back.jpg`, idBack, { upsert: true }),
    supabase.storage
      .from("verified-ids")
      .upload(`${folder}/selfie.jpg`, selfie, { upsert: true }),
  ]);

  if (frontRes.error || backRes.error || selfieRes.error) {
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 },
    );
  }

  // Save record in DB
  const { error } = await supabase.from("verified_ids").insert({
    applicant_id: applicantId,
    job_id: jobId,
    id_type: idType,
    id_front_url: frontRes.data.path,
    id_back_url: backRes.data.path,
    selfie_with_id_url: selfieRes.data.path,
    status: "pending",
  });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
