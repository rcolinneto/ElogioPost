import { MessageSquareQuote, QrCode, Send } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/painel", label: "Depoimentos", icon: MessageSquareQuote },
  { href: "/painel/pedir", label: "Pedir depoimento", icon: Send },
  { href: "/painel/qrcode", label: "QR Code", icon: QrCode },
] as const;
