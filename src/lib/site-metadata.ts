// Server-safe site metadata - no client-side code allowed here
// This is used by construct-metadata.ts which runs on the server
// and by page components that need basic site info

export const siteMetadata = {
  name: "OpenCopilotMoney",
  description:
    "AI-powered personal finance app that turns raw transactions into real-time spending insights, predictive budgets & holistic financial health scores.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  keywords: [
    "AI Personal Finance App",
    "Budgeting Tool",
    "Spending Tracker",
    "Predictive Budgeting",
    "Financial Health Score",
    "Money Management App",
    "Family Budgeting App",
    "Expense Insights",
  ],
  links: {
    email: "support@opencopilotmoney.tech",
    twitter: "https://tx.com/kshitijzutshi",
    discord: "https://discord.gg/TK7k6uY4",
    github: "https://github.com/kshitijzutshi",
    instagram: "https://instagram.com/kshitijzutshi",
  },
};

export type SiteMetadata = typeof siteMetadata;

