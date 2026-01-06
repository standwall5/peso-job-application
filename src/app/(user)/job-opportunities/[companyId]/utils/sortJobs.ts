import { JobSortOption } from "../components/sort/SortJobs";

interface Job {
  id: number;
  title: string;
  description: string;
  place_of_assignment: string;
  sex: string;
  education: string;
  eligibility: string;
  posted_date: string | null;
  company?: {
    name: string;
    logo: string | null;
  };
  companies?: {
    name: string;
    logo: string | null;
  };
  exam_id?: number | null;
  company_id?: number;
  manpower_needed?: number;
  deadline?: string | null;
  salary?: string | null;
  status?: string;
}

// Extract numeric salary for comparison
function extractSalary(salaryString: string | null | undefined): number {
  if (!salaryString) return 0;

  // Match numbers in the salary string
  const matches = salaryString.match(/\d+/g);
  if (!matches) return 0;

  // If there's a range, take the average
  if (matches.length >= 2) {
    return (parseInt(matches[0]) + parseInt(matches[1])) / 2;
  }

  return parseInt(matches[0]);
}

export function sortJobs(jobs: Job[], sortOption: JobSortOption): Job[] {
  const jobsWithData = [...jobs];

  switch (sortOption) {
    case "recent":
      return jobsWithData.sort((a, b) => {
        const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
        const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
        return dateB - dateA;
      });

    case "oldest":
      return jobsWithData.sort((a, b) => {
        const dateA = a.posted_date ? new Date(a.posted_date).getTime() : 0;
        const dateB = b.posted_date ? new Date(b.posted_date).getTime() : 0;
        return dateA - dateB;
      });

    case "deadline-soon":
      return jobsWithData.sort((a, b) => {
        const dateA = a.deadline ? new Date(a.deadline).getTime() : Infinity;
        const dateB = b.deadline ? new Date(b.deadline).getTime() : Infinity;
        return dateA - dateB;
      });

    case "most-manpower":
      return jobsWithData.sort(
        (a, b) => (b.manpower_needed || 0) - (a.manpower_needed || 0),
      );

    case "title-asc":
      return jobsWithData.sort((a, b) => a.title.localeCompare(b.title));

    case "title-desc":
      return jobsWithData.sort((a, b) => b.title.localeCompare(a.title));

    case "salary-high":
      return jobsWithData.sort(
        (a, b) => extractSalary(b.salary) - extractSalary(a.salary),
      );

    case "salary-low":
      return jobsWithData.sort(
        (a, b) => extractSalary(a.salary) - extractSalary(b.salary),
      );

    default:
      return jobsWithData;
  }
}
