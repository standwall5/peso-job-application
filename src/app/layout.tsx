import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"], // add weights you need
  variable: "--font-poppins-sans",
});

export const metadata: Metadata = {
  title: "PESO Careers",
  description: "A job application platform by PESO",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } = { user: null } } = await supabase.auth.getUser();

  const bgClass = user ? "logged-in-bg" : "public-bg";

  return (
    <html lang="en">
      <body className={`${poppins.className} ${bgClass}`}>{children}</body>
    </html>
  );
}
