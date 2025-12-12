import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get applicant ID from user
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id, name")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Create a test notification
  const testNotifications = [
    {
      applicant_id: applicant.id,
      type: "application_update",
      title: "Test: Application Updated",
      message: `This is a test notification for ${applicant.name}. Your application status has been updated.`,
      link: "/profile",
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      applicant_id: applicant.id,
      type: "new_job",
      title: "Test: New Job Posted",
      message: "A new job matching your profile has been posted. Check it out!",
      link: "/jobs",
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      applicant_id: applicant.id,
      type: "exam_result",
      title: "Test: Exam Results Available",
      message: "Your exam results are now available. You scored 85%!",
      link: "/profile",
      is_read: false,
      created_at: new Date().toISOString(),
    },
    {
      applicant_id: applicant.id,
      type: "admin_message",
      title: "Test: Message from PESO",
      message:
        "The PESO office has sent you a message. Please check your messages.",
      link: "/chat",
      is_read: false,
      created_at: new Date().toISOString(),
    },
  ];

  // Insert a random test notification
  const randomNotification =
    testNotifications[Math.floor(Math.random() * testNotifications.length)];

  const { data, error } = await supabase
    .from("notifications")
    .insert(randomNotification)
    .select()
    .single();

  if (error) {
    console.error("Error creating test notification:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Test notification created",
    notification: data,
  });
}

// GET endpoint to check if notifications are working
export async function GET() {
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get applicant
  const { data: applicant } = await supabase
    .from("applicants")
    .select("id, name")
    .eq("auth_id", user.id)
    .single();

  if (!applicant) {
    return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
  }

  // Check if user can read notifications
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("applicant_id", applicant.id)
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) {
    return NextResponse.json({
      success: false,
      error: error.message,
      message: "Error reading notifications - RLS policies might not be set up",
    });
  }

  return NextResponse.json({
    success: true,
    applicant_id: applicant.id,
    applicant_name: applicant.name,
    notifications_count: notifications?.length || 0,
    recent_notifications: notifications,
    message: "Notifications system is working correctly",
  });
}
