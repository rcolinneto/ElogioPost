function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

// Luminância relativa (WCAG): https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
function relativeLuminance([r, g, b]: [number, number, number]): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Escolhe branco ou um texto escuro — o que der mais contraste contra a cor
// de fundo — pra qualquer cor de marca que o dono escolher continuar
// legível, sem ele precisar pensar em contraste na hora de escolher a cor.
export function pickReadableTextColor(backgroundHex: string): string {
  const luminance = relativeLuminance(hexToRgb(backgroundHex));
  const contrastWithWhite = (1 + 0.05) / (luminance + 0.05);
  const contrastWithDark = (luminance + 0.05) / (0 + 0.05);
  // #1f2133 é o --text do CSS clássico (app/globals.css), pra combinar com
  // o resto do texto da página quando o fundo do cabeçalho é claro.
  return contrastWithWhite >= contrastWithDark ? "#ffffff" : "#1f2133";
}
