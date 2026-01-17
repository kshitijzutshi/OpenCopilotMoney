import { constructMetadata } from "@/lib/construct-metadata";

export const metadata = constructMetadata({
  title: "Help Center - OpenCopilotMoney",
  description: "Find answers to common questions and learn how to get the most out of OpenCopilotMoney.",
});

export default function HelpLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}