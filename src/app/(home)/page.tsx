"use client";

import Image from "next/image";
import Link from "next/link";
import Slogan from "/assets/loginSlogan.webp";
import LoginPage from "@/app/(auth)/login/page";
import PrivateHome from "@/app/(home)/PrivateHome";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { useEffect, useState } from "react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>Loading...</div>
    );
  }

  if (!user) {
    return <LoginPage />;
  } else {
    return <PrivateHome />;
  }
}
