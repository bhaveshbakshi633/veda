"use client";

import { useState } from "react";
import { trackEvent } from "@/lib/track";

interface EmailCaptureProps {
  source: string;
  concern?: string;
  compact?: boolean;
}

export default function EmailCapture({ source, concern, compact }: EmailCaptureProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || status === "sending") return;

    setStatus("sending");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source, concern }),
      });

      if (res.ok) {
        setStatus("done");
        trackEvent("email_captured" as never, { source });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className={`flex items-center gap-2 ${compact ? "py-2" : "bg-risk-green-light border border-risk-green/20 rounded-xl p-4"}`}>
        <svg className="w-5 h-5 text-risk-green shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm text-gray-700 font-medium">You&apos;re on the list! We&apos;ll notify you about new herbs and features.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={compact ? "" : "bg-white border border-gray-200 rounded-xl p-4 shadow-sm"}>
      {!compact && (
        <div className="mb-3">
          <h3 className="text-sm font-bold text-gray-900">Get notified about new herbs</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            We&apos;re adding more herbs and safety data regularly. No spam, ever.
          </p>
        </div>
      )}
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-ayurv-primary/20 focus:border-ayurv-primary/40"
        />
        <button
          type="submit"
          disabled={status === "sending" || !email.trim()}
          className="px-4 py-2 text-sm font-semibold bg-ayurv-primary text-white rounded-lg hover:bg-ayurv-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          {status === "sending" ? "..." : "Notify Me"}
        </button>
      </div>
      {status === "error" && (
        <p className="text-xs text-risk-red mt-1.5">Something went wrong. Try again.</p>
      )}
    </form>
  );
}
