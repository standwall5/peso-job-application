// Resume service
"use server";

import { getSupabaseClient, getCurrentUser } from "../client";

export interface Education {
  school: string;
  degree: string;
  attainment: string;
  location: string;
  start_date: string;
  end_date: string;
}

export interface WorkExperience {
  company: string;
  position: string;
  location: string;
  start_date: string;
  end_date: string;
}

export interface ResumeData {
  education: Education;
  skills: string[];
  work_experiences: WorkExperience[];
  profile_introduction: string;
}

export async function getResume() {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicants, error: applicantError } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (applicantError || !applicants) {
    throw new Error("Applicant not found");
  }

  // Get resume
  const { data: resume, error: resumeError } = await supabase
    .from("resume")
    .select("*")
    .eq("applicant_id", applicants.id)
    .single();

  if (resumeError) {
    // Resume might not exist yet
    return null;
  }

  return resume as ResumeData;
}

export async function updateResume(data: {
  name: string;
  birth_date: string;
  address: string;
  sex: string;
  barangay: string;
  district: string;
  education: Education;
  skills: string[];
  work_experiences: WorkExperience[];
  profile_introduction: string;
}) {
  const supabase = await getSupabaseClient();
  const user = await getCurrentUser();

  // Get applicant ID
  const { data: applicants } = await supabase
    .from("applicants")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!applicants) {
    throw new Error("Applicant not found");
  }

  // Update applicant basic info
  await supabase
    .from("applicants")
    .update({
      name: data.name,
      birth_date: data.birth_date,
      address: data.address,
      sex: data.sex,
      barangay: data.barangay,
      district: data.district,
    })
    .eq("id", applicants.id);

  // Upsert resume
  const { data: resume, error } = await supabase
    .from("resume")
    .upsert(
      {
        applicant_id: applicants.id,
        education: data.education,
        skills: data.skills,
        work_experiences: data.work_experiences,
        profile_introduction: data.profile_introduction,
      },
      { onConflict: "applicant_id" },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return resume;
}
