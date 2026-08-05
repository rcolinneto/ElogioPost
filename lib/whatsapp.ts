export const DEFAULT_WHATSAPP_TEMPLATE = `Oi, {{nome}} 💕 Obrigada por escolher {{negocio}}! Você pode deixar um depoimento rapidinho? Isso ajuda muito nosso pequeno negócio 😊
👉 {{link}}`;

export function buildWhatsappMessage(
  template: string,
  vars: { nome: string; negocio: string; link: string; instagram?: string | null },
): string {
  return template
    .replaceAll("{{nome}}", vars.nome)
    .replaceAll("{{negocio}}", vars.negocio)
    .replaceAll("{{link}}", vars.link)
    .replaceAll("{{instagram}}", vars.instagram ? `@${vars.instagram}` : "");
}

// Link direto pro WhatsApp (wa.me só aceita dígitos, sem espaço/parênteses/traço)
export function whatsappLink(number: string): string {
  const digits = number.replace(/\D/g, "");
  return `https://wa.me/${digits}`;
}
