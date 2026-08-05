// Ícones decorativos (aspas, estrelas) de cada estilo, gerados sob demanda
// como data URIs de SVG — evita depender de suporte a SVG inline no next/og
// e reaproveita a mesma técnica já usada pro QR code (<img src="data:...">).
// São funções (não mais strings fixas) pra poder receber a cor de marca do
// negócio quando ela sobrescreve a cor de destaque padrão do estilo — ver
// applyBrandColor em cardStyles.ts.

function toDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
}

export function quoteElegante(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="52" height="38" viewBox="0 0 52 38" fill="none"><path d="M4 2C4 2 14 4 14 16C14 24 8 28 2 28" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/><path d="M28 2C28 2 38 4 38 16C38 24 32 28 26 28" stroke="${color}" stroke-width="2.2" stroke-linecap="round"/></svg>`,
  );
}

export function quoteModerno(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 30 24" fill="${color}"><path d="M0 10C0 4.5 4.5 0 10 0V6C7.8 6 6 7.8 6 10V11H10V24H0V10Z"/><path d="M17 10C17 4.5 21.5 0 27 0V6C24.8 6 23 7.8 23 10V11H27V24H17V10Z"/></svg>`,
  );
}

export function quoteAcolhedor(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="34" height="26" viewBox="0 0 34 26" fill="${color}"><rect x="0" y="0" width="14" height="18" rx="7"/><rect x="20" y="0" width="14" height="18" rx="7"/></svg>`,
  );
}

export function starOutline(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.4" stroke-linejoin="round"><path d="M22,12 L14.83,9.17 L12,2 L9.17,9.17 L2,12 L9.17,14.83 L12,22 L14.83,14.83 Z"/></svg>`,
  );
}

export function starSolid(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}"><path d="M12,2 L14.35,8.76 L21.51,8.91 L15.80,13.24 L17.88,20.09 L12,16 L6.12,20.09 L8.20,13.24 L2.49,8.91 L9.65,8.76 Z"/></svg>`,
  );
}

export function starRound(color: string): string {
  return toDataUri(
    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${color}"><path d="M12,2 L14.35,8.76 L21.51,8.91 L15.80,13.24 L17.88,20.09 L12,16 L6.12,20.09 L8.20,13.24 L2.49,8.91 L9.65,8.76 Z"/></svg>`,
  );
}
