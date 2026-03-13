"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { RiskAssessment } from "@/lib/types";
import { trackEvent } from "@/lib/track";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  escalation?: boolean;
  tools_called?: string[];
}

let msgCounter = 0;
function nextMsgId(): string {
  return `msg_${Date.now()}_${++msgCounter}`;
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
  const [restoredFromCache, setRestoredFromCache] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [sttSupported, setSttSupported] = useState(false);
  const [ttsPlaying, setTtsPlaying] = useState<number | null>(null);
  const [lastFailedMessage, setLastFailedMessage] = useState<string | null>(null);
  const [voiceTranscript, setVoiceTranscript] = useState<string | null>(null);
  const [language, setLanguage] = useState<"en" | "hi">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ayurv_chat_lang");
      if (saved === "hi" || saved === "en") return saved;
    }
    return "en";
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<ReturnType<typeof createRecognition> | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // check STT support
  useEffect(() => {
    const hasStt = !!(
      (window as unknown as Record<string, unknown>).SpeechRecognition ||
      (window as unknown as Record<string, unknown>).webkitSpeechRecognition
    );
    setSttSupported(hasStt);
  }, []);

  // ─── Save chat history to localStorage on message changes ───
  useEffect(() => {
    if (!sessionId || messages.length === 0 || !initDone) return;
    // sirf completed messages save karo (non-empty content wale)
    const toSave = messages.filter(m => m.content.trim());
    if (toSave.length > 0) {
      try {
        localStorage.setItem(`ayurv_chat_${sessionId}`, JSON.stringify(toSave));
        localStorage.setItem("ayurv_chat_session_id", sessionId);
      } catch { /* localStorage full — ignore */ }
    }
  }, [messages, sessionId, initDone]);

  // ─── Init: load assessment and restore/init chat ───
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

        // try restoring cached chat for this session
        const cached = localStorage.getItem(`ayurv_chat_${parsed.session_id}`);
        if (cached) {
          try {
            const cachedMessages = (JSON.parse(cached) as Message[]).map(m => ({
              ...m,
              id: m.id || nextMsgId(), // backward compat — old cache entries may lack id
            }));
            if (cachedMessages.length > 0) {
              setMessages(cachedMessages);
              setInitDone(true);
              setRestoredFromCache(true);
              trackEvent("chat_restored", { messages_count: cachedMessages.length });
              return;
            }
          } catch { /* corrupt cache — ignore, fresh init */ }
        }

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
    setMessages([{ id: nextMsgId(), role: "assistant", content: "" }]);

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
          language,
        }),
      });

      if (!res.ok) throw new Error("Failed to load recommendations");
      await processStream(res, 0);
      setInitDone(true);
    } catch (err) {
      setMessages([{
        id: nextMsgId(),
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

    const userMsg: Message = { id: nextMsgId(), role: "user", content: text.trim() };
    trackEvent("chat_message_sent", { message_number: currentHistory.filter(m => m.role === "user").length + 1 });
    const updatedMessages = [...currentHistory, userMsg];
    const assistantIdx = updatedMessages.length;
    setMessages([...updatedMessages, { id: nextMsgId(), role: "assistant", content: "" }]);
    setInput("");
    setSending(true);
    setLastFailedMessage(null);

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
          voice_mode: voiceMode,
          language,
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
          speakText(fullText, assistantIdx);
        }
      } else {
        // JSON response (escalation, unknown herb, etc.)
        const data = await res.json();
        setMessages(prev => {
          const updated = [...prev];
          updated[assistantIdx] = {
            ...updated[assistantIdx],
            content: data.response,
            escalation: data.escalation,
          };
          return updated;
        });
        if (data.escalation) setEscalated(true);
      }
    } catch (err) {
      const failedText = text;
      setMessages(prev => {
        const updated = [...prev];
        updated[assistantIdx] = {
          ...updated[assistantIdx],
          content: `I wasn't able to provide a reliable answer to that question. This may involve clinical nuances that require a healthcare professional's judgment. Please discuss with your doctor or Ayurvedic practitioner for personalized guidance.`,
        };
        return updated;
      });
      // stash failed message so retry button can resend
      setLastFailedMessage(failedText);
    } finally {
      setSending(false);
    }
  }, [sessionId, messages, sending, voiceMode, language]);

  // ─── TTS: speak response ───
  async function speakText(text: string, msgIdx?: number) {
    try {
      setSpeaking(true);
      if (msgIdx !== undefined) setTtsPlaying(msgIdx);

      const res = await fetch("/api/voice/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        browserSpeak(text);
        return;
      }

      const audioBlob = await res.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onended = () => {
        setSpeaking(false);
        setTtsPlaying(null);
        URL.revokeObjectURL(audioUrl);
        if (voiceMode) startListening();
      };
      audio.onerror = () => {
        setSpeaking(false);
        setTtsPlaying(null);
        browserSpeak(text);
      };
      await audio.play();
    } catch {
      setSpeaking(false);
      setTtsPlaying(null);
      browserSpeak(text);
    }
  }

  // fallback browser TTS
  function browserSpeak(text: string) {
    if (!window.speechSynthesis) { setSpeaking(false); return; }
    const clean = text.replace(/\*\*/g, "").replace(/[•\-]/g, "");
    const utterance = new SpeechSynthesisUtterance(clean);
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice = voices.find(v => v.lang.startsWith("hi"));
    if (hindiVoice) utterance.voice = hindiVoice;
    utterance.onend = () => {
      setSpeaking(false);
      setTtsPlaying(null);
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
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";

    return recognition;
  }

  function startListening() {
    if (sending || speaking) return;

    const recognition = createRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    setListening(true);

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[e.results.length - 1][0].transcript;
      if (transcript.trim()) {
        // show confirmation toast before sending — user can edit
        setVoiceTranscript(transcript.trim());
      }
      setListening(false);
    };

    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    setListening(false);
  }

  function toggleVoiceMode() {
    if (voiceMode) {
      stopListening();
      stopSpeaking();
    }
    trackEvent("voice_mode_toggled", { enabled: !voiceMode });
    setVoiceMode(!voiceMode);
  }

  function stopSpeaking() {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    window.speechSynthesis?.cancel();
    setSpeaking(false);
    setTtsPlaying(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  // suggestion chips — initial + contextual follow-ups
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

  // contextual follow-ups — based on last assistant message
  function getFollowUpChips(): string[] {
    if (!assessment) return [];
    const lastAssistant = [...messages].reverse().find(m => m.role === "assistant");
    if (!lastAssistant?.content) return [];
    const content = lastAssistant.content.toLowerCase();
    const chips: string[] = [];

    // detect herb mentions and suggest follow-ups
    const allHerbs = [
      ...assessment.recommended_herbs.map(h => h.herb_name),
      ...assessment.caution_herbs.map(h => h.herb_name),
    ];
    const mentionedHerb = allHerbs.find(name => content.includes(name.toLowerCase()));

    if (mentionedHerb) {
      chips.push(`What's the best form to take ${mentionedHerb}?`);
      chips.push(`Any side effects of ${mentionedHerb}?`);
    }

    // topic-based suggestions
    if (content.includes("dosage") || content.includes("dose")) {
      chips.push("How long before I see results?");
      chips.push("Should I take it with food?");
    } else if (content.includes("interact") || content.includes("medication")) {
      chips.push("Are there safer alternatives?");
      chips.push("What should I tell my doctor?");
    } else if (content.includes("safe") || content.includes("recommend")) {
      chips.push("What dosage should I start with?");
      chips.push("Can I combine these herbs?");
    }

    // avoid duplicating the initial chips
    return chips.slice(0, 3);
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
    <div className="max-w-3xl mx-auto flex flex-col -mb-8" style={{ height: "calc(100dvh - 90px)" }}>
      {/* header — compact */}
      <div className="shrink-0 bg-white rounded-xl px-4 py-3 shadow-sm border border-gray-100 mb-3">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h1 className="text-base font-bold text-ayurv-primary truncate">Ayurv Consultant</h1>
            {summary && (
              <p className="text-[11px] text-ayurv-muted truncate">
                {summary.concern} — {summary.recommended} safe
                {summary.caution > 0 && `, ${summary.caution} caution`}
                {summary.avoid > 0 && `, ${summary.avoid} avoid`}
              </p>
            )}
          </div>
          <div className="flex gap-1.5 items-center shrink-0">
            {/* language toggle */}
            <button
              onClick={() => {
                const next = language === "en" ? "hi" : "en";
                setLanguage(next);
                try { localStorage.setItem("ayurv_chat_lang", next); } catch { /* ignore */ }
                trackEvent("language_changed", { to: next });
              }}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${
                language === "hi"
                  ? "bg-orange-50 text-orange-600 border-orange-200"
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}
              title={language === "en" ? "Switch to Hinglish" : "Switch to English"}
            >
              {language === "en" ? "EN" : "HI"}
            </button>
            {sttSupported && (
              <button
                onClick={toggleVoiceMode}
                className={`p-2 rounded-lg transition-all ${
                  voiceMode
                    ? "bg-ayurv-primary text-white shadow-md"
                    : "text-gray-400 hover:text-ayurv-primary hover:bg-ayurv-primary/5"
                }`}
                title={voiceMode ? "Voice mode ON" : "Voice mode OFF"}
              >
                <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            <button
              onClick={() => router.push("/results")}
              className="p-2 text-gray-400 hover:text-ayurv-primary hover:bg-ayurv-primary/5 rounded-lg transition-colors"
              title="Full Report"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (window.confirm("Start a new assessment?")) {
                  // purana chat history bhi hata do
                  if (sessionId) localStorage.removeItem(`ayurv_chat_${sessionId}`);
                  localStorage.removeItem("ayurv_chat_session_id");
                  sessionStorage.removeItem("ayurv_result");
                  router.push("/intake");
                }
              }}
              className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              title="New Assessment"
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-3 min-h-0 px-1" aria-live="polite">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-full bg-ayurv-primary/10 flex items-center justify-center mr-2 shrink-0 mt-1">
                <svg className="w-3.5 h-3.5 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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
                  {/* action buttons — copy + TTS */}
                  {msg.content && !(sending && i === messages.length - 1) && (
                    <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-gray-100">
                      <button
                        onClick={async () => {
                          await navigator.clipboard.writeText(msg.content);
                          // brief visual feedback
                          const btn = document.getElementById(`copy-${i}`);
                          if (btn) { btn.textContent = "Copied!"; setTimeout(() => btn.textContent = "Copy", 1500); }
                        }}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium text-gray-400 hover:text-ayurv-primary hover:bg-ayurv-primary/5 transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                        <span id={`copy-${i}`}>Copy</span>
                      </button>
                      <button
                        onClick={() => speaking && ttsPlaying === i ? stopSpeaking() : speakText(msg.content, i)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all ${
                          ttsPlaying === i
                            ? "bg-ayurv-primary/10 text-ayurv-primary"
                            : "text-gray-400 hover:text-ayurv-primary hover:bg-ayurv-primary/5"
                        }`}
                      >
                        {ttsPlaying === i ? (
                          <>
                            <svg className="w-3.5 h-3.5 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                            </svg>
                            Stop
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                            </svg>
                            Listen
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p>{msg.content}</p>
              )}
            </div>
          </div>
        ))}

        {/* retry button — shows when last message failed */}
        {lastFailedMessage && !sending && (
          <div className="flex justify-center py-2 animate-fade-in">
            <button
              onClick={() => {
                // remove the failed assistant message, then retry
                setMessages(prev => prev.slice(0, -1));
                setLastFailedMessage(null);
                sendMessage(lastFailedMessage);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-risk-red bg-red-50 border border-red-200 rounded-full hover:bg-red-100 transition-colors"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
              </svg>
              Retry message
            </button>
          </div>
        )}

        {/* restored from cache indicator */}
        {restoredFromCache && messages.length > 0 && (
          <div className="text-center py-1 animate-fade-in">
            <span className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Previous conversation restored
            </span>
          </div>
        )}

        {/* suggestion chips — initial (before user sends first message) */}
        {!sending && initDone && messages.filter(m => m.role === "user").length === 0 && (
          <div className="flex flex-wrap gap-2 px-1 animate-fade-in">
            {getSuggestionChips().map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="px-3 py-2 text-xs font-medium bg-ayurv-primary/5 text-ayurv-primary border border-ayurv-primary/15 rounded-full hover:bg-ayurv-primary/10 hover:border-ayurv-primary/25 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* follow-up chips — after conversation has started */}
        {!sending && initDone && messages.filter(m => m.role === "user").length > 0 && !lastFailedMessage && (
          <div className="flex flex-wrap gap-2 px-1 animate-fade-in">
            {getFollowUpChips().map((chip) => (
              <button
                key={chip}
                onClick={() => sendMessage(chip)}
                className="px-3 py-2 text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200 rounded-full hover:bg-ayurv-primary/5 hover:text-ayurv-primary hover:border-ayurv-primary/15 transition-all"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* typing indicator */}
        {sending && messages.length > 0 && !messages[messages.length - 1]?.content && (
          <div className="flex justify-start animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-ayurv-primary/10 flex items-center justify-center mr-2 shrink-0 mt-1">
              <svg className="w-3.5 h-3.5 text-ayurv-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
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

      {/* voice transcript confirmation — shows transcribed text before sending */}
      {voiceTranscript && (
        <div className="shrink-0 animate-fade-in">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mx-1">
            <p className="text-xs text-blue-600 font-medium mb-1.5">You said:</p>
            <p className="text-sm text-gray-800 mb-2.5">&ldquo;{voiceTranscript}&rdquo;</p>
            <div className="flex gap-2">
              <button
                onClick={() => { sendMessage(voiceTranscript); setVoiceTranscript(null); }}
                className="flex-1 px-3 py-2 text-xs font-semibold bg-ayurv-primary text-white rounded-lg hover:bg-ayurv-secondary transition-colors"
              >
                Send
              </button>
              <button
                onClick={() => { setInput(voiceTranscript); setVoiceTranscript(null); inputRef.current?.focus(); }}
                className="flex-1 px-3 py-2 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => setVoiceTranscript(null)}
                className="px-3 py-2 text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* voice mode — full-screen mic UI */}
      {voiceMode && initDone && !escalated && (
        <div className="shrink-0 py-3">
          <div className="flex flex-col items-center gap-2">
            {speaking ? (
              <button
                onClick={stopSpeaking}
                className="w-14 h-14 rounded-full bg-ayurv-primary text-white flex items-center justify-center shadow-lg animate-pulse"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" />
                </svg>
              </button>
            ) : listening ? (
              <button
                onClick={stopListening}
                className="w-14 h-14 rounded-full bg-risk-red text-white flex items-center justify-center shadow-lg shadow-risk-red/30"
              >
                <div className="relative">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-risk-red rounded-full animate-ping" />
                </div>
              </button>
            ) : (
              <button
                onClick={startListening}
                disabled={sending}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  sending
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-ayurv-primary text-white hover:bg-ayurv-secondary hover:shadow-xl"
                }`}
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </button>
            )}
            <p className="text-[11px] text-gray-400">
              {speaking ? "Speaking... tap to stop" : listening ? "Listening..." : sending ? "Thinking..." : "Tap to speak"}
            </p>
          </div>
        </div>
      )}

      {/* input area */}
      <div className="shrink-0 pt-1 pb-1">
        {escalated ? (
          <div className="bg-risk-red-light border border-risk-red/20 rounded-xl p-3 text-center text-sm text-gray-700 shadow-sm">
            Chat paused — medical safety concern. Please consult a doctor.
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-end gap-2">
              <div className="flex-1 flex items-end bg-white border border-gray-200 rounded-xl shadow-sm focus-within:shadow-md focus-within:border-ayurv-accent/30 transition-all">
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
                  placeholder={initDone ? "Ask about herbs, dosage, safety..." : "Loading..."}
                  rows={1}
                  className="flex-1 bg-transparent border-none px-4 py-3 text-sm focus:outline-none focus:ring-0 disabled:opacity-50 placeholder:text-gray-400 resize-none max-h-28"
                  style={{ height: "auto", minHeight: "44px" }}
                  onInput={(e) => {
                    const target = e.target as HTMLTextAreaElement;
                    target.style.height = "auto";
                    target.style.height = Math.min(target.scrollHeight, 112) + "px";
                  }}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || sending || !initDone}
                  className={`mr-1.5 mb-1.5 p-2 rounded-lg transition-all shrink-0 ${
                    input.trim() && !sending && initDone
                      ? "bg-ayurv-primary text-white shadow-sm hover:bg-ayurv-secondary"
                      : "bg-gray-100 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              </div>
              {/* mic button — always visible if STT supported, quick voice input */}
              {sttSupported && !voiceMode && (
                <button
                  type="button"
                  onClick={listening ? stopListening : startListening}
                  disabled={sending || !initDone}
                  className={`p-3 rounded-xl transition-all shrink-0 ${
                    listening
                      ? "bg-risk-red text-white shadow-md shadow-risk-red/20 animate-pulse"
                      : "bg-white border border-gray-200 text-gray-500 hover:text-ayurv-primary hover:border-ayurv-primary/30 shadow-sm"
                  }`}
                  title={listening ? "Stop listening" : "Voice input"}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>
              )}
            </div>
          </form>
        )}
        <p className="text-[10px] text-gray-400 text-center mt-1.5">
          Not medical advice. Consult a healthcare professional.
        </p>
      </div>
    </div>
  );
}
