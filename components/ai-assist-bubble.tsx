"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Loader2, Sparkles, X } from "lucide-react";
import type { Messages } from "@/lib/i18n/messages";

export type AssistSection = "vocabulary" | "grammar" | "listening" | "reading" | "writing" | "speaking" | "quiz";

export type AssistTaskKey =
  | "more_examples"
  | "explain_simple"
  | "listening_help"
  | "reading_help"
  | "writing_ideas"
  | "speaking_hints"
  | "quiz_explain"
  | "vocab_deep";

export type AiAssistLabels = Messages["aiAssist"];

function interpolate(template: string, vars: Record<string, string | number>) {
  let out = template;
  for (const [k, v] of Object.entries(vars)) {
    out = out.replaceAll(`{{${k}}}`, String(v));
  }
  return out;
}

export function AiAssistBubble({
  day,
  section,
  contextText,
  labels,
  creditCost,
  tasks,
  children
}: {
  day: number;
  section: AssistSection;
  contextText: string;
  labels: AiAssistLabels;
  creditCost: number;
  tasks: Array<{ key: AssistTaskKey; label: string }>;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [task, setTask] = useState<AssistTaskKey>(tasks[0]?.key ?? "more_examples");
  const [loading, setLoading] = useState(false);
  const [reply, setReply] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = useCallback(() => setOpen(false), []);

  const run = useCallback(async () => {
    if (!contextText.trim()) return;
    setLoading(true);
    setError(null);
    setReply(null);
    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          day,
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
            case "INVALID_KEY":
              setError(labels.errorInvalidKey);
              break;
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
  }, [contextText, day, labels, section, task]);

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
        className="fixed inset-0 z-[1000] overflow-y-auto overscroll-contain bg-slate-950/75"
        role="presentation"
        onClick={close}
      >
        <div className="flex min-h-[100dvh] w-full items-center justify-center p-4 py-12">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="ai-assist-title"
            className="w-full max-w-[440px] rounded-[1.75rem] border border-white/15 bg-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.65)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex max-h-[min(82vh,560px)] flex-col overflow-hidden">
              <div className="flex shrink-0 items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="min-w-0 pr-2">
                  <p id="ai-assist-title" className="text-sm font-black text-white">
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
                  onClick={() => run()}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-300 py-3 font-black text-slate-950 disabled:opacity-60"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : null}
                  {labels.ask}
                </button>

                {error && <p className="mt-3 rounded-xl bg-rose-500/15 p-3 text-sm text-rose-100">{error}</p>}

                {reply && (
                  <div className="mt-4 rounded-2xl border border-white/10 bg-slate-950 p-4">
                    <p className="mb-2 text-xs font-bold uppercase tracking-wider text-cyan-200">{labels.resultTitle}</p>
                    <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{reply}</div>
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
    <div className="group/ai relative isolate rounded-[inherit]" tabIndex={0}>
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
        }}
        className={`absolute right-3 top-3 z-30 inline-flex max-w-[calc(100%-1.5rem)] items-center gap-1.5 rounded-full border border-cyan-400/30 bg-slate-950 px-2.5 py-1.5 text-[11px] font-bold tracking-wide text-cyan-50 shadow-[0_6px_28px_-8px_rgba(34,211,238,0.45)] transition duration-200 hover:border-cyan-300/50 hover:bg-slate-900 hover:shadow-[0_8px_32px_-6px_rgba(34,211,238,0.55)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 max-sm:right-2 max-sm:top-2 sm:gap-2 sm:px-3 sm:py-2 sm:text-xs opacity-100 max-md:opacity-100 md:pointer-events-none md:translate-y-1 md:opacity-0 md:shadow-none md:group-hover/ai:pointer-events-auto md:group-hover/ai:translate-y-0 md:group-hover/ai:opacity-100 md:group-hover/ai:shadow-[0_6px_28px_-8px_rgba(34,211,238,0.45)] md:group-focus-within/ai:pointer-events-auto md:group-focus-within/ai:translate-y-0 md:group-focus-within/ai:opacity-100 md:group-focus-within/ai:shadow-[0_6px_28px_-8px_rgba(34,211,238,0.45)] ${open ? "pointer-events-none opacity-0" : ""}`}
      >
        <Sparkles className="size-3.5 shrink-0 text-cyan-300 sm:size-4" strokeWidth={2.25} aria-hidden />
        <span className="truncate">{labels.fabTitle}</span>
      </button>
    </div>
  );
}
