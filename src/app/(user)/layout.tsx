"use client";

import { useState } from "react";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatButton from "@/components/chat/ChatButton";
import ChatWidget from "@/components/chat/ChatWidget";
import LanguageSelector from "@/components/LanguageSelector";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "bootstrap/dist/css/bootstrap.min.css";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <LanguageProvider>
      <Navbar />

      <div className="page-container">
        <div className="overlay">
          <main className="content">{children}</main>
          <Footer />
        </div>

        {/* Chat System - Available on all applicant pages */}
        <ChatButton onClick={() => setIsChatOpen(true)} />
        <ChatWidget isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />

        {/* Language Selector - Below chat widget */}
        <LanguageSelector />
      </div>
    </LanguageProvider>
  );
}
