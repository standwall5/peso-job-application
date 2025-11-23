"use client";

import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminChatWidget from "@/components/chat/AdminChatWidget";

export default function AdminLayout({
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

      {/* Floating Admin Chat Widget */}
      <AdminChatWidget />
    </div>
  );
}
