// Polyfill localStorage for Node.js 22+ SSR compatibility
import "@/lib/localStorage-polyfill";

import ClientProviders from "@/components/client-providers";
import { constructMetadata } from "@/lib/construct-metadata";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "black",
};

export const metadata: Metadata = constructMetadata({
  title: "OpenCopilotMoney - Makes you save money",
  description:
    "Empower your financial management with AI-driven insights making tracking and optimizing your finances effortless.",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-background`}
      >
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
