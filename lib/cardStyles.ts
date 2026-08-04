import { BRAND_GRADIENT } from "./brand";
import {
  QUOTE_ELEGANTE,
  QUOTE_MODERNO_ICON,
  QUOTE_ACOLHEDOR_ICON,
  STAR_OUTLINE,
  STAR_SOLID,
  STAR_ROUND,
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
  quoteIcon: string;
  starIcon: string;
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
    quoteIcon: QUOTE_ELEGANTE,
    starIcon: STAR_OUTLINE,
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
    quoteIcon: QUOTE_MODERNO_ICON,
    starIcon: STAR_SOLID,
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
    quoteIcon: QUOTE_ACOLHEDOR_ICON,
    starIcon: STAR_ROUND,
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
