import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Get applicant record
  const { data: applicants, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicants) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  const applicantId = applicants.id;
  const body = await req.json();

  // 1. Update applicants table for personal info
  const applicantUpdateFields: Record<string, string | null> = {};
  if (body.name !== undefined) applicantUpdateFields.name = body.name;
  if (body.address !== undefined) applicantUpdateFields.address = body.address;
  if (body.district !== undefined)
    applicantUpdateFields.district = body.district;
  if (body.barangay !== undefined)
    applicantUpdateFields.barangay = body.barangay;
  if (body.sex !== undefined) applicantUpdateFields.sex = body.sex;
  if (body.birth_date !== undefined)
    applicantUpdateFields.birth_date = body.birth_date;
  // add more fields as needed

  if (Object.keys(applicantUpdateFields).length > 0) {
    const { error: applicantUpdateError } = await supabase
      .from("applicants")
      .update(applicantUpdateFields)
      .eq("id", applicantId);

    if (applicantUpdateError) {
      console.log(applicantUpdateError);

      return NextResponse.json(
        { error: applicantUpdateError.message },
        { status: 500 }
      );
    }
  }

  // 2. Upsert resume (insert or update)
  const { error: upsertError, data: upserted } = await supabase
    .from("resume")
    .upsert(
      [
        {
          applicant_id: applicantId,
          education: body.education,
          skills: body.skills,
          work_experiences: body.work_experiences,
          profile_introduction: body.profile_introduction,
          // add other fields as needed
        },
      ],
      { onConflict: "applicant_id" }
    )
    .select();

  if (upsertError) {
    console.log(upsertError);

    return NextResponse.json({ error: upsertError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, resume: upserted?.[0] });
}
