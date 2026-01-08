import { SortOption } from "../components/sort/SortCompany";

interface Job {
  id: number;
  company_id: number;
  manpower_needed?: number;
  posted_date: string | null;
  place_of_assignment?: string;
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
  userPreferredLocation?: string | null,
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

    // Calculate location match count
    const locationMatchCount = userPreferredLocation
      ? companyJobs.filter((job) => {
          const jobLocation = job.place_of_assignment?.toLowerCase() || "";
          const preferredLocation = userPreferredLocation.toLowerCase();
          return (
            jobLocation.includes(preferredLocation) ||
            preferredLocation.includes(jobLocation)
          );
        }).length
      : 0;

    return {
      ...company,
      jobCount,
      manpowerCount,
      mostRecentDate,
      locationMatchCount,
    };
  });

  switch (sortOption) {
    case "recent":
      // Sort by location match first, then by most recent date
      return companiesWithData.sort((a, b) => {
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        return b.mostRecentDate - a.mostRecentDate;
      });

    case "most-jobs":
      // Sort by location match first, then by job count
      return companiesWithData.sort((a, b) => {
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        return b.jobCount - a.jobCount;
      });

    case "least-jobs":
      // Sort by location match first, then by job count (ascending)
      return companiesWithData.sort((a, b) => {
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        return a.jobCount - b.jobCount;
      });

    case "most-manpower":
      // Sort by location match first, then by manpower count
      return companiesWithData.sort((a, b) => {
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        return b.manpowerCount - a.manpowerCount;
      });

    case "name-asc":
      // Sort by location match first, then by name (ascending)
      return companiesWithData.sort((a, b) => {
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        return a.name.localeCompare(b.name);
      });

    case "name-desc":
      // Sort by location match first, then by name (descending)
      return companiesWithData.sort((a, b) => {
        if (userPreferredLocation) {
          const locationDiff = b.locationMatchCount - a.locationMatchCount;
          if (locationDiff !== 0) return locationDiff;
        }
        return b.name.localeCompare(a.name);
      });

    default:
      return companiesWithData;
  }
}
