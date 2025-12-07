import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// POST /api/jobs - Create a new job
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const body = await req.json();

  const { data, error } = await supabase
    .from("jobs")
    .insert([body])
    .select("*, companies(*)")
    .single();

  if (error) {
    console.error("Create job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

// PUT /api/jobs?id=123 - Update an existing job
export async function PUT(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing job id" }, { status: 400 });
  }

  const body = await req.json();

  // First check if the job exists and user has access
  const { data: existingJob, error: fetchError } = await supabase
    .from("jobs")
    .select("id")
    .eq("id", id)
    .single();

  if (fetchError || !existingJob) {
    console.error("Job not found or no access:", fetchError);
    return NextResponse.json(
      { error: "Job not found or access denied" },
      { status: 404 },
    );
  }

  // Now perform the update
  const { data, error } = await supabase
    .from("jobs")
    .update(body)
    .eq("id", id)
    .select("*, companies(*)")
    .single();

  if (error) {
    console.error("Update job error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
