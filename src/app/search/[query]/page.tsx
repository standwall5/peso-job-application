"use client";

import Search from "./components/PublicSearch";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import PublicSearch from "./components/PublicSearch";
import PrivateSearch from "./components/PrivateSearch";
import { useParams } from "next/navigation";

const Query = () => {
  const [user, setUser] = useState<User | null>(null);
  const params = useParams();
  const query = Array.isArray(params.query)
    ? params.query[0]
    : params.query || "";
  const [search, setSearch] = useState(query);
  const supabase = createClient();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  // Placeholder components - replace with your actual components

  // In your job/company page
  if (!user) {
    // Show public view
    return <PublicSearch search={search} onSearchChange={setSearch} />;
  } else {
    // Show logged-in view
    return <PrivateSearch search={search} onSearchChange={setSearch} />;
  }
};

export default Query;
