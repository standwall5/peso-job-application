"use client";

import { useState, useEffect } from "react";
import { AdminProfile } from "@/lib/types";
import { getAdminProfileAction } from "@/app/admin/actions/admin.actions";

export const useSuperAdmin = () => {
  const [adminProfile, setAdminProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminProfile = async () => {
      try {
        const profile = await getAdminProfileAction();
        setAdminProfile(profile);
      } catch (error) {
        console.error("Error fetching admin profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminProfile();
  }, []);

  const isSuperAdmin = adminProfile?.is_superadmin ?? false;

  return {
    adminProfile,
    loading,
    isSuperAdmin,
  };
};
