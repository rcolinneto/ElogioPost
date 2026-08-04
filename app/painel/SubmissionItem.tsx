"use client";

import { useState, useTransition } from "react";
import type { Testimonial } from "@/lib/types";
import { CARD_STYLES, type CardStyleId } from "@/lib/cardStyles";
import { approveTestimonial, rejectTestimonial, updateCardStyle } from "./actions";
import { generateCaption } from "./captionActions";

type Props = {
  testimonial: Testimonial & { screenshotUrl: string | null };
  businessName: string;
  defaultCardStyle: string;
};

function isCardStyleId(value: string): value is CardStyleId {
  return value in CARD_STYLES;
}

export default function SubmissionItem({ testimonial, businessName, defaultCardStyle }: Props) {
  const [pending, startTransition] = useTransition();

  const [caption, setCaption] = useState(testimonial.caption ?? "");
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [captionError, setCaptionError] = useState("");
  const [copied, setCopied] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState<CardStyleId>(
    isCardStyleId(defaultCardStyle) ? defaultCardStyle : "moderno",
  );
  const [, startStyleTransition] = useTransition();
  const [cacheBust, setCacheBust] = useState(0);

  function handleSelectStyle(styleId: CardStyleId) {
    if (styleId === selectedStyle) return;
    setSelectedStyle(styleId);
    startStyleTransition(async () => {
      await updateCardStyle(styleId);
      setCacheBust((v) => v + 1);
    });
  }

  const cardUrl = (formato: "feed" | "stories" | "google") =>
    `/api/testimonials/${testimonial.id}/card?formato=${formato}&estilo=${selectedStyle}&v=${cacheBust}`;

  async function handleGenerateCaption() {
    setGeneratingCaption(true);
    setCaptionError("");
    const result = await generateCaption(testimonial.id);
    if (result.error) {
      setCaptionError(result.error);
    } else if (result.caption) {
      setCaption(result.caption);
    }
    setGeneratingCaption(false);
  }

  async function handleCopyCaption() {
    await navigator.clipboard.writeText(caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="submission">
      <div className="top">
        <div>
          <div className="name">{testimonial.client_name}</div>
          <div className="stars-small">
            {"★".repeat(testimonial.rating)}
            {"☆".repeat(5 - testimonial.rating)}
          </div>
        </div>
        <span
          className={`status-badge status-${
            testimonial.status === "pending" ? "pendente" : "aprovado"
          }`}
        >
          {testimonial.status === "pending" ? "pendente" : "aprovado"}
        </span>
      </div>
      <div className="text">&quot;{testimonial.body}&quot;</div>

      {testimonial.status === "pending" && (
        <>
          {testimonial.screenshotUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- print de referência interno, não precisa de otimização do next/image
            <img
              className="upload-preview"
              src={testimonial.screenshotUrl}
              alt="Print enviado pelo cliente"
            />
          )}
          <div className="actions">
            <button
              className="btn-approve"
              disabled={pending}
              onClick={() =>
                startTransition(() => approveTestimonial(testimonial.id))
              }
            >
              ✓ Aprovar
            </button>
            <button
              className="btn-reject"
              disabled={pending}
              onClick={() =>
                startTransition(() => rejectTestimonial(testimonial.id))
              }
            >
              ✕ Rejeitar
            </button>
          </div>
        </>
      )}

      {testimonial.status === "approved" && (
        <>
          <div style={{ display: "flex", justifyContent: "center", margin: "14px 0" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- prévia gerada pela nossa própria rota autenticada */}
            <img
              src={cardUrl("feed")}
              alt={`Prévia do card de ${businessName} no estilo ${CARD_STYLES[selectedStyle].label}`}
              style={{ maxWidth: 280, width: "100%", borderRadius: 12 }}
            />
          </div>

          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 0, marginBottom: 6 }}>
            Estilo do card
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {Object.values(CARD_STYLES).map((style) => (
              <button
                key={style.id}
                type="button"
                onClick={() => handleSelectStyle(style.id)}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  padding: 0,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  opacity: selectedStyle === style.id ? 1 : 0.6,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element -- miniatura gerada pela nossa própria rota autenticada */}
                <img
                  src={`/api/testimonials/${testimonial.id}/card?formato=feed&estilo=${style.id}&v=${cacheBust}`}
                  alt={`Estilo ${style.label}`}
                  width={64}
                  height={64}
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: "cover",
                    borderRadius: 10,
                    border:
                      selectedStyle === style.id
                        ? "2px solid var(--accent, #7c3aed)"
                        : "2px solid transparent",
                  }}
                />
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{style.label}</span>
              </button>
            ))}
          </div>

          <div className="actions">
            <a className="btn-download" href={cardUrl("feed")} download>
              ⬇ Feed
            </a>
            <a className="btn-download" href={cardUrl("stories")} download>
              ⬇ Stories
            </a>
            <a className="btn-download" href={cardUrl("google")} download>
              ⬇ Google
            </a>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, marginBottom: 4 }}>
            Carrossel pro Instagram (baixe os 2 slides):
          </p>
          <div className="actions">
            <a className="btn-download" href={cardUrl("feed")} download>
              ⬇ Slide 1 — depoimento
            </a>
            <a
              className="btn-download"
              href={`/api/qrcode?formato=carrossel&estilo=${selectedStyle}&v=${cacheBust}`}
              download
            >
              ⬇ Slide 2 — convite
            </a>
          </div>

          <div style={{ marginTop: 14 }}>
            <label htmlFor={`caption-${testimonial.id}`}>Legenda sugerida (IA)</label>
            {caption ? (
              <>
                <textarea
                  id={`caption-${testimonial.id}`}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  rows={4}
                />
                {captionError && (
                  <div className="error-msg" style={{ marginTop: 8 }}>
                    {captionError}
                  </div>
                )}
                <div className="actions" style={{ marginTop: 8 }}>
                  <button type="button" className="btn-download" onClick={handleCopyCaption}>
                    {copied ? "Copiado!" : "⬇ Copiar legenda"}
                  </button>
                  <button
                    type="button"
                    className="btn-download"
                    onClick={handleGenerateCaption}
                    disabled={generatingCaption}
                  >
                    {generatingCaption ? "Gerando..." : "↻ Gerar de novo"}
                  </button>
                </div>
              </>
            ) : (
              <>
                {captionError && (
                  <div className="error-msg" style={{ marginBottom: 8 }}>
                    {captionError}
                  </div>
                )}
                <button
                  type="button"
                  className="primary"
                  onClick={handleGenerateCaption}
                  disabled={generatingCaption}
                >
                  {generatingCaption ? "Gerando..." : "✨ Gerar legenda com IA"}
                </button>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
