"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  content: string;
  escalation?: boolean;
  tools_called?: string[];
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [escalated, setEscalated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold text-ayurv-primary">
            Ayurv Consultant
          </h1>
          <p className="text-xs text-gray-500">
            Evidence-graded, safety-first Ayurvedic guidance
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/results")}
            className="px-3 py-1.5 text-xs font-medium text-ayurv-primary border border-ayurv-primary rounded-lg hover:bg-ayurv-primary hover:text-white transition-colors"
          >
            View Assessment
          </button>
          <button
            onClick={() => {
              sessionStorage.removeItem("ayurv_result");
              router.push("/intake");
            }}
            className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            New Session
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0">
        {messages
          .filter((m) => !(m.role === "user" && m.content.startsWith("Hello, I'd like")))
          .map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-ayurv-primary text-white rounded-br-md"
                  : msg.escalation
                    ? "bg-risk-red-light border-2 border-risk-red text-gray-900 rounded-bl-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md shadow-sm"
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
                          className="pl-4 relative before:content-['•'] before:absolute before:left-1 before:text-ayurv-accent"
                        >
                          {rendered}
                        </div>
                      );
                    }
                    return <p key={j}>{rendered}</p>;
                  })}
                  {msg.tools_called && msg.tools_called.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-wrap gap-1">
                      {[...new Set(msg.tools_called)].map((tool) => (
                        <span
                          key={tool}
                          className="text-[10px] px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded font-mono"
                        >
                          {tool}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {sending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1.5">
                <span className="w-2 h-2 bg-ayurv-accent rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-2 h-2 bg-ayurv-accent rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-2 h-2 bg-ayurv-accent rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t border-gray-200">
        {escalated ? (
          <div className="bg-risk-red-light border border-risk-red/20 rounded-lg p-3 text-center text-sm text-gray-700">
            Chat is paused due to a medical safety concern. Please seek medical
            evaluation first.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={sending}
              placeholder="Ask about herbs, safety, dosage..."
              className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-ayurv-accent focus:border-transparent disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || sending}
              className="px-5 py-2.5 bg-ayurv-primary text-white rounded-xl text-sm font-medium hover:bg-ayurv-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Send
            </button>
          </form>
        )}
        <p className="text-[10px] text-gray-400 text-center mt-2">
          Educational information only. Not medical advice. Consult a healthcare
          professional.
        </p>
      </div>
    </div>
  );
}
