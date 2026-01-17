"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle } from "lucide-react";
import { joinWaitlist } from "@/actions/waitlist-actions";
import confetti from "canvas-confetti";

export function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    startTransition(async () => {
      try {
        const result = await joinWaitlist({ email });
        if (result.success) {
          setMessage(result.message || "You're on the waitlist!");
          setIsSuccess(true);
          setEmail("");

          // Trigger confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        } else {
          setError(result.message || "Something went wrong");
        }
      } catch {
        setError("Something went wrong");
      }
    });
  };

  if (isSuccess) {
    return (
      <div className="grid gap-4 text-center">
        <div className="flex items-center justify-center mb-4">
          <CheckCircle className="size-16 text-green-500" />
        </div>
        <h3 className="text-xl font-medium">You&apos;re on the waitlist!</h3>
        <p className="text-muted-foreground">
          Thanks for joining! We&apos;ll keep you updated on our progress and
          notify you when OpenCopilotMoney is ready.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
          <Button
            onClick={() =>
              window.open("https://twitter.com/kshitijzutshi", "_blank")
            }
            variant="outline"
            className="w-full"
          >
            Follow on X
          </Button>
          <Button
            onClick={() => window.open("https://discord.gg/TK7k6uY4", "_blank")}
            variant="outline"
            className="w-full"
          >
            Join Discord
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      {error && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      {message && (
        <div className="p-3 text-sm text-green-500 bg-green-50 border border-green-200 rounded-md">
          {message}
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="waitlist-email">Email</Label>
        <Input
          id="waitlist-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          "Join Waitlist"
        )}
      </Button>
    </form>
  );
}
