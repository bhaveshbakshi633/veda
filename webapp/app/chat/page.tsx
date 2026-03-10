"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { RiskAssessment } from "@/lib/types";

interface Message {
  role: "user" | "assistant";
  content: string;
  escalation?: boolean;
  tools_called?: string[];
}

// web speech API types
interface SpeechRecognitionEvent {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

export default function ChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [escalated, setEscalated] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [initDone, setInitDone] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // ─── Init: load assessment and send __INIT__ ───
  useEffect(() => {
    const disc = sessionStorage.getItem("ayurv_disclaimer");
    if (!disc) { router.replace("/"); return; }

    const stored = sessionStorage.getItem("ayurv_result");
    if (!stored) { router.replace("/intake"); return; }

    try {
      const parsed = JSON.parse(stored) as RiskAssessment;
      if (parsed.session_id) {
        setSessionId(parsed.session_id);
        setAssessment(parsed);
        sendInitStreaming(parsed);
      }
    } catch { router.replace("/intake"); }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // refocus input after sending
  useEffect(() => {
    if (!sending && initDone && inputRef.current && !voiceMode) {
      inputRef.current.focus();
    }
  }, [sending, initDone, voiceMode]);

  // ─── Streaming __INIT__ ───
  async function sendInitStreaming(result: RiskAssessment) {
    setSending(true);
    setMessages([{ role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: result.session_id,
          message: "__INIT__",
          history: [],
          assessment_result: result,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error("Failed to load recommendations");
      await processStream(res, 0);
      setInitDone(true);
    } catch (err) {
      setMessages([{
        role: "assistant",
        content: `Something went wrong loading your recommendations. ${err instanceof Error ? err.message : ""} Please try refreshing.`,
      }]);
      setInitDone(true);
    } finally {
      setSending(false);
    }
  }

  // ─── Process SSE stream ───
  async function processStream(res: globalThis.Response, assistantIdx: number) {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let fullText = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.startsWith("data: ")) continue;
        try {
          const data = JSON.parse(event.slice(6));

          if (data.type === "token") {
            fullText += data.content;
            const captured = fullText;
            setMessages(prev => {
              const updated = [...prev];
              updated[assistantIdx] = { ...updated[assistantIdx], content: captured };
              return updated;
            });
          } else if (data.type === "replace") {
            fullText = data.content;
            const captured = fullText;
            setMessages(prev => {
              const updated = [...prev];
              updated[assistantIdx] = { ...updated[assistantIdx], content: captured };
              return updated;
            });
          } else if (data.type === "done") {
            setMessages(prev => {
              const updated = [...prev];
              updated[assistantIdx] = { ...updated[assistantIdx], tools_called: data.tools_called };
              return updated;
            });
          } else if (data.type === "error") {
            throw new Error(data.content);
          }
        } catch (e) {
          if (e instanceof Error && e.message !== "Unexpected end of JSON input") throw e;
        }
      }
    }

    return fullText;
  }

  // ─── Send message (streaming) ───
  const sendMessage = useCallback(async (
    text: string,
    sid: string | null = sessionId,
    currentHistory: Message[] = messages
  ) => {
    if (!text.trim() || !sid || sending) return;

    const userMsg: Message = { role: "user", content: text.trim() };
    const updatedMessages = [...currentHistory, userMsg];
    const assistantIdx = updatedMessages.length;
    setMessages([...updatedMessages, { role: "assistant", content: "" }]);
    setInput("");
    setSending(true);

    try {
      const history = currentHistory.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sid,
          message: text.trim(),
          history,
          stream: true,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Chat request failed");
      }

      // check if response is SSE or JSON (safety responses are JSON)
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/event-stream")) {
        const fullText = await processStream(res, assistantIdx);

        // voice mode: auto-speak response
        if (voiceMode && fullText) {
          speakText(fullText);
        }
      } else {
        // JSON response (escalation, unknown herb, etc.)
        const data = await res.json();
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = {
            role: "assistant",
            content: data.response,
            escalation: data.escalation,
          };
          return updated;
        });
        if (data.escalation) setEscalated(true);
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = {
          role: "assistant",
          content: `Something went wrong: ${err instanceof Error ? err.message : "Unknown error"}. Please try again.`,
        };
        return updated;
      });
    } finally {
      setSending(false);
    }
  }, [sessionId, messages, sending, voiceMode]);

  // ─── TTS: speak response ───
  async function speakText(text: string) {
    try {
      setSpeaking(true);
      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        // fallback to browser TTS
        browserSpeak(text);
        return;
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        // restart listening in voice mode
        if (voiceMode) startListening();
      };
      audio.onerror = () => {
        setSpeaking(false);
        browserSpeak(text);
      };
      await audio.play();
    } catch {
      setSpeaking(false);
      browserSpeak(text);
    }
  }

  // fallback browser TTS
  function browserSpeak(text: string) {
    if (!window.speechSynthesis) return;
    const clean = text.replace(/\*\*/g, "").replace(/[•\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    // try hindi voice
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi"));
    if (hindiVoice) utterance.voice = hindiVoice;
    utterance.onend = () => {
      setSpeaking(false);
      if (voiceMode) startListening();
    };
    window.speechSynthesis.speak(utterance);
  }

  // ─── STT: Web Speech API ───
  function createRecognition() {
    const SpeechRecognition = (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
    if (!SpeechRecognition) return null;

    const recognition = new (SpeechRecognition as new () => {
      continuous: boolean;
      interimResults: boolean;
      lang: string;
      onresult: ((e: SpeechRecognitionEvent) => void) | null;
      onend: (() => void) | null;
      onerror: ((e: { error: string }) => void) | null;
      start: () => void;
      stop: () => void;
      abort: () => void;
    })();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "hi-IN"; // hindi primary, also understands english

    return recognition;
  }

  function startListening() {
    if (sending || speaking) return;

    const recognition = createRecognition();
    if (!recognition) {
      alert("Your browser does not support voice input. Try Chrome or Edge.");
      return;
    }

    recognitionRef.current = recognition;
    setListening(true);

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      if (transcript.trim()) {
        sendMessage(transcript);
      }
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.onerror = (e: { error: string }) => {
      console.error("STT error:", e.error);
      setListening(false);
    };

    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function toggleVoiceMode() {
    if (voiceMode) {
      // turning off
      stopListening();
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      window.speechSynthesis?.cancel();
      setSpeaking(false);
    }
    setVoiceMode(!voiceMode);
  }

  function stopSpeaking() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // suggestion chips
  function getSuggestionChips(): string[] {
    if (!assessment) return [];
    const chips: string[] = [];
    if (assessment.recommended_herbs.length > 0) {
      chips.push(`Tell me more about ${assessment.recommended_herbs[0].herb_name}`);
      if (assessment.recommended_herbs.length > 1) chips.push("Compare my top 2 herbs");
    }
    if (assessment.caution_herbs.length > 0) chips.push("Why are some herbs marked caution?");
    if (assessment.avoid_herbs.length > 0) chips.push("What should I avoid and why?");
    chips.push("What dosage should I start with?");
    return chips.slice(0, 4);
  }

  const summary = assessment
    ? {
        recommended: assessment.recommended_herbs.length,
        caution: assessment.caution_herbs.length,
        avoid: assessment.avoid_herbs.length,
        concern: assessment.concern_label,
      }
    : null;

  return (
    <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-180px)]">
      {/* header */}
      <div className="shrink-0 bg-white rounded-2xl px-5 py-4 shadow-sm border border-gray-100 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-ayurv-primary/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-ayurv-primary">Ayurv Consultant</h1>
              {summary && (
                <p className="text-xs text-ayurv-muted">
                  {summary.concern} — {summary.recommended} recommended
                  {summary.caution > 0 && `, ${summary.caution} caution`}
                  {summary.avoid > 0 && `, ${summary.avoid} avoid`}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2 items-center">
            {/* voice mode toggle */}
            <button
              onClick={toggleVoiceMode}
              className={`p-2 rounded-xl transition-all duration-200 ${
                voiceMode
                  ? "bg-ayurv-primary text-white shadow-md"
                  : "text-gray-400 hover:text-ayurv-primary hover:bg-ayurv-primary/5"
              }`}
              aria-label={voiceMode ? "Disable voice mode" : "Enable voice mode"}
              title={voiceMode ? "Voice mode ON" : "Voice mode OFF"}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
            <button
              onClick={() => router.push("/results")}
              className="px-3.5 py-2 text-xs font-semibold text-ayurv-primary border border-ayurv-primary/20 rounded-xl hover:bg-ayurv-primary hover:text-white transition-all duration-200 hover:shadow-sm"
            >
              Full Report
            </button>
            <button
              onClick={() => {
                if (window.confirm("Start a new assessment?")) {
                  sessionStorage.removeItem("ayurv_result");
                  router.push("/intake");
                }
              }}
              className="px-3.5 py-2 text-xs text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              New
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 min-h-0 px-1" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-ayurv-primary/10 flex items-center justify-center mr-2.5 shrink-0 mt-1">
                <svg className="w-4 h-4 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
            )}
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
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
                    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ") || line.trim().startsWith("* ");
                    const isHeading = line.trim().startsWith("##");
                    const text = isBullet
                      ? line.replace(/^[\s]*[-•*]\s*/, "").trim()
                      : isHeading
                        ? line.replace(/^#+\s*/, "").trim()
                        : line;
                    const parts = text.split(/\*\*(.+?)\*\*/g);
                    const rendered = parts.map((part, k) =>
                      k % 2 === 1 ? <strong key={k}>{part}</strong> : <span key={k}>{part}</span>
                    );
                    if (isHeading) return <p key={j} className="font-semibold text-ayurv-primary mt-2">{rendered}</p>;
                    if (isBullet) {
                      return (
                        <div key={j} className="pl-4 relative before:content-[''] before:absolute before:left-1 before:top-[9px] before:w-1.5 before:h-1.5 before:bg-ayurv-accent before:rounded-full">
                          {rendered}
                        </div>
                      );
                    }
                    return <p key={j}>{rendered}</p>;
                  })}
                  {/* streaming cursor */}
                  {sending && i === messages.length - 1 && msg.content && (
                    <span className="inline-block w-2 h-4 bg-ayurv-primary/40 animate-pulse ml-0.5" />
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* suggestion chips */}
        {!sending && initDone && messages.filter(m => m.role === "user").length === 0 && (
          <div className="flex flex-wrap gap-2 px-1 animate-fade-in">
            {getSuggestionChips().map((chip) => (
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

        {/* typing indicator (only when no content streaming yet) */}
        {sending && messages.length > 0 && !messages[messages.length - 1]?.content && (
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
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* voice mode UI */}
      {voiceMode && initDone && !escalated && (
        <div className="shrink-0 py-4">
          <div className="flex flex-col items-center gap-3">
            {speaking ? (
              <button
                onClick={stopSpeaking}
                className="w-16 h-16 rounded-full bg-ayurv-primary text-white flex items-center justify-center shadow-lg animate-pulse"
                aria-label="Stop speaking"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              </button>
            ) : listening ? (
              <button
                onClick={stopListening}
                className="w-16 h-16 rounded-full bg-risk-red text-white flex items-center justify-center shadow-lg shadow-risk-red/30"
              >
                <div className="relative">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-risk-red rounded-full animate-ping" />
                </div>
              </button>
            ) : (
              <button
                onClick={startListening}
                disabled={sending}
                className={`w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  sending
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-ayurv-primary text-white hover:bg-ayurv-secondary hover:shadow-xl"
                }`}
                aria-label="Start listening"
              >
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            <p className="text-xs text-gray-400">
              {speaking ? "Speaking... tap to stop" : listening ? "Listening... speak now" : sending ? "Thinking..." : "Tap to speak"}
            </p>
          </div>
        </div>
      )}

      {/* text input (always visible, voice mode just adds mic above) */}
      <div className="shrink-0 pt-2">
        {escalated ? (
          <div className="bg-risk-red-light border border-risk-red/20 rounded-2xl p-4 text-center text-sm text-gray-700 shadow-sm">
            <svg className="w-5 h-5 text-risk-red mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 6a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 6zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Chat is paused due to a medical safety concern. Please seek medical evaluation first.
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
                disabled={sending || !initDone}
                placeholder={initDone ? "Ask about herbs, dosage, safety, alternatives..." : "Loading your recommendations..."}
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
                disabled={!input.trim() || sending || !initDone}
                className={`mr-2 mb-2 p-2.5 rounded-xl transition-all duration-200 shrink-0 ${
                  input.trim() && !sending && initDone
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
          Educational information only. Not medical advice. Consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}
