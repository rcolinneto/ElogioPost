/**
 * Tamanho de fonte da citação varia conforme o tamanho do texto: curtas
 * (até ~60 caracteres) usam o tamanho máximo, longas (a partir de ~220)
 * usam o mínimo, com interpolação linear entre os dois extremos.
 */
export function pickQuoteFontSize(
  text: string,
  { min, max }: { min: number; max: number },
): number {
  const SHORT = 60;
  const LONG = 220;
  const len = text.trim().length;

  if (len <= SHORT) return max;
  if (len >= LONG) return min;

  const t = (len - SHORT) / (LONG - SHORT);
  return Math.round(max - t * (max - min));
}

const NBSP = String.fromCharCode(160);

/**
 * O next/og (satori) não suporta `text-wrap: balance`. Como aproximação
 * manual, troca o último espaço por um espaço inseparável (NBSP) — isso
 * impede o "efeito órfã" (uma palavra sozinha na última linha), sem
 * precisar medir largura de texto por fonte.
 */
export function preventOrphanWord(text: string): string {
  const trimmed = text.trim();
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace === -1) return trimmed;
  return trimmed.slice(0, lastSpace) + NBSP + trimmed.slice(lastSpace + 1);
}
