"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { CommandMenu } from "@/components/dialog/command-menu";
import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // During SSR and initial hydration, render children without ThemeProvider
  // to avoid localStorage access issues with Node.js v22+
  if (!mounted) {
    return (
      <div className="dark">
        {children}
      </div>
    );
  }

  // After mount, render the full provider tree
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster />
      <CommandMenu />
    </ThemeProvider>
  );
}
