"use client";

import { useState, useTransition } from "react";
import type { Testimonial } from "@/lib/types";
import TestimonialCard from "@/components/TestimonialCard";
import { approveTestimonial, rejectTestimonial } from "./actions";
import { generateCaption } from "./captionActions";

type Props = {
  testimonial: Testimonial & { screenshotUrl: string | null };
  businessName: string;
};

export default function SubmissionItem({ testimonial, businessName }: Props) {
  const [pending, startTransition] = useTransition();

  const [caption, setCaption] = useState(testimonial.caption ?? "");
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [captionError, setCaptionError] = useState("");
  const [copied, setCopied] = useState(false);

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
          <TestimonialCard testimonial={testimonial} businessName={businessName} />
          <div className="actions">
            <a
              className="btn-download"
              href={`/api/testimonials/${testimonial.id}/card?formato=feed`}
              download
            >
              ⬇ Feed
            </a>
            <a
              className="btn-download"
              href={`/api/testimonials/${testimonial.id}/card?formato=stories`}
              download
            >
              ⬇ Stories
            </a>
            <a
              className="btn-download"
              href={`/api/testimonials/${testimonial.id}/card?formato=google`}
              download
            >
              ⬇ Google
            </a>
          </div>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 12, marginBottom: 4 }}>
            Carrossel pro Instagram (baixe os 2 slides):
          </p>
          <div className="actions">
            <a
              className="btn-download"
              href={`/api/testimonials/${testimonial.id}/card?formato=feed`}
              download
            >
              ⬇ Slide 1 — depoimento
            </a>
            <a className="btn-download" href="/api/qrcode?formato=carrossel" download>
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
