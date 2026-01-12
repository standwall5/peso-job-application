# 🔧 Zoom Detection Integration Example

## How to Add Zoom Detection to Your App

### Step 1: Update Root Layout

Edit `src/app/layout.tsx` to include the ZoomDetector component:

```typescript
import type { Metadata } from "next";
import { Geist, Poppins } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { createClient } from "@/utils/supabase/server";
import { User } from "@supabase/supabase-js";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ZoomDetector from "@/components/ZoomDetector"; // ← ADD THIS LINE

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "700"],
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
        {/* ↓ ADD THIS LINE - Enables automatic zoom detection */}
        <ZoomDetector debug={process.env.NODE_ENV === 'development'} />
        
        {children}
      </body>
    </html>
  );
}
```

### Step 2: Test It

1. Open your app in the browser
2. Open DevTools console (F12)
3. You should see zoom detection info logged
4. Press `Ctrl + Plus (+)` to zoom in
5. Watch the console update with new zoom level

### Step 3: Verify CSS Classes

1. Open DevTools → Elements tab
2. Inspect the `<body>` element
3. You should see one of these classes:
   - `zoom-normal` (at 100%)
   - `zoom-125` (at 125%)
   - `zoom-150` (at 150%)
   - `zoom-high` (at 175%+)

---

## ✅ That's It!

Your app now automatically:
- Detects browser zoom level
- Applies appropriate CSS classes
- Adjusts UI elements for better readability
- Updates when user changes zoom

---

## 🎯 Next Steps

1. Read `ZOOM_DETECTION_GUIDE.md` for detailed usage
2. Use `TESTING_CHECKLIST.md` to test all features
3. Customize zoom adjustments in `src/styles/zoom-adjustments.css`

---

## 🔍 Quick Test

Open any page and try these keyboard shortcuts:

| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Zoom In | Ctrl + Plus | Cmd + Plus |
| Zoom Out | Ctrl + Minus | Cmd + Minus |
| Reset Zoom | Ctrl + 0 | Cmd + 0 |

The UI should automatically adjust at each zoom level!
