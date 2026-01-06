import { SortOption } from "../components/sort/SortCompany";

interface Job {
  id: number;
  company_id: number;
  manpower_needed: number;
  posted_date: string | null;
}

interface Company {
  id: number;
  name: string;
  logo: string | null;
  description: string;
  industry: string;
  location: string;
}

export function sortCompanies(
  companies: Company[],
  jobs: Job[],
  sortOption: SortOption,
): Company[] {
  const companiesWithData = companies.map((company) => {
    const companyJobs = jobs.filter((job) => job.company_id === company.id);
    const jobCount = companyJobs.length;
    const manpowerCount = companyJobs.reduce(
      (sum, job) => sum + (job.manpower_needed || 0),
      0,
    );

    // Get most recent job post date
    const mostRecentDate =
      companyJobs
        .filter((job) => job.posted_date)
        .map((job) => new Date(job.posted_date!).getTime())
        .sort((a, b) => b - a)[0] || 0;

    return {
      ...company,
      jobCount,
      manpowerCount,
      mostRecentDate,
    };
  });

  switch (sortOption) {
    case "recent":
      return companiesWithData.sort(
        (a, b) => b.mostRecentDate - a.mostRecentDate,
      );

    case "most-jobs":
      return companiesWithData.sort((a, b) => b.jobCount - a.jobCount);

    case "least-jobs":
      return companiesWithData.sort((a, b) => a.jobCount - b.jobCount);

    case "most-manpower":
      return companiesWithData.sort(
        (a, b) => b.manpowerCount - a.manpowerCount,
      );

    case "name-asc":
      return companiesWithData.sort((a, b) => a.name.localeCompare(b.name));

    case "name-desc":
      return companiesWithData.sort((a, b) => b.name.localeCompare(a.name));

    default:
      return companiesWithData;
  }
}
