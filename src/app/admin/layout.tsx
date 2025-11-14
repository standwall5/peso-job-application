import type { Metadata } from "next";
import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@/utils/supabase/server";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";

export const metadata: Metadata = {
  title: "PESO Careers",
  description: "A job application platform by PESO",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <main className="admin-content">{children}</main>
      </div>
    </div>
  );
}
