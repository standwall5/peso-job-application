// Analytics service
"use server";

import { getSupabaseClient } from "../client";
import { APPLICANT_TYPES } from "@/app/(auth)/signup/constants/form.constants";

export interface DashboardStats {
  totalApplicants: number;
  totalApplications: number;
  totalJobs: number;
  totalCompanies: number;
  pendingApplications: number;
  activeJobs: number;
}

export interface ApplicationStatusBreakdown {
  status: string;
  count: number;
  percentage: number;
}

export interface PopularJob {
  job_id: number;
  job_title: string;
  company_name: string;
  application_count: number;
}

export interface ApplicantDemographics {
  sex: { male: number; female: number; other: number };
  applicantType: {
    regular: number;
    pwd: number;
    senior: number;
    indigenous: number;
  };
  ageGroups: {
    "18-25": number;
    "26-35": number;
    "36-45": number;
    "46-55": number;
    "56+": number;
  };
  districts: Record<string, number>;
}

export interface ExamPerformance {
  exam_id: number;
  exam_title: string;
  total_attempts: number;
  average_score: number;
  pass_rate: number;
}

export interface ApplicationTrend {
  date: string;
  count: number;
}

export interface MonthlyApplicationTrend {
  month: string; // Format: "2024-01" or "January 2024"
  year: number;
  monthNumber: number;
  count: number;
}

export interface CompanyPerformance {
  company_id: number;
  company_name: string;
  total_jobs: number;
  total_applications: number;
  avg_applications_per_job: number;
}

export interface AgeSexSummary {
  ageGroup: string;
  male: number;
  female: number;
  other: number;
  total: number;
}

export interface ApplicantTypeSummary {
  applicantType: string;
  male: number;
  female: number;
  other: number;
  total: number;
}

const AGE_SEX_GROUPS = [
  "15-17",
  "18-19",
  "20-24",
  "25-34",
  "35-44",
  "45-59",
  "60 & above",
];

// Internal type definitions for Supabase responses
// Internal type definitions for Supabase responses
interface ApplicationWithJob {
  job_id: number | null;
  jobs: {
    title: string;
    companies: Array<{
      name: string;
    }>;
  } | null;
}

interface ApplicantData {
  sex: string | null;
  applicant_type: string | null;
  age: number | null;
  district: string | null;
}

interface ExamAttemptData {
  exam_id: number | null;
  score: number | null;
  exams: Array<{
    title: string;
  }> | null;
}

interface ApplicationDateData {
  applied_date: string;
}

interface CompanyData {
  id: number;
  name: string;
}

interface JobData {
  id: number;
  company_id: number;
}

interface ApplicationJobData {
  job_id: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await getSupabaseClient();

  const [
    { count: totalApplicants },
    { count: totalApplications },
    { count: totalJobs },
    { count: totalCompanies },
    { count: pendingApplications },
    { count: activeJobs },
  ] = await Promise.all([
    supabase.from("applicants").select("*", { count: "exact", head: true }),
    supabase.from("applications").select("*", { count: "exact", head: true }),
    supabase.from("jobs").select("*", { count: "exact", head: true }),
    supabase.from("companies").select("*", { count: "exact", head: true }),
    supabase
      .from("applications")
      .select("*", { count: "exact", head: true })
      .eq("status", "Pending"),
    supabase
      .from("jobs")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
  ]);

  return {
    totalApplicants: totalApplicants || 0,
    totalApplications: totalApplications || 0,
    totalJobs: totalJobs || 0,
    totalCompanies: totalCompanies || 0,
    pendingApplications: pendingApplications || 0,
    activeJobs: activeJobs || 0,
  };
}

export async function getApplicationStatusBreakdown(): Promise<
  ApplicationStatusBreakdown[]
> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from("applications").select("status");

  if (error) throw new Error(error.message);

  const statusCounts: Record<string, number> = {};
  const total = data.length;

  data.forEach((app) => {
    const status = app.status || "Unknown";
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count,
    percentage: Math.round((count / total) * 100),
  }));
}

export async function getPopularJobs(
  limit: number = 10
): Promise<PopularJob[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from("applications").select(
    `
      job_id,
      jobs (
        title,
        companies (name)
      )
    `
  );

  if (error) throw new Error(error.message);

  const jobCounts: Record<
    number,
    { title: string; company: string; count: number }
  > = {};

  (data as unknown as ApplicationWithJob[]).forEach((app) => {
    if (app.job_id && app.jobs) {
      if (!jobCounts[app.job_id]) {
        jobCounts[app.job_id] = {
          title: app.jobs.title,
          company: app.jobs.companies?.[0]?.name || "Unknown",
          count: 0,
        };
      }
      jobCounts[app.job_id].count++;
    }
  });

  return Object.entries(jobCounts)
    .map(([job_id, data]) => ({
      job_id: Number(job_id),
      job_title: data.title,
      company_name: data.company,
      application_count: data.count,
    }))
    .sort((a, b) => b.application_count - a.application_count)
    .slice(0, limit);
}

export async function getApplicantDemographics(
  filterByParanaque: boolean = false
): Promise<ApplicantDemographics> {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from("applicants")
    .select("sex, applicant_type, age, district, barangay");

  // Filter by Parañaque residents if requested
  if (filterByParanaque) {
    query = query.neq("district", "");
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  const demographics: ApplicantDemographics = {
    sex: { male: 0, female: 0, other: 0 },
    applicantType: { regular: 0, pwd: 0, senior: 0, indigenous: 0 },
    ageGroups: { "18-25": 0, "26-35": 0, "36-45": 0, "46-55": 0, "56+": 0 },
    districts: {},
  };

  (data as ApplicantData[]).forEach((applicant) => {
    // Sex
    const sex = (applicant.sex || "").toLowerCase();
    if (sex === "male") demographics.sex.male++;
    else if (sex === "female") demographics.sex.female++;
    else demographics.sex.other++;

    // Applicant Type
    const type = (applicant.applicant_type || "regular").toLowerCase();
    if (type.includes("pwd")) demographics.applicantType.pwd++;
    else if (type.includes("senior")) demographics.applicantType.senior++;
    else if (type.includes("indigenous"))
      demographics.applicantType.indigenous++;
    else demographics.applicantType.regular++;

    // Age Groups
    const age = applicant.age || 0;
    if (age >= 18 && age <= 25) demographics.ageGroups["18-25"]++;
    else if (age >= 26 && age <= 35) demographics.ageGroups["26-35"]++;
    else if (age >= 36 && age <= 45) demographics.ageGroups["36-45"]++;
    else if (age >= 46 && age <= 55) demographics.ageGroups["46-55"]++;
    else if (age >= 56) demographics.ageGroups["56+"]++;

    // Districts
    const district = applicant.district || "Unknown";
    demographics.districts[district] =
      (demographics.districts[district] || 0) + 1;
  });

  return demographics;
}

export async function getAgeSexSummary(
  filterByParanaque: boolean = false
): Promise<AgeSexSummary[]> {
  const supabase = await getSupabaseClient();

  let query = supabase.from("applicants").select("sex, age, district");

  // Filter by Parañaque residents if requested
  if (filterByParanaque) {
    query = query.neq("district", "");
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  // Initialize summary data structure
  const summary: Record<
    string,
    { male: number; female: number; other: number }
  > = {};

  AGE_SEX_GROUPS.forEach((group) => {
    summary[group] = { male: 0, female: 0, other: 0 };
  });

  (data as ApplicantData[]).forEach((applicant) => {
    const sex = (applicant.sex || "").toLowerCase();
    const age = applicant.age || 0;

    // Determine age group
    let ageGroup = "";
    if (age >= 15 && age <= 17) ageGroup = "15-17";
    else if (age >= 18 && age <= 19) ageGroup = "18-19";
    else if (age >= 20 && age <= 24) ageGroup = "20-24";
    else if (age >= 25 && age <= 34) ageGroup = "25-34";
    else if (age >= 35 && age <= 44) ageGroup = "35-44";
    else if (age >= 45 && age <= 59) ageGroup = "45-59";
    else if (age >= 60) ageGroup = "60 & above";

    if (ageGroup && summary[ageGroup]) {
      if (sex === "male") summary[ageGroup].male++;
      else if (sex === "female") summary[ageGroup].female++;
      else summary[ageGroup].other++;
    }
  });

  // Convert to array format
  return Object.entries(summary).map(([ageGroup, counts]) => ({
    ageGroup,
    male: counts.male,
    female: counts.female,
    other: counts.other,
    total: counts.male + counts.female + counts.other,
  }));
}

export async function getExamPerformance(): Promise<ExamPerformance[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from("exam_attempts").select(
    `
      exam_id,
      score,
      exams (
        title
      )
    `
  );

  if (error) throw new Error(error.message);

  const examStats: Record<
    number,
    { title: string; scores: number[]; attempts: number }
  > = {};

  (data as unknown as ExamAttemptData[]).forEach((attempt) => {
    if (attempt.exam_id && attempt.exams && attempt.exams.length > 0) {
      if (!examStats[attempt.exam_id]) {
        examStats[attempt.exam_id] = {
          title: attempt.exams[0].title,
          scores: [],
          attempts: 0,
        };
      }
      examStats[attempt.exam_id].scores.push(Number(attempt.score) || 0);
      examStats[attempt.exam_id].attempts++;
    }
  });

  return Object.entries(examStats).map(([exam_id, data]) => {
    const avgScore =
      data.scores.reduce((a, b) => a + b, 0) / data.scores.length;
    const passRate =
      (data.scores.filter((s) => s >= 70).length / data.scores.length) * 100;

    return {
      exam_id: Number(exam_id),
      exam_title: data.title,
      total_attempts: data.attempts,
      average_score: Math.round(avgScore * 10) / 10,
      pass_rate: Math.round(passRate * 10) / 10,
    };
  });
}

export async function getApplicationTrends(
  days: number = 30
): Promise<ApplicationTrend[]> {
  const supabase = await getSupabaseClient();

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const { data, error } = await supabase
    .from("applications")
    .select("applied_date")
    .gte("applied_date", startDate.toISOString());

  if (error) throw new Error(error.message);

  const dateCounts: Record<string, number> = {};

  (data as ApplicationDateData[]).forEach((app) => {
    const date = new Date(app.applied_date).toISOString().split("T")[0];
    dateCounts[date] = (dateCounts[date] || 0) + 1;
  });

  return Object.entries(dateCounts)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function getApplicationTrendsByMonth(
  months: number = 12
): Promise<MonthlyApplicationTrend[]> {
  const supabase = await getSupabaseClient();

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const { data, error } = await supabase
    .from("applications")
    .select("applied_date")
    .gte("applied_date", startDate.toISOString());

  if (error) throw new Error(error.message);

  const monthCounts: Record<
    string,
    { year: number; month: number; count: number }
  > = {};

  (data as ApplicationDateData[]).forEach((app) => {
    const date = new Date(app.applied_date);
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // 1-12
    const key = `${year}-${month.toString().padStart(2, "0")}`;

    if (!monthCounts[key]) {
      monthCounts[key] = { year, month, count: 0 };
    }
    monthCounts[key].count++;
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return Object.entries(monthCounts)
    .map(([key, data]) => ({
      month: `${monthNames[data.month - 1]} ${data.year}`,
      year: data.year,
      monthNumber: data.month,
      count: data.count,
    }))
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.monthNumber - b.monthNumber;
    });
}

export async function getCompanyPerformance(): Promise<CompanyPerformance[]> {
  const supabase = await getSupabaseClient();

  const { data: companies, error: companiesError } = await supabase
    .from("companies")
    .select("id, name");

  if (companiesError) throw new Error(companiesError.message);

  const { data: jobs, error: jobsError } = await supabase
    .from("jobs")
    .select("id, company_id");

  if (jobsError) throw new Error(jobsError.message);

  const { data: applications, error: appsError } = await supabase
    .from("applications")
    .select("job_id");

  if (appsError) throw new Error(appsError.message);

  const companyStats: Record<
    number,
    { name: string; jobs: number; apps: number }
  > = {};

  (companies as CompanyData[]).forEach((company) => {
    companyStats[company.id] = {
      name: company.name,
      jobs: 0,
      apps: 0,
    };
  });

  (jobs as JobData[]).forEach((job) => {
    if (companyStats[job.company_id]) {
      companyStats[job.company_id].jobs++;
    }
  });

  (applications as ApplicationJobData[]).forEach((app) => {
    const job = (jobs as JobData[]).find((j) => j.id === app.job_id);
    if (job && companyStats[job.company_id]) {
      companyStats[job.company_id].apps++;
    }
  });

  return Object.entries(companyStats)
    .map(([company_id, data]) => ({
      company_id: Number(company_id),
      company_name: data.name,
      total_jobs: data.jobs,
      total_applications: data.apps,
      avg_applications_per_job:
        data.jobs > 0 ? Math.round((data.apps / data.jobs) * 10) / 10 : 0,
    }))
    .sort((a, b) => b.total_applications - a.total_applications);
}

export async function getApplicantTypeSummary(
  filterByParanaque: boolean = false
): Promise<ApplicantTypeSummary[]> {
  const supabase = await getSupabaseClient();

  let query = supabase
    .from("applicants")
    .select("sex, applicant_type, district");

  // Filter by Parañaque residents if requested
  if (filterByParanaque) {
    query = query.neq("district", "");
  }

  const { data, error } = await query;

  if (error) throw new Error(error.message);

  // Initialize summary data structure
  const summary: Record<
    string,
    { male: number; female: number; other: number }
  > = {};

  APPLICANT_TYPES.forEach((type) => {
    summary[type] = { male: 0, female: 0, other: 0 };
  });

  const canonicalTypes = APPLICANT_TYPES.reduce<Record<string, string>>(
    (acc, type) => {
      acc[type.toLowerCase()] = type;
      return acc;
    },
    {}
  );

  const applicantTypeAliases: Record<string, string> = {
    pwd: "Person with Disability (PWD)",
    "person with disability (pwd)": "Person with Disability (PWD)",
    indigenous: "Indigenous Person (IP)",
    "indigenous person": "Indigenous Person (IP)",
    "indigenous person (ip)": "Indigenous Person (IP)",
    ofw: "Returning Overseas Filipino Worker (OFW)",
    "returning overseas filipino worker (ofw)":
      "Returning Overseas Filipino Worker (OFW)",
    "solo parent": "Solo Parent/Single Parent",
    "single parent": "Solo Parent/Single Parent",
    "solo parent/single parent": "Solo Parent/Single Parent",
    student: "Student",
    "out of school youth": "Out of School Youth",
    "rehabilitation program graduate": "Rehabilitation Program Graduate",
    "reintegrated individual (former detainee)":
      "Reintegrated Individual (Former Detainee)",
    "senior citizen": "Senior Citizen",
    senior: "Senior Citizen",
    others: "Others",
    other: "Others",
  };

  (data as ApplicantData[]).forEach((applicant) => {
    const sex = (applicant.sex || "").toLowerCase();
    const rawTypes = (applicant.applicant_type || "")
      .split(",")
      .map((type) => type.trim())
      .filter(Boolean);

    const normalizedTypes = rawTypes.length > 0 ? rawTypes : ["Others"];

    normalizedTypes.forEach((type) => {
      const normalized = type.toLowerCase();
      const mapped =
        applicantTypeAliases[normalized] ||
        canonicalTypes[normalized] ||
        (normalized.startsWith("others") ? "Others" : undefined);

      const applicantType = mapped || "Others";

      if (summary[applicantType]) {
        if (sex === "male") summary[applicantType].male++;
        else if (sex === "female") summary[applicantType].female++;
        else summary[applicantType].other++;
      }
    });
  });

  // Convert to array format
  return Object.entries(summary).map(([applicantType, counts]) => ({
    applicantType,
    male: counts.male,
    female: counts.female,
    other: counts.other,
    total: counts.male + counts.female + counts.other,
  }));
}
