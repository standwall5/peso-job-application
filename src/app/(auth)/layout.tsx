"use client";

import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "@/app/globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LanguageSelector from "@/components/LanguageSelector";
import AuthRedirect from "@/components/AuthRedirect";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "bootstrap/dist/css/bootstrap.min.css";

const poppinsSans = Poppins({
  variable: "--font-poppins-sans",
  subsets: ["latin"],
  weight: ["400", "700"], // Add the weights you need
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      <AuthRedirect />
      <div className="page-container">
        <div className="overlay">
          <Navbar />
          <main className="content">{children}</main>
          <Footer />
        </div>

        {/* Language Selector */}
        <LanguageSelector />
      </div>
    </LanguageProvider>
  );
}
