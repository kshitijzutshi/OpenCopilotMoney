import { AboutHeroSection } from "@/components/sections/about-hero-section";
import { WhatIsOpenCopilotMoneySection } from "@/components/sections/what-is-opencopilotmoney-section";
import { FounderSection } from "@/components/sections/founder-section";
import { MissionSection } from "@/components/sections/mission-section";
import { CompanyCultureSection } from "@/components/sections/company-culture-section";

export default function AboutPage() {
  return (
    <main className="flex flex-col items-center justify-center divide-y divide-border min-h-screen w-full">
      <AboutHeroSection />
      <WhatIsOpenCopilotMoneySection />
      <FounderSection />
      <MissionSection />
      <CompanyCultureSection />
    </main>
  );
}
