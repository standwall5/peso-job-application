"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useSearchParams } from "next/navigation";
import PublicCompanyList from "./components/PublicCompanyList";
import PrivateCompanyListWithRecommendations from "./components/PrivateCompanyListWithRecommendations";

const Companies = () => {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<User | null>(null);
  const [search, setSearch] = useState("");
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Get search query from URL parameters
  useEffect(() => {
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setSearch(searchQuery);
    }
  }, [searchParams]);

  if (!user) {
    return (
      <PublicCompanyList searchParent={search} onSearchChange={setSearch} />
    );
  } else {
    return (
      <PrivateCompanyListWithRecommendations
        searchParent={search}
        onSearchChange={setSearch}
      />
    );
  }
};

export default Companies;
