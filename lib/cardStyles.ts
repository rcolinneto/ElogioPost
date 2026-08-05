import { BRAND_GRADIENT } from "./brand";
import {
  quoteElegante,
  quoteModerno,
  quoteAcolhedor,
  starOutline,
  starSolid,
  starRound,
} from "./cardIcons";

export type CardStyleId = "elegante" | "moderno" | "acolhedor";

export type CardStyle = {
  id: CardStyleId;
  label: string;
  background: string;
  textColor: string;
  mutedTextColor: string;
  accentColor: string;
  /** fonte de destaque (bold) usada na citação */
  displayFont: string;
  /** fonte de apoio (regular/light) usada no nome e na atribuição */
  supportFont: string;
  /** recebe a cor de destaque atual (accentColor, já com override de marca
   * aplicado se houver) — cada estilo decide se usa ela ou ignora (ex: o
   * ícone de aspas do selo do Moderno/Acolhedor é sempre branco, não
   * acompanha a marca, porque é o primeiro plano de um selo colorido) */
  quoteIcon: (accentColor: string) => string;
  starIcon: (accentColor: string) => string;
  /** cor de fundo do "selo" circular de aspas/avatar, quando aplicável */
  badgeBackground: string;
  avatarBackground: string;
  avatarBorder: string;
  /** camada por cima do print do WhatsApp quando ele vira fundo do card —
   * clara pra estilos de texto escuro (acolhedor), escura pros demais */
  photoOverlay: string;
};

export const CARD_STYLES: Record<CardStyleId, CardStyle> = {
  elegante: {
    id: "elegante",
    label: "Elegante",
    background: "#171512",
    textColor: "#f6f1e7",
    mutedTextColor: "#a89d88",
    accentColor: "#c9a227",
    displayFont: "Playfair Display",
    supportFont: "Josefin Sans",
    quoteIcon: quoteElegante,
    starIcon: starOutline,
    badgeBackground: "transparent",
    avatarBackground: "#24211b",
    avatarBorder: "#c9a227",
    photoOverlay: "rgba(10, 8, 6, 0.62)",
  },
  moderno: {
    id: "moderno",
    label: "Moderno",
    background: BRAND_GRADIENT,
    textColor: "#ffffff",
    mutedTextColor: "rgba(255,255,255,0.78)",
    accentColor: "#fde68a",
    displayFont: "Poppins",
    supportFont: "Poppins",
    // selo do Moderno é um círculo translúcido — o ícone dentro fica branco
    // sempre, independente da cor de marca (é o "primeiro plano" do selo)
    quoteIcon: () => quoteModerno("#ffffff"),
    starIcon: starSolid,
    badgeBackground: "rgba(255,255,255,0.18)",
    avatarBackground: "rgba(255,255,255,0.25)",
    avatarBorder: "rgba(255,255,255,0.9)",
    photoOverlay: "rgba(15, 8, 28, 0.6)",
  },
  acolhedor: {
    id: "acolhedor",
    label: "Acolhedor",
    background: "linear-gradient(160deg, #fbe0c4 0%, #f0a97e 55%, #e2896a 100%)",
    textColor: "#4a2e22",
    mutedTextColor: "#8a5a3f",
    accentColor: "#d9643a",
    displayFont: "Baloo 2",
    supportFont: "Nunito",
    // mesma lógica do Moderno: ícone do selo fica branco sempre
    quoteIcon: () => quoteAcolhedor("#ffffff"),
    starIcon: starRound,
    badgeBackground: "#d9643a",
    avatarBackground: "rgba(255,255,255,0.6)",
    avatarBorder: "#d9643a",
    photoOverlay: "rgba(255, 250, 244, 0.55)",
  },
};

export const DEFAULT_CARD_STYLE: CardStyleId = "moderno";

export function resolveCardStyle(id: string | null | undefined): CardStyle {
  if (id && id in CARD_STYLES) {
    return CARD_STYLES[id as CardStyleId];
  }
  return CARD_STYLES[DEFAULT_CARD_STYLE];
}

// Cor da marca do negócio (Brand Kit) sobrescrevendo a cor de destaque
// padrão do estilo escolhido — mantém o resto de cada composição intacto
// (fontes, fundo, layout), só troca o que é "cor de destaque" daquele
// estilo. Cada estilo decide explicitamente o que acompanha a marca:
// - Elegante: régua lateral + contorno do avatar
// - Moderno: só a cor de destaque em si (usada pela estrela); o selo e o
//   contorno do avatar são translúcidos/brancos de propósito
// - Acolhedor: selo + contorno do avatar (ambos já eram a própria
//   accentColor original)
export function applyBrandColor(style: CardStyle, brandColor: string | null | undefined): CardStyle {
  if (!brandColor) return style;

  switch (style.id) {
    case "elegante":
      return { ...style, accentColor: brandColor, avatarBorder: brandColor };
    case "moderno":
      return { ...style, accentColor: brandColor };
    case "acolhedor":
      return {
        ...style,
        accentColor: brandColor,
        avatarBorder: brandColor,
        badgeBackground: brandColor,
      };
  }
}
