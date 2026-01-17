import { WaitlistForm } from "@/components/waitlist-form";

export default function WaitlistPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-[80vh] w-full py-20 px-5">
      <h1 className="text-3xl md:text-4xl font-medium tracking-tight mb-2">
        Join the OpenCopilotMoney Waitlist
      </h1>
      <p className="text-muted-foreground mb-8 text-center max-w-md">
        Be among the first to experience AI-driven financial management that
        makes tracking and optimizing your finances effortless.
      </p>
      <WaitlistForm />
    </main>
  );
}
