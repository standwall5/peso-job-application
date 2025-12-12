import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { SpeedInsights } from "@vercel/speed-insights/next";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"], // add weights you need
  variable: "--font-poppins-sans",
});

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });

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
      <body className={`${geist.variable} ${poppins.variable} ${bgClass}`}>
        {children}
      </body>
    </html>
  );
}
