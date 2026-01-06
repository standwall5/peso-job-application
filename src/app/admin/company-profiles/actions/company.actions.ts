"use server";

import {
  getCompanies,
  getCompaniesWithStats,
  getCompanyById,
  createCompany,
  updateCompany,
  uploadCompanyLogo,
  archiveCompany,
  restoreCompany,
} from "@/lib/db/services/company.service";

export async function getCompaniesAction() {
  try {
    return await getCompanies();
  } catch (error) {
    console.error("Failed to get companies:", error);
    throw error;
  }
}

export async function getCompaniesWithStatsAction() {
  try {
    return await getCompaniesWithStats();
  } catch (error) {
    console.error("Failed to get companies with stats:", error);
    throw error;
  }
}

export async function getCompanyByIdAction(id: number) {
  try {
    return await getCompanyById(id);
  } catch (error) {
    console.error("Failed to get company:", error);
    throw error;
  }
}

export async function createCompanyAction(companyData: {
  name: string;
  description?: string;
  address?: string;
  contact?: string;
  location?: string;
  industry?: string;
  website?: string;
  contact_email?: string;
}) {
  try {
    return await createCompany(companyData);
  } catch (error) {
    console.error("Failed to create company:", error);
    throw error;
  }
}

export async function updateCompanyAction(
  id: number,
  updates: {
    name?: string;
    description?: string;
    address?: string;
    contact?: string;
    location?: string;
    industry?: string;
    website?: string;
    contact_email?: string;
  },
) {
  try {
    return await updateCompany(id, updates);
  } catch (error) {
    console.error("Failed to update company:", error);
    throw error;
  }
}

export async function uploadCompanyLogoAction(companyId: number, file: File) {
  try {
    return await uploadCompanyLogo(companyId, file);
  } catch (error) {
    console.error("Failed to upload company logo:", error);
    throw error;
  }
}

export async function archiveCompanyAction(id: number) {
  try {
    return await archiveCompany(id);
  } catch (error) {
    console.error("Failed to archive company:", error);
    throw error;
  }
}

export async function restoreCompanyAction(id: number) {
  try {
    return await restoreCompany(id);
  } catch (error) {
    console.error("Failed to restore company:", error);
    throw error;
  }
}
