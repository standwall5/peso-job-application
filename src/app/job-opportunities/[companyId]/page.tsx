"use client";
import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "../JobHome.module.css";
import jobStyle from "./JobsOfCompany.module.css";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import PublicJobList from "./components/PublicJobList";
import PrivateJobList from "./components/PrivateJobList";

const JobsOfCompany = () => {
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
    return <PublicJobList />;
  } else {
    // Show logged-in view
    return <PrivateJobList />;
  }
};

export default JobsOfCompany;
