// src/app/admin/manage-admin/hooks/useAdminData.ts

import { useState, useEffect } from "react";
import { getAllAdminsAction } from "@/app/admin/actions/admin.actions";
import { AdminWithEmail } from "../types/admin.types";

export const useAdminData = () => {
  const [admins, setAdmins] = useState<AdminWithEmail[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-newest");

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    let filtered = admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase()),
    );

    // Apply sorting
    filtered = sortAdmins(filtered, sortBy);
    setFilteredAdmins(filtered);
  }, [search, admins, sortBy]);

  const sortAdmins = (adminList: AdminWithEmail[], sort: string) => {
    const sorted = [...adminList];

    switch (sort) {
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case "name-desc":
        return sorted.sort((a, b) => b.name.localeCompare(a.name));
      case "date-newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.created_at || 0).getTime() -
            new Date(a.created_at || 0).getTime(),
        );
      case "date-oldest":
        return sorted.sort(
          (a, b) =>
            new Date(a.created_at || 0).getTime() -
            new Date(b.created_at || 0).getTime(),
        );
      case "role":
        return sorted.sort((a, b) => {
          if (a.is_superadmin && !b.is_superadmin) return -1;
          if (!a.is_superadmin && b.is_superadmin) return 1;
          return 0;
        });
      default:
        return sorted;
    }
  };

  const fetchAdmins = async () => {
    try {
      const data = await getAllAdminsAction();
      setAdmins(data);
      setFilteredAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    admins,
    filteredAdmins,
    loading,
    search,
    setSearch,
    fetchAdmins,
    setSortBy,
  };
};
