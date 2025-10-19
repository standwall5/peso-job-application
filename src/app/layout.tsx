import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";

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
      <body className={`${poppinsSans.variable} ${bgClass}`}>
        <div className="page-container">
          <div className="overlay">
            <Navbar />
            <main className="content">{children}</main>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  );
}
