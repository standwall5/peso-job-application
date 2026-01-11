import * as XLSX from "xlsx";

interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

interface ExcelOptions {
  title?: string;
  subtitle?: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  filename: string;
  sheetName?: string;
}

export function exportToExcel(options: ExcelOptions) {
  const {
    title,
    subtitle,
    columns,
    data,
    filename,
    sheetName = "Report",
  } = options;

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws_data: (string | number)[][] = [];

  // Add title rows
  let startRow = 0;
  if (title) {
    ws_data.push([title]);
    startRow++;
  }
  if (subtitle) {
    ws_data.push([subtitle]);
    ws_data.push([]); // Empty row
    startRow += 2;
  }

  // Add headers
  ws_data.push(columns.map((col) => col.header));

  // Add data rows
  data.forEach((row) => {
    ws_data.push(
      columns.map((col) => {
        const value = row[col.key];
        return (value as string | number) ?? "";
      }),
    );
  });

  // Add summary row if data exists
  if (data.length > 0) {
    ws_data.push([]); // Empty row
    ws_data.push(["Total Records:", data.length.toString()]);
  }

  // Create worksheet from data
  const ws = XLSX.utils.aoa_to_sheet(ws_data);

  // Set column widths
  ws["!cols"] = columns.map((col) => ({ wch: col.width || 20 }));

  // Merge title cell
  if (title) {
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }];
  }

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // Generate Excel file
  const date = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `${filename}_${date}.xlsx`);
}

// Age & Gender Summary Export
export function exportAgeSexSummary(
  data: Record<string, unknown>[],
  includeParanaque: boolean,
) {
  const columns: ExcelColumn[] = [
    { header: "Age Bracket", key: "ageBracket", width: 20 },
    { header: "Male", key: "male", width: 15 },
    { header: "Female", key: "female", width: 15 },
    { header: "Other", key: "other", width: 15 },
    { header: "Total", key: "total", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  const title = "PESO - Age & Gender Summary Report";
  const subtitle = includeParanaque
    ? "Parañaque Residents Only"
    : "All Locations";

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "age_gender_summary",
    sheetName: "Age & Gender",
  });
}

// Application Trends Export
export function exportApplicationTrends(data: Record<string, unknown>[]) {
  const columns: ExcelColumn[] = [
    { header: "Month", key: "month", width: 20 },
    { header: "Applications", key: "applications", width: 15 },
    { header: "Deployed", key: "deployed", width: 15 },
    { header: "Rejected", key: "rejected", width: 15 },
    { header: "In Progress", key: "inProgress", width: 15 },
    { header: "Success Rate (%)", key: "successRate", width: 18 },
  ];

  const title = "PESO - Application Trends Report";
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "application_trends",
    sheetName: "Trends",
  });
}

// Employment Status Export
export function exportEmploymentStatus(data: Record<string, unknown>[]) {
  const columns: ExcelColumn[] = [
    { header: "Status", key: "status", width: 25 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  const title = "PESO - Employment Status Report";
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "employment_status",
    sheetName: "Employment Status",
  });
}

// Applicant Type Distribution Export
export function exportApplicantTypes(data: Record<string, unknown>[]) {
  const columns: ExcelColumn[] = [
    { header: "Applicant Type", key: "type", width: 35 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  const title = "PESO - Applicant Type Distribution";
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "applicant_types",
    sheetName: "Applicant Types",
  });
}

// Place of Assignment Export
export function exportPlaceAssignment(data: Record<string, unknown>[]) {
  const columns: ExcelColumn[] = [
    { header: "Place of Assignment", key: "place", width: 30 },
    { header: "Count", key: "count", width: 15 },
    { header: "Percentage", key: "percentage", width: 15 },
  ];

  const title = "PESO - Place of Assignment Summary";
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "place_assignment",
    sheetName: "Place Assignment",
  });
}

// Complete Jobseeker Report Export
export function exportJobseekerReport(data: Record<string, unknown>[]) {
  const columns: ExcelColumn[] = [
    { header: "Name", key: "name", width: 30 },
    { header: "Age", key: "age", width: 10 },
    { header: "Gender", key: "gender", width: 15 },
    { header: "Applicant Type", key: "applicantType", width: 30 },
    { header: "Place of Assignment", key: "placeOfAssignment", width: 25 },
    { header: "District", key: "district", width: 20 },
    { header: "Applications", key: "applications", width: 15 },
    { header: "Status", key: "status", width: 15 },
  ];

  const title = "PESO - Complete Jobseeker Report";
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "jobseeker_report",
    sheetName: "Jobseekers",
  });
}

// Monthly Summary Export
export function exportMonthlySummary(data: Record<string, unknown>[]) {
  const columns: ExcelColumn[] = [
    { header: "Month", key: "month", width: 20 },
    { header: "New Applicants", key: "newApplicants", width: 18 },
    { header: "Applications", key: "applications", width: 18 },
    { header: "Deployed", key: "deployed", width: 15 },
    { header: "Active Jobs", key: "activeJobs", width: 15 },
  ];

  const title = "PESO - Monthly Summary Report";
  const subtitle = `Generated on ${new Date().toLocaleDateString()}`;

  exportToExcel({
    title,
    subtitle,
    columns,
    data,
    filename: "monthly_summary",
    sheetName: "Monthly Summary",
  });
}
