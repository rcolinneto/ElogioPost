import { BRAND_GRADIENT } from "./brand";
import type { CardStyle } from "./cardStyles";

type Props = {
  width: number;
  height: number;
  headline: string;
  qrDataUrl: string;
  businessName: string;
  qrSize?: number;
  // Só o slide 2 do carrossel (/api/qrcode?formato=carrossel) recebe o
  // estilo escolhido pelo dono — a plaquinha de balcão
  // (/api/qrcode?formato=plaquinha) mantém sempre o visual fixo da marca.
  style?: CardStyle;
};

export function QrCtaCard({
  width,
  height,
  headline,
  qrDataUrl,
  businessName,
  qrSize = 500,
  style,
}: Props) {
  const background = style?.background ?? BRAND_GRADIENT;
  const textColor = style?.textColor ?? "#ffffff";
  const mutedTextColor = style?.mutedTextColor ?? "rgba(255,255,255,0.9)";
  const displayFont = style?.displayFont ?? "sans-serif";
  const supportFont = style?.supportFont ?? "sans-serif";
  const accentColor = style?.accentColor ?? "transparent";

  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: 90,
        background,
        color: textColor,
        fontFamily: supportFont,
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
          fontFamily: displayFont,
          fontSize: 56,
          fontWeight: 700,
          lineHeight: 1.3,
        }}
      >
        {headline}
      </div>

      <div
        style={{
          display: "flex",
          marginTop: 50,
          background: "white",
          padding: 32,
          borderRadius: 24,
          border: style ? `4px solid ${accentColor}` : undefined,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
        <img src={qrDataUrl} alt="" width={qrSize} height={qrSize} style={{ display: "flex" }} />
      </div>

      <div style={{ display: "flex", fontSize: 28, color: mutedTextColor, marginTop: 40 }}>
        aponte a câmera do celular pro QR code
      </div>

      <div
        style={{
          display: "flex",
          fontFamily: supportFont,
          fontSize: 40,
          fontWeight: 700,
          marginTop: 60,
        }}
      >
        {businessName}
      </div>
    </div>
  );
}
