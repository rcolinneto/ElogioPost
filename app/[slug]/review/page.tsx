import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { pickReadableTextColor } from "@/lib/color";
import CollectionForm from "./CollectionForm";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.rpc("get_business_by_slug", {
    p_slug: slug,
  });

  const business = data?.[0];
  if (!business) {
    notFound();
  }

  const logoUrl = business.logo_path
    ? supabase.storage.from("business-assets").getPublicUrl(business.logo_path).data.publicUrl
    : null;

  // Sem cor de marca, o cabeçalho mantém o gradiente fixo (definido em
  // .app-header, app/globals.css) e texto branco, como sempre foi. Com
  // cor de marca, sobrescrevemos os dois via style inline (que sempre vence
  // a classe) — e escolhemos branco ou escuro pelo que der mais contraste,
  // já que o dono pode escolher qualquer cor, inclusive clara.
  const headerStyle = business.brand_color
    ? { background: business.brand_color, color: pickReadableTextColor(business.brand_color) }
    : undefined;
  const logoRingColor = headerStyle?.color === "#1f2133" ? "rgba(31,33,51,0.35)" : "rgba(255,255,255,0.7)";

  return (
    <>
      <header className="app-header" style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          {logoUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- vem de um bucket público nosso, não precisa do next/image
            <img
              src={logoUrl}
              alt=""
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                objectFit: "cover",
                border: `2px solid ${logoRingColor}`,
                flexShrink: 0,
              }}
            />
          )}
          <h1 style={{ margin: 0 }}>{business.name}</h1>
        </div>
        <p>Deixe seu depoimento pra gente ✨</p>
      </header>
      <main className="app-main">
        <CollectionForm businessId={business.id} />
      </main>
    </>
  );
}
