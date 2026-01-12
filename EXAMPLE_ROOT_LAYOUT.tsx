// EXAMPLE: src/app/layout.tsx
// Shows how to integrate SessionProvider into your root layout

import type { Metadata } from "next";
import SessionProvider from "@/components/providers/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "PESO Job Application System",
  description: "Public Employment Service Office - Job Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Wrap everything in SessionProvider for client-side session access */}
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}

// ============================================
// ALTERNATIVE: If you have existing providers
// ============================================

/*
import SessionProvider from "@/components/providers/SessionProvider";
import { YourOtherProvider } from "./providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <YourOtherProvider>
            {children}
          </YourOtherProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
*/
