import { NextResponse } from "next/server";
import { getUserApplications } from "@/lib/db/services/application.service";

export async function GET() {
  try {
    const applications = await getUserApplications();
    return NextResponse.json(applications);
  } catch (error) {
    console.error("Get user applications error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch user applications",
      },
      {
        status:
          error instanceof Error && error.message === "Applicant not found"
            ? 404
            : 500,
      },
    );
  }
}
