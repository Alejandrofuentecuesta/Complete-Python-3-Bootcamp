import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Calorie Voice Tracker MVP",
  description: "Low-friction calorie and exercise tracking from ChatGPT voice logs.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Calorie Log",
    statusBarStyle: "default"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
