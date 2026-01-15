// src/app/admin/manage-admin/hooks/useAdminData.ts

import { useState, useEffect, useCallback } from "react";
import { getAllAdminsAction } from "@/app/admin/actions/admin.actions";
import { AdminWithEmail } from "../types/admin.types";
import { createClient } from "@/utils/supabase/client";

export const useAdminData = () => {
  const [admins, setAdmins] = useState<AdminWithEmail[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminWithEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("date-newest");
  const [onlineAdminIds, setOnlineAdminIds] = useState<Set<string>>(new Set());

  const fetchAdmins = useCallback(async () => {
    try {
      const data = await getAllAdminsAction();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  // Check online status via Supabase presence
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("admin-presence");

    // Track current user as online
    const trackPresence = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await channel.subscribe(async (status) => {
          if (status === "SUBSCRIBED") {
            await channel.track({
              user_id: user.id,
              online_at: new Date().toISOString(),
            });
          }
        });

        // Listen for presence changes
        channel.on("presence", { event: "sync" }, () => {
          const state = channel.presenceState();
          const onlineIds = new Set<string>();

          Object.values(state).forEach((presences: unknown) => {
            if (Array.isArray(presences)) {
              presences.forEach((presence: { user_id?: string }) => {
                if (presence.user_id) {
                  onlineIds.add(presence.user_id);
                }
              });
            }
          });

          setOnlineAdminIds(onlineIds);
        });
      }
    };

    trackPresence();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  // Update admins with online status
  useEffect(() => {
    const adminsWithOnlineStatus = admins.map((admin) => ({
      ...admin,
      is_online: onlineAdminIds.has(admin.auth_id),
    }));
    setAdmins(adminsWithOnlineStatus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onlineAdminIds]);

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
