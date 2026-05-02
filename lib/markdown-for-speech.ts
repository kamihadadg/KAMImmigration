/**
 * Strip markdown / markup so browser TTS does not read asterisks, hashes, pipes, etc.
 * Display copy stays unchanged; use this only for SpeechSynthesisUtterance text.
 */
export function sanitizeMarkdownForSpeech(raw: string): string {
  const t0 = raw.replace(/\r\n/g, "\n").trim();
  if (!t0) return "";

  let t = t0;

  t = t.replace(/```[\w-]*\n?[\s\S]*?```/g, " ");
  t = t.replace(/`([^`]+)`/g, " $1 ");
  t = t.replace(/!\[([^\]]*)\]\([^)]*\)/g, " $1 ");
  t = t.replace(/\[([^\]]+)\]\([^)]*\)/g, " $1 ");
  t = t.replace(/\*\*([^*]+)\*\*/g, "$1");
  t = t.replace(/__([^_]+)__/g, "$1");
  t = t.replace(/\*([^*\n]+)\*/g, "$1");
  t = t.replace(/_([^_\n]+)_/g, "$1");
  t = t.replace(/~~([^~]+)~~/g, "$1");
  t = t.replace(/^#{1,6}\s+/gm, "");
  t = t.replace(/^>\s?/gm, "");
  t = t.replace(/^[\s]*[-*+]\s+/gm, "");
  t = t.replace(/^\s*\d+\.\s+/gm, "");
  t = t.replace(/^\s*\|?.+\|.*$/gm, (line) => line.replace(/\|/g, " "));
  t = t.replace(/\|/g, " ");
  t = t.replace(/<[^>]+>/g, " ");
  t = t.replace(/\*{1,3}/g, "");
  t = t.replace(/_{1,2}/g, "");
  t = t.replace(/`+/g, "");
  t = t.replace(/#+/g, "");
  t = t.replace(/~/g, "");
  t = t.replace(/\n{2,}/g, "\n");
  t = t.replace(/\n/g, " ");
  t = t.replace(/\s{2,}/g, " ").trim();

  return t;
}
