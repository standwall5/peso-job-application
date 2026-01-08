import { NextResponse } from "next/server";
import { getCompanies } from "@/lib/db/services/company.service";

export async function GET() {
  try {
    const companies = await getCompanies();
    return NextResponse.json(companies);
  } catch (error) {
    console.error("Fetch companies error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to fetch companies",
      },
      { status: 500 },
    );
  }
}
