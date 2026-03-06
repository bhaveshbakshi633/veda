"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  escalation?: boolean;
  tools_called?: string[];
}

const SUGGESTION_CHIPS = [
  "Is Ashwagandha safe for me?",
  "What about drug interactions?",
  "Which herbs should I avoid?",
  "Tell me about dosage",
];

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [escalated, setEscalated] = useState(false);
  const [sendingTooLong, setSendingTooLong] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const sendingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load session and send initial greeting
  useEffect(() => {
    const disc = sessionStorage.getItem("ayurv_disclaimer");
    if (!disc) {
      router.replace("/");
      return;
    }

    const result = sessionStorage.getItem("ayurv_result");
    if (!result) {
      router.replace("/intake");
      return;
    }

    try {
      const parsed = JSON.parse(result);
      if (parsed.session_id) {
        setSessionId(parsed.session_id);
        // Auto-send opening message to trigger profile load
        sendMessage("Hello, I'd like to discuss my assessment results.", parsed.session_id, []);
      }
    } catch {
      router.replace("/intake");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(
    text: string,
    sid: string | null = sessionId,
    currentHistory: Message[] = messages
  ) {
    if (!text.trim() || !sid || sending) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...currentHistory, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setSending(true);
    setSendingTooLong(false);
    sendingTimerRef.current = setTimeout(() => setSendingTooLong(true), 15000);

    try {
      // Build history for API (exclude the current message, it's sent separately)
      const history = currentHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sid,
          message: text.trim(),
          history,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Chat request failed");
      }

      const data = await res.json();
      const assistantMsg: Message = {
        role: "assistant",
        content: data.response,
        escalation: data.escalation,
        tools_called: data.tools_called,
      };

      setMessages((prev) => [...prev, assistantMsg]);

      if (data.escalation) {
        setEscalated(true);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
        },
      ]);
    } finally {
      setSending(false);
      setSendingTooLong(false);
      if (sendingTimerRef.current) clearTimeout(sendingTimerRef.current);
      inputRef.current?.focus();
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-ayurv-primary/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-ayurv-primary">
              Ayurv Consultant
            </h1>
            <p className="text-xs text-ayurv-muted">
              Evidence-graded, safety-first guidance
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/results")}
            className="px-3.5 py-2 text-xs font-semibold text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all duration-200 hover:shadow-sm"
          >
            Back to Results
          </button>
          <button
            onClick={() => {
              if (window.confirm("Start a new assessment? Your current results will be cleared.")) {
                sessionStorage.removeItem("ayurv_result");
                router.push("/intake");
              }
            }}
            className="px-3.5 py-2 text-xs text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0 px-1" aria-live="polite" aria-relevant="additions">
        {messages
          .filter((m) => !(m.role === "user" && m.content.startsWith("Hello, I'd like")))
          .map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {/* assistant avatar */}
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-ayurv-primary/10 flex items-center justify-center mr-2.5 shrink-0 mt-1">
                <svg className="w-4 h-4 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-ayurv-primary text-white rounded-br-md shadow-md shadow-ayurv-primary/10"
                  : msg.escalation
                    ? "bg-risk-red-light border-2 border-risk-red text-gray-900 rounded-bl-md shadow-sm"
                    : "bg-white border border-gray-200/80 text-gray-800 rounded-bl-md shadow-sm"
              }`}
            >
              {msg.role === "assistant" ? (
                <div className="space-y-2">
                  {msg.content.split("\n").map((line, j) => {
                    if (!line.trim()) return <div key={j} className="h-2" />;
                    // Bullet point
                    const isBullet = line.trim().startsWith("- ");
                    const text = isBullet ? line.replace(/^-\s*/, "").trim() : line;
                    // Safe bold rendering — split on **text** and render as spans
                    const parts = text.split(/\*\*(.+?)\*\*/g);
                    const rendered = parts.map((part, k) =>
                      k % 2 === 1 ? (
                        <strong key={k}>{part}</strong>
                      ) : (
                        <span key={k}>{part}</span>
                      )
                    );
                    if (isBullet) {
                      return (
                        <div
                          key={j}
                          className="pl-4 relative before:content-[''] before:absolute before:left-1 before:top-[9px] before:w-1.5 before:h-1.5 before:bg-ayurv-accent before:rounded-full"
                        >
                          {rendered}
                        </div>
                      );
                    }
                    return <p key={j}>{rendered}</p>;
                  })}
                  {/* tool badges hidden — internal implementation detail */}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* Suggestion chips — shown when no user messages yet */}
        {!sending && messages.filter((m) => m.role === "user" && !m.content.startsWith("Hello, I'd like")).length === 0 && messages.length > 0 && (
          <div className="flex flex-wrap gap-2 px-1 animate-fade-in">
            {SUGGESTION_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="px-3.5 py-2 text-xs font-medium bg-ayurv-primary/5 text-ayurv-primary border border-ayurv-primary/15 rounded-full hover:bg-ayurv-primary/10 hover:border-ayurv-primary/25 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Typing indicator */}
        {sending && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-ayurv-primary/10 flex items-center justify-center mr-2.5 shrink-0 mt-1">
              <svg className="w-4 h-4 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div className="bg-white border border-gray-200/80 rounded-2xl rounded-bl-md px-5 py-3.5 shadow-sm">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-ayurv-accent/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-ayurv-accent/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-ayurv-accent/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
              {sendingTooLong && (
                <p className="text-[10px] text-gray-400 mt-1.5">Still thinking...</p>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-4">
        {escalated ? (
          <div className="bg-risk-red-light border border-risk-red/20 rounded-2xl p-4 text-center text-sm text-gray-700 shadow-sm">
            <svg className="w-5 h-5 text-risk-red mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Chat is paused due to a medical safety concern. Please seek medical
            evaluation first.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex items-end bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200 focus-within:shadow-md focus-within:border-ayurv-accent/30">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
                disabled={sending}
                placeholder="Ask about herbs, safety, dosage..."
                rows={1}
                className="flex-1 bg-transparent border-none px-5 py-3.5 text-sm focus:outline-none focus:ring-0 disabled:opacity-50 placeholder:text-gray-400 resize-none max-h-32"
                style={{ height: "auto", minHeight: "48px" }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = "auto";
                  target.style.height = Math.min(target.scrollHeight, 128) + "px";
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || sending}
                className={`mr-2 mb-2 p-2.5 rounded-xl transition-all duration-200 shrink-0 ${
                  input.trim() && !sending
                    ? "bg-ayurv-primary text-white shadow-sm hover:bg-ayurv-secondary hover:shadow-md"
                    : "bg-gray-100 text-gray-300 cursor-not-allowed"
                }`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </div>
          </form>
        )}
        <p className="text-[10px] text-gray-400 text-center mt-2.5">
          Educational information only. Not medical advice. Consult a healthcare
          professional.
        </p>
      </div>
    </div>
  );
}
