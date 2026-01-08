"use client";
import React, { useState, useEffect, Suspense } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";

import PublicCompanyList from "./components/PublicCompanyList";
import PrivateCompanyListWithRecommendations from "./components/PrivateCompanyListWithRecommendations";
import BlocksWave from "@/components/BlocksWave";

export const CompaniesContent = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      setLoading(false);
    };

    checkUser();
  }, []);

  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          width: "100%",
        }}
      >
        <BlocksWave />
      </div>
    );
  }

  if (!user) {
    return (
      <PublicCompanyList searchParent={search} onSearchChange={setSearch} />
    );
  }

  return (
    <PrivateCompanyListWithRecommendations
      searchParent={search}
      onSearchChange={setSearch}
    />
  );
};

const Companies = () => {
  return (
    <Suspense
      fallback={
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
          }}
        >
          <BlocksWave />
        </div>
      }
    >
      <CompaniesContent />
    </Suspense>
  );
};

export default Companies;
