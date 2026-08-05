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

// Link direto pro WhatsApp (wa.me só aceita dígitos, sem espaço/parênteses/traço,
// com código do país). Número brasileiro digitado sem DDI (só DDD + número,
// 10 ou 11 dígitos) recebe o 55 automaticamente — sem isso o link não abre a
// conversa certa. `message`, quando informado, pré-preenche o campo de texto.
export function whatsappLink(number: string, message?: string): string {
  let digits = number.replace(/\D/g, "");
  if (digits.length === 10 || digits.length === 11) {
    digits = `55${digits}`;
  }
  const base = `https://wa.me/${digits}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
