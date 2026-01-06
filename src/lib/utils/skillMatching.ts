// Client-side utility functions for skill matching
import { Job } from "../db/services/job.service";

/**
 * Calculate skill match percentage between user skills and job skills
 */
export function calculateSkillMatch(
  userSkills: string[],
  jobSkills: string[],
): number {
  if (!jobSkills || jobSkills.length === 0) return 0;
  if (!userSkills || userSkills.length === 0) return 0;

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());
  const normalizedJobSkills = jobSkills.map((s) => s.toLowerCase().trim());

  const matchingSkills = normalizedJobSkills.filter((skill) =>
    normalizedUserSkills.includes(skill),
  );

  return Math.round((matchingSkills.length / normalizedJobSkills.length) * 100);
}

/**
 * Sort jobs by skill match percentage (highest first)
 */
export function sortJobsBySkillMatch(
  jobs: Job[],
  userSkills: string[],
): (Job & { matchPercentage: number })[] {
  return jobs
    .map((job) => ({
      ...job,
      matchPercentage: calculateSkillMatch(userSkills, job.skills || []),
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}

/**
 * Get matching skills between user and job
 */
export function getMatchingSkills(
  userSkills: string[],
  jobSkills: string[],
): string[] {
  if (!jobSkills || !userSkills) return [];

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());

  return jobSkills.filter((skill) =>
    normalizedUserSkills.includes(skill.toLowerCase().trim()),
  );
}

/**
 * Get missing skills (skills required by job that user doesn't have)
 */
export function getMissingSkills(
  userSkills: string[],
  jobSkills: string[],
): string[] {
  if (!jobSkills) return [];
  if (!userSkills) return jobSkills;

  const normalizedUserSkills = userSkills.map((s) => s.toLowerCase().trim());

  return jobSkills.filter(
    (skill) => !normalizedUserSkills.includes(skill.toLowerCase().trim()),
  );
}
