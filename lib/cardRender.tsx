import type { CardStyle } from "./cardStyles";
import { pickQuoteFontSize, preventOrphanWord } from "./cardText";

export const CARD_SIZES = {
  feed: { width: 1080, height: 1080 },
  stories: { width: 1080, height: 1920 },
  // Google Business Profile: 1200x900 (4:3), mas Google/Maps podem cortar as
  // bordas — por isso o conteúdo fica confinado numa coluna central de 900,
  // igual à altura, deixando 150px de sangria de cada lado.
  google: { width: 1200, height: 900 },
} as const;

export type CardFormat = keyof typeof CARD_SIZES;

export type CardData = {
  clientName: string;
  rating: number;
  body: string;
  businessName: string;
  logoUrl?: string | null;
};

type FormatLayout = {
  padding: number;
  quoteFont: { min: number; max: number };
  quoteLineHeight: number;
  gap: number;
  badgeSize: number;
  badgeIconSize: number;
  decorativeIconSize: number;
  avatarSize: number;
  avatarFontSize: number;
  starSize: number;
  nameFontSize: number;
  bizFontSize: number;
};

const LAYOUT: Record<CardFormat, FormatLayout> = {
  feed: {
    padding: 90,
    quoteFont: { min: 34, max: 58 },
    quoteLineHeight: 1.35,
    gap: 36,
    badgeSize: 128,
    badgeIconSize: 60,
    decorativeIconSize: 96,
    avatarSize: 104,
    avatarFontSize: 38,
    starSize: 40,
    nameFontSize: 40,
    bizFontSize: 28,
  },
  stories: {
    padding: 130,
    quoteFont: { min: 50, max: 78 },
    quoteLineHeight: 1.35,
    gap: 46,
    badgeSize: 168,
    badgeIconSize: 78,
    decorativeIconSize: 130,
    avatarSize: 136,
    avatarFontSize: 48,
    starSize: 52,
    nameFontSize: 52,
    bizFontSize: 34,
  },
  google: {
    padding: 64,
    quoteFont: { min: 28, max: 46 },
    quoteLineHeight: 1.32,
    gap: 28,
    badgeSize: 104,
    badgeIconSize: 48,
    decorativeIconSize: 78,
    avatarSize: 88,
    avatarFontSize: 32,
    starSize: 34,
    nameFontSize: 34,
    bizFontSize: 24,
  },
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function Avatar({ style, layout, initials }: { style: CardStyle; layout: FormatLayout; initials: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: layout.avatarSize,
        height: layout.avatarSize,
        borderRadius: "50%",
        background: style.avatarBackground,
        border: `3px solid ${style.avatarBorder}`,
        color: style.textColor,
        fontFamily: style.supportFont,
        fontSize: layout.avatarFontSize,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

function Stars({ style, layout, rating }: { style: CardStyle; layout: FormatLayout; rating: number }) {
  return (
    <div style={{ display: "flex", gap: Math.round(layout.starSize * 0.18) }}>
      {Array.from({ length: rating }).map((_, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image
        <img
          key={i}
          src={style.starIcon(style.accentColor)}
          width={layout.starSize}
          height={layout.starSize}
          alt=""
          style={{ display: "flex" }}
        />
      ))}
    </div>
  );
}

// Nome do cliente + atribuição ao negócio, empilhados. Evita usar
// React.Fragment como filho de um container flex: o satori não repassa a
// direção do flex através de fragments (as duas linhas saem lado a lado
// em vez de empilhadas), então cada variação recebe sua própria div.
function NameBlock({
  style,
  layout,
  data,
  bizWeight,
  align,
  pill,
}: {
  style: CardStyle;
  layout: FormatLayout;
  data: CardData;
  bizWeight: 300 | 400;
  align: "left" | "center";
  pill?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: align === "center" ? "center" : "flex-start",
        gap: 4,
        ...(pill
          ? { background: "rgba(255,255,255,0.55)", borderRadius: 999, padding: "14px 32px" }
          : {}),
      }}
    >
      <div
        style={{
          display: "flex",
          fontFamily: style.supportFont,
          fontWeight: 400,
          fontSize: layout.nameFontSize,
          color: style.textColor,
        }}
      >
        {data.clientName}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        {data.logoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image
          <img
            src={data.logoUrl}
            width={Math.round(layout.bizFontSize * 1.3)}
            height={Math.round(layout.bizFontSize * 1.3)}
            alt=""
            style={{
              display: "flex",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        )}
        <div
          style={{
            display: "flex",
            fontFamily: style.supportFont,
            fontWeight: bizWeight,
            fontSize: layout.bizFontSize,
            color: style.mutedTextColor,
          }}
        >
          via {data.businessName}
        </div>
      </div>
    </div>
  );
}

// "B": composição editorial assimétrica — aspas grande no canto, régua
// vertical de destaque, citação alinhada à esquerda, rodapé com
// avatar+nome de um lado e estrelas do outro.
function EditorialLayout({
  style,
  layout,
  data,
  initials,
  quoteFontSize,
  quoteText,
}: {
  style: CardStyle;
  layout: FormatLayout;
  data: CardData;
  initials: string;
  quoteFontSize: number;
  quoteText: string;
}) {
  const bizWeight = style.supportFont === "Poppins" ? 400 : 300;

  return (
    <div style={{ display: "flex", flexDirection: "row", alignItems: "stretch", gap: 32, width: "100%" }}>
      <div style={{ display: "flex", width: 4, borderRadius: 2, background: style.accentColor }} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
        <img
          src={style.quoteIcon(style.accentColor)}
          width={layout.decorativeIconSize}
          height={layout.decorativeIconSize}
          alt=""
          style={{ display: "flex" }}
        />
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontFamily: style.displayFont,
            fontWeight: 700,
            fontSize: quoteFontSize,
            lineHeight: layout.quoteLineHeight,
            color: style.textColor,
          }}
        >
          {quoteText}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: 44,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Avatar style={style} layout={layout} initials={initials} />
            <NameBlock style={style} layout={layout} data={data} bizWeight={bizWeight} align="left" />
          </div>
          <Stars style={style} layout={layout} rating={data.rating} />
        </div>
      </div>
    </div>
  );
}

// "B": composição em bloco centralizado — selo com ícone de aspas, citação
// centralizada, estrelas, avatar e nome/negócio empilhados (com "etiqueta"
// arredondada no acolhedor).
function CenteredStackLayout({
  style,
  layout,
  data,
  initials,
  quoteFontSize,
  quoteText,
}: {
  style: CardStyle;
  layout: FormatLayout;
  data: CardData;
  initials: string;
  quoteFontSize: number;
  quoteText: string;
}) {
  const bizWeight = style.supportFont === "Poppins" ? 400 : 300;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%", gap: layout.gap }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: layout.badgeSize,
          height: layout.badgeSize,
          borderRadius: "50%",
          background: style.badgeBackground,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image */}
        <img
          src={style.quoteIcon(style.accentColor)}
          width={layout.badgeIconSize}
          height={layout.badgeIconSize}
          alt=""
          style={{ display: "flex" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          fontFamily: style.displayFont,
          fontWeight: 700,
          fontSize: quoteFontSize,
          lineHeight: layout.quoteLineHeight,
          color: style.textColor,
          textAlign: "center",
        }}
      >
        {quoteText}
      </div>

      <Stars style={style} layout={layout} rating={data.rating} />
      <Avatar style={style} layout={layout} initials={initials} />

      <NameBlock
        style={style}
        layout={layout}
        data={data}
        bizWeight={bizWeight}
        align="center"
        pill={style.id === "acolhedor"}
      />
    </div>
  );
}

export function renderTestimonialCard(
  style: CardStyle,
  format: CardFormat,
  data: CardData,
  backgroundImageUrl: string | null,
) {
  const { width, height } = CARD_SIZES[format];
  const layout = LAYOUT[format];
  const initials = getInitials(data.clientName);
  const quoteFontSize = pickQuoteFontSize(data.body, layout.quoteFont);
  const quoteText = preventOrphanWord(data.body);
  const contentWidth = format === "google" ? 900 : "100%";

  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        justifyContent: format === "google" ? "center" : "flex-start",
        width: "100%",
        height: "100%",
      }}
    >
      {backgroundImageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- gerado pelo next/og, não é o next/image
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
      ) : (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
            display: "flex",
            background: style.background,
          }}
        />
      )}

      {backgroundImageUrl && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width,
            height,
            display: "flex",
            background: style.photoOverlay,
          }}
        />
      )}

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: contentWidth,
          height: "100%",
          padding: layout.padding,
          fontFamily: style.supportFont,
        }}
      >
        {style.id === "elegante" ? (
          <EditorialLayout
            style={style}
            layout={layout}
            data={data}
            initials={initials}
            quoteFontSize={quoteFontSize}
            quoteText={quoteText}
          />
        ) : (
          <CenteredStackLayout
            style={style}
            layout={layout}
            data={data}
            initials={initials}
            quoteFontSize={quoteFontSize}
            quoteText={quoteText}
          />
        )}
      </div>
    </div>
  );
}
