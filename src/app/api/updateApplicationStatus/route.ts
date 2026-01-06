import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const { application_id, status } = await request.json();

  console.log("[updateApplicationStatus] Request received:", {
    application_id,
    status,
  });

  if (!application_id || !status) {
    return NextResponse.json(
      { error: "Application ID and status are required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  // First, get the application details
  const { data: application, error: fetchError } = await supabase
    .from("applications")
    .select(
      `
      *,
      jobs (
        title,
        companies (
          name
        )
      )
    `,
    )
    .eq("id", application_id)
    .single();

  if (fetchError || !application) {
    console.error("[updateApplicationStatus] Fetch error:", fetchError);
    return NextResponse.json(
      { error: "Application not found" },
      { status: 404 },
    );
  }

  console.log("[updateApplicationStatus] Current status:", application.status);

  // Update the application status
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", application_id)
    .select();

  if (error) {
    console.error("[updateApplicationStatus] Update error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log("[updateApplicationStatus] Update successful:", {
    application_id,
    old_status: application.status,
    new_status: status,
  });

  // Create notification for the applicant based on status change
  const jobTitle = application.jobs?.title || "a position";
  const companyName = application.jobs?.companies?.name || "a company";

  let notificationData: {
    title: string;
    message: string;
    type: "application_update" | "new_job" | "exam_result" | "admin_message";
  } | null = null;

  switch (status) {
    case "Referred":
      notificationData = {
        type: "application_update",
        title: "Application Referred! 🎉",
        message: `Your application for ${jobTitle} at ${companyName} has been referred to the employer.`,
      };
      break;
    case "Accepted":
      notificationData = {
        type: "application_update",
        title: "Application Accepted! 🎊",
        message: `Congratulations! Your application for ${jobTitle} at ${companyName} has been accepted.`,
      };
      break;
    case "Rejected":
      notificationData = {
        type: "application_update",
        title: "Application Update",
        message: `Your application for ${jobTitle} at ${companyName} has been updated. Please check your profile for details.`,
      };
      break;
    case "For Interview":
      notificationData = {
        type: "application_update",
        title: "Interview Scheduled! 📅",
        message: `You've been shortlisted for an interview for ${jobTitle} at ${companyName}. Please check your email for details.`,
      };
      break;
    case "Hired":
      notificationData = {
        type: "application_update",
        title: "Congratulations - You're Hired! 🎉",
        message: `You have been hired for ${jobTitle} at ${companyName}! The company will contact you soon with next steps.`,
      };
      break;
    case "Pending":
      // Don't send notification for pending status
      break;
    default:
      // For any other status changes
      notificationData = {
        type: "application_update",
        title: "Application Status Updated",
        message: `Your application for ${jobTitle} at ${companyName} status has been updated to: ${status}`,
      };
  }

  // Insert notification if data is set
  if (notificationData) {
    const notificationResult = await supabase
      .from("notifications")
      .insert({
        applicant_id: application.applicant_id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        link: `/profile?tab=applications`,
        is_read: false,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (notificationResult.error) {
      console.error(
        "[updateApplicationStatus] Notification error:",
        notificationResult.error,
      );
      // Don't fail the whole request if notification fails
    } else {
      console.log(
        "[updateApplicationStatus] Notification created:",
        notificationResult.data,
      );
    }
  }

  return NextResponse.json({ success: true, data });
}
