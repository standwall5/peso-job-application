"use client";

import { useState } from "react";
import "@/app/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import AdminChatPanel from "@/components/chat/AdminChatPanel";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatPanelOpen, setIsChatPanelOpen] = useState(false);

  return (
    <div className="admin-layout">
      <Sidebar onOpenChat={() => setIsChatPanelOpen(true)} />
      <div className="main-content">
        <Header />
        <main className="admin-content">{children}</main>
      </div>

      {/* Admin Chat Management Panel */}
      <AdminChatPanel
        isOpen={isChatPanelOpen}
        onClose={() => setIsChatPanelOpen(false)}
      />
    </div>
  );
}
