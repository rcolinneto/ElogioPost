export const DEFAULT_WHATSAPP_TEMPLATE = `Oi, {{nome}} 💕 Obrigada por escolher {{negocio}}! Você pode deixar um depoimento rapidinho? Isso ajuda muito nosso pequeno negócio 😊
👉 {{link}}`;

export function buildWhatsappMessage(
  template: string,
  vars: { nome: string; negocio: string; link: string },
): string {
  return template
    .replaceAll("{{nome}}", vars.nome)
    .replaceAll("{{negocio}}", vars.negocio)
    .replaceAll("{{link}}", vars.link);
}
