import { BRAND_GRADIENT } from "./brand";

type Props = {
  width: number;
  height: number;
  headline: string;
  qrDataUrl: string;
  businessName: string;
  qrSize?: number;
};

// Cartão com chamada + QR code, reaproveitado pela plaquinha de balcão
// (/api/qrcode?formato=plaquinha) e pelo slide 2 do carrossel de Instagram
// (/api/qrcode?formato=carrossel) — mesma identidade visual, tamanhos diferentes.
export function QrCtaCard({
  width,
  height,
  headline,
  qrDataUrl,
  businessName,
  qrSize = 500,
}: Props) {
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
        background: BRAND_GRADIENT,
        color: "white",
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          width: "100%",
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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
        <img src={qrDataUrl} alt="" width={qrSize} height={qrSize} style={{ display: "flex" }} />
      </div>

      <div style={{ display: "flex", fontSize: 28, opacity: 0.9, marginTop: 40 }}>
        aponte a câmera do celular pro QR code
      </div>

      <div style={{ display: "flex", fontSize: 40, fontWeight: 700, marginTop: 60 }}>
        {businessName}
      </div>
    </div>
  );
}
