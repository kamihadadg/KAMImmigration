"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BookOpen, Check, Copy, Loader2, Sparkles, Square, Volume2, X } from "lucide-react";
import { sanitizeMarkdownForSpeech } from "@/lib/markdown-for-speech";
import type { Messages } from "@/lib/i18n/messages";
import type { ResumeAssistSection, ResumeAssistTask } from "@/lib/resume-builder/resume-ai";

export type ResumeAiAssistLabels = Messages["aiAssist"];

const persianInText = /[\u0600-\u06FF]/;

function interpolate(template: string, vars: Record<string, string | number>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

export function ResumeAiAssistBubble({
  section,
  getContext,
  labels,
  emptyField,
  creditCost,
  tasks,
  children
}: {
  section: ResumeAssistSection;
  getContext: () => string;
  labels: ResumeAiAssistLabels;
  emptyField: string;
  creditCost: number;
  tasks: Array<{ key: ResumeAssistTask; label: string }>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<ResumeAssistTask>(tasks[0]?.key ?? "polish");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [readingComfort, setReadingComfort] = useState(false);
  const [copied, setCopied] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const copyResetRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getContextRef = useRef(getContext);
  getContextRef.current = getContext;

  const close = useCallback(() => setOpen(false), []);

  const stopSpeech = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  }, []);

  const speakReply = useCallback(() => {
    if (!reply || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const spoken = sanitizeMarkdownForSpeech(reply);
    if (!spoken) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(spoken);
    utterance.lang = persianInText.test(reply) ? "fa-IR" : "en-US";
    utterance.rate = readingComfort ? 0.88 : 0.92;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  }, [reply, readingComfort]);

  const copyReply = useCallback(async () => {
    if (!reply) return;
    try {
      await navigator.clipboard.writeText(reply);
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
      setCopied(true);
      copyResetRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [reply]);

  useEffect(() => {
    if (!open) stopSpeech();
  }, [open, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  useEffect(
    () => () => {
      if (copyResetRef.current) clearTimeout(copyResetRef.current);
    },
    []
  );

  const run = useCallback(async () => {
    const contextText = getContextRef.current().trim();
    if (!contextText) {
      setError(emptyField);
      setReply(null);
      return;
    }
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/ai/resume", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          section,
          task,
          context: contextText
        })
      });
      const data = (await res.json()) as {
        reply?: string;
        error?: string;
        code?: string;
        hint?: string;
      };
      if (!res.ok) {
        if (res.status === 401) setError(labels.errorAuth);
        else if (res.status === 402) setError(labels.errorCredits);
        else if (res.status === 503) setError(labels.errorNoAi);
        else if (res.status === 502 && data.code) {
          switch (data.code) {
            case "INVALID_KEY": {
              const h = (data.hint ?? "").toLowerCase();
              const leaked = h.includes("leaked") || h.includes("exposed");
              setError(
                leaked
                  ? labels.errorApiKeyLeaked
                  : data.hint
                    ? `${labels.errorInvalidKey}\n${data.hint}`
                    : labels.errorInvalidKey
              );
              break;
            }
            case "RATE_LIMIT":
              setError(labels.errorRateLimit);
              break;
            case "TIMEOUT":
              setError(labels.errorTimeout);
              break;
            case "NETWORK":
              setError(labels.errorNetwork);
              break;
            case "UPSTREAM":
              setError(labels.errorUpstream);
              break;
            case "PARSE":
              setError(labels.errorParse);
              break;
            case "BAD_REQUEST":
              setError(data.hint ? `${labels.errorBadRequest}\n${data.hint}` : labels.errorBadRequest);
              break;
            default:
              setError(labels.errorGeneric);
          }
        } else setError(labels.errorGeneric);
        return;
      }
      if (data.reply) setReply(data.reply);
      else setError(labels.errorGeneric);
    } catch {
      setError(labels.errorGeneric);
    } finally {
      setLoading(false);
    }
  }, [emptyField, labels, section, task]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!tasks.length) return <>{children}</>;

  const modal =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <div
        className="fixed inset-0 z-[1000] overflow-y-auto overscroll-contain bg-slate-950/75 backdrop-blur-[2px]"
        role="presentation"
        onClick={close}
      >
        <div className="flex min-h-[100dvh] w-full items-center justify-center p-4 py-12">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="resume-ai-assist-title"
            data-backlit-surface="dark"
            className={`relative w-full rounded-[1.75rem] border border-cyan-400/25 bg-slate-900 ai-backlit-pulse-modal shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_0_48px_-8px_rgba(34,211,238,0.35),0_25px_70px_rgba(0,0,0,0.65)] ring-1 ring-cyan-400/20 ${
              reply && readingComfort ? "max-w-[min(96vw,42rem)]" : "max-w-[440px]"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex flex-col overflow-hidden ${
                reply && readingComfort ? "max-h-[min(88vh,720px)]" : "max-h-[min(82vh,560px)]"
              }`}
            >
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="min-w-0 pr-2">
                  <p id="resume-ai-assist-title" className="text-sm font-black text-white">
                    {labels.modalTitle}
                  </p>
                  <p className="text-[11px] text-slate-400">{interpolate(labels.costHint, { cost: creditCost })}</p>
                </div>
                <button
                  type="button"
                  onClick={close}
                  className="shrink-0 rounded-full bg-white/10 p-2 text-slate-200 hover:bg-white/15"
                  aria-label={labels.close}
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">{labels.pickTask}</p>
                <div className="flex flex-wrap gap-2">
                  {tasks.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setTask(t.key)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                        task === t.key ? "bg-cyan-300 text-slate-950" : "bg-white/10 text-slate-200 hover:bg-white/15"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void run()}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 py-3 font-black text-slate-950 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  {labels.ask}
                </button>

                {error && <p className="mt-3 rounded-xl bg-rose-500/15 p-3 text-sm text-rose-100 whitespace-pre-wrap">{error}</p>}

                {reply && (
                  <div className="mt-4 rounded-2xl border border-cyan-400/20 bg-slate-950 p-4 shadow-[inset_0_0_28px_rgba(34,211,238,0.07)] ring-1 ring-cyan-400/10">
                    <div className="mb-3 flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
                      <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">{labels.resultTitle}</p>
                      <div className="ms-auto flex flex-wrap items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => void copyReply()}
                          className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-100 hover:bg-white/15 sm:text-xs"
                          title={labels.copyAnswer}
                          aria-label={labels.copyAnswer}
                        >
                          {copied ? <Check size={14} className="text-emerald-300" aria-hidden /> : <Copy size={14} aria-hidden />}
                          {copied ? labels.copied : labels.copyAnswer}
                        </button>
                        <button
                          type="button"
                          onClick={() => (speaking ? stopSpeech() : speakReply())}
                          className="inline-flex items-center gap-1 rounded-xl bg-white/10 px-2.5 py-1.5 text-[11px] font-bold text-slate-100 hover:bg-white/15 sm:text-xs"
                          title={speaking ? labels.stopSpeech : labels.readAloud}
                          aria-label={speaking ? labels.stopSpeech : labels.readAloud}
                          aria-pressed={speaking}
                        >
                          {speaking ? <Square size={14} aria-hidden /> : <Volume2 size={14} aria-hidden />}
                          {speaking ? labels.stopSpeech : labels.readAloud}
                        </button>
                        <button
                          type="button"
                          onClick={() => setReadingComfort((v) => !v)}
                          className={`inline-flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-[11px] font-bold sm:text-xs ${
                            readingComfort ? "bg-cyan-300/25 text-cyan-100 ring-1 ring-cyan-300/40" : "bg-white/10 text-slate-100 hover:bg-white/15"
                          }`}
                          title={readingComfort ? labels.readingComfortActive : labels.readingComfort}
                          aria-label={readingComfort ? labels.readingComfortActive : labels.readingComfort}
                          aria-pressed={readingComfort}
                        >
                          <BookOpen size={14} aria-hidden />
                          {labels.readingComfort}
                        </button>
                      </div>
                    </div>
                    <div
                      className={`overflow-y-auto overscroll-contain whitespace-pre-wrap text-slate-100 [overflow-wrap:anywhere] ${
                        readingComfort
                          ? "max-h-[min(65vh,34rem)] text-base leading-[1.75] tracking-wide sm:text-lg"
                          : "max-h-[min(50vh,22rem)] text-sm leading-relaxed"
                      }`}
                    >
                      {reply}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>,
      document.body
    );

  return (
    <div className="group/ai ai-assist-hover-zone relative isolate rounded-[inherit]" tabIndex={0}>
      {children}

      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20 h-14 bg-gradient-to-b from-slate-950/50 to-transparent opacity-0 transition-opacity duration-200 md:group-hover/ai:opacity-100"
        aria-hidden
      />

      {modal}

      <button
        type="button"
        title={labels.fabAria}
        aria-label={labels.fabAria}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
          setReply(null);
          setError(null);
          setReadingComfort(false);
        }}
        className={`absolute right-3 top-3 z-30 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-cyan-400/45 bg-slate-950 px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-cyan-50 ai-backlit-pulse-fab shadow-[0_0_22px_rgba(34,211,238,0.45),0_6px_28px_-8px_rgba(34,211,238,0.35)] ring-2 ring-cyan-400/35 transition duration-200 hover:border-cyan-300/70 hover:bg-slate-900 hover:shadow-[0_0_28px_rgba(34,211,238,0.55),0_8px_32px_-6px_rgba(34,211,238,0.45)] hover:ring-cyan-300/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 max-sm:right-2 max-sm:top-2 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs opacity-100 max-md:opacity-100 md:pointer-events-none md:translate-y-1 md:opacity-0 md:shadow-none md:ring-0 md:ring-offset-0 md:group-hover/ai:pointer-events-auto md:group-hover/ai:translate-y-0 md:group-hover/ai:opacity-100 md:group-hover/ai:shadow-[0_0_22px_rgba(34,211,238,0.45),0_6px_28px_-8px_rgba(34,211,238,0.35)] md:group-hover/ai:ring-2 md:group-hover/ai:ring-cyan-400/35 md:group-focus-within/ai:pointer-events-auto md:group-focus-within/ai:translate-y-0 md:group-focus-within/ai:opacity-100 md:group-focus-within/ai:shadow-[0_0_22px_rgba(34,211,238,0.45),0_6px_28px_-8px_rgba(34,211,238,0.35)] md:group-focus-within/ai:ring-2 md:group-focus-within/ai:ring-cyan-400/35 ${open ? "pointer-events-none opacity-0" : ""}`}
      >
        <Sparkles className="size-3.5 shrink-0 text-cyan-300 sm:size-4" strokeWidth={2.25} aria-hidden />
        <span className="truncate">{labels.fabTitle}</span>
      </button>
    </div>
  );
}
