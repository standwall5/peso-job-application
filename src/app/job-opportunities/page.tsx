"use client";
import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import PublicCompanyList from "./components/PublicCompanyList";
import PrivateCompanyList from "./components/PrivateCompanyList";

const Companies = () => {
  const [user, setUser] = useState<User | null>(null);
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
    return <PublicCompanyList />;
  } else {
    // Show logged-in view
    return <PrivateCompanyList />;
  }
};

export default Companies;
