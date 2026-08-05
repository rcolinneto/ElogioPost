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
  // (/api/qrcode?formato=plaquinha) mantém sempre o visual fixo da marca,
  // exceto pelo que vem do Brand Kit (logo/cor/foto), que vale pros dois.
  style?: CardStyle;
  // Só a plaquinha: foto de fundo opcional do negócio, com a faixa sólida
  // (clara ou escura, escolhida pelo dono) atrás do QR pra garantir
  // contraste suficiente — QR direto sobre a foto pode falhar na leitura.
  backgroundImageUrl?: string | null;
  bandColor?: string;
  accentColor?: string;
  logoUrl?: string | null;
  // Fonte de destaque/apoio do estilo de card escolhido — a plaquinha usa
  // essas fontes mesmo sem herdar o resto do visual do estilo (fundo/cor de
  // texto continuam fixos), então vêm como prop própria em vez de só via
  // `style`, que só é passado (com fundo/cor incluídos) pro slide do
  // carrossel.
  displayFont?: string;
  supportFont?: string;
};

export function QrCtaCard({
  width,
  height,
  headline,
  qrDataUrl,
  businessName,
  qrSize = 500,
  style,
  backgroundImageUrl,
  bandColor = "#ffffff",
  accentColor,
  logoUrl,
  displayFont = style?.displayFont ?? "sans-serif",
  supportFont = style?.supportFont ?? "sans-serif",
}: Props) {
  const background = style?.background ?? BRAND_GRADIENT;
  const textColor = style?.textColor ?? "#ffffff";
  const mutedTextColor = style?.mutedTextColor ?? "rgba(255,255,255,0.9)";

  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        display: "flex",
        fontFamily: supportFont,
      }}
    >
      {backgroundImageUrl ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
          <img
            src={backgroundImageUrl}
            alt=""
            width={width}
            height={height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              objectFit: "cover",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width,
              height,
              display: "flex",
              background: "rgba(0, 0, 0, 0.45)",
            }}
          />
        </>
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
            display: "flex",
            background,
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: 90,
          color: textColor,
        }}
      >
        {logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image
          <img
            src={logoUrl}
            alt=""
            height={80}
            style={{ display: "flex", maxHeight: 80, maxWidth: 260, objectFit: "contain", marginBottom: 36 }}
          />
        )}

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            textAlign: "center",
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
            background: bandColor,
            padding: 32,
            borderRadius: 24,
            // next/og (satori) tropeça se `border` for setado como
            // `undefined` explícito (em vez de simplesmente ausente) — por
            // isso a propriedade só entra no objeto quando há accentColor.
            ...(accentColor ? { border: `4px solid ${accentColor}` } : {}),
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
          <img src={qrDataUrl} alt="" width={qrSize} height={qrSize} style={{ display: "flex" }} />
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            textAlign: "center",
            fontSize: 28,
            color: mutedTextColor,
            marginTop: 40,
          }}
        >
          aponte a câmera do celular pro QR code
        </div>

        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            textAlign: "center",
            fontFamily: supportFont,
            fontSize: 40,
            fontWeight: 700,
            marginTop: 60,
          }}
        >
          {businessName}
        </div>
      </div>
    </div>
  );
}
