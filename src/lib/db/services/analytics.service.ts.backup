// Analytics service
"use server";

import { getSupabaseClient } from "../client";

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

export interface CompanyPerformance {
  company_id: number;
  company_name: string;
  total_jobs: number;
  total_applications: number;
  avg_applications_per_job: number;
}

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
  limit: number = 10,
): Promise<PopularJob[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from("applications").select(
    `
      job_id,
      jobs (
        title,
        companies (name)
      )
    `,
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

export async function getApplicantDemographics(): Promise<ApplicantDemographics> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("applicants")
    .select("sex, applicant_type, age, district");

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

export async function getExamPerformance(): Promise<ExamPerformance[]> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase.from("exam_attempts").select(
    `
      exam_id,
      score,
      exams (
        title
      )
    `,
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
  days: number = 30,
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
