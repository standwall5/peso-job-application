// src/app/admin/manage-admin/hooks/useAdminData.ts

import { useState, useEffect } from "react";
import { getAllAdminsAction } from "@/app/admin/actions/admin.actions";
import { AdminWithEmail } from "../types/admin.types";

export const useAdminData = () => {
  const [admins, setAdmins] = useState<AdminWithEmail[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchAdmins();
  }, []);

  useEffect(() => {
    const filtered = admins.filter(
      (admin) =>
        admin.name.toLowerCase().includes(search.toLowerCase()) ||
        admin.email.toLowerCase().includes(search.toLowerCase()),
    );
    setFilteredAdmins(filtered);
  }, [search, admins]);

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

  return { admins, filteredAdmins, loading, search, setSearch, fetchAdmins };
};
