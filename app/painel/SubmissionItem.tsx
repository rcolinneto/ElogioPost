"use client";

import { useState, useTransition } from "react";
import type { Testimonial } from "@/lib/types";
import { CARD_STYLES, type CardStyleId } from "@/lib/cardStyles";
import { approveTestimonial, rejectTestimonial, updateCardStyle } from "./actions";
import { generateCaption } from "./captionActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Props = {
  testimonial: Testimonial & { screenshotUrl: string | null };
  businessName: string;
  defaultCardStyle: string;
};

function isCardStyleId(value: string): value is CardStyleId {
  return value in CARD_STYLES;
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-sm text-amber-500">
      {"★".repeat(rating)}
      <span className="text-muted-foreground/40">{"★".repeat(5 - rating)}</span>
    </span>
  );
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
    <Card>
      <CardContent className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-sm font-semibold">{testimonial.client_name}</p>
            <Stars rating={testimonial.rating} />
          </div>
          <Badge
            className={
              testimonial.status === "pending"
                ? "bg-amber-100 text-amber-800"
                : "bg-green-100 text-green-800"
            }
          >
            {testimonial.status === "pending" ? "pendente" : "aprovado"}
          </Badge>
        </div>

        <p className="text-sm text-foreground/80">&quot;{testimonial.body}&quot;</p>

        {testimonial.status === "pending" && (
          <>
            {testimonial.screenshotUrl && (
              // eslint-disable-next-line @next/next/no-img-element -- print de referência interno, não precisa de otimização do next/image
              <img
                className="max-w-full rounded-lg"
                src={testimonial.screenshotUrl}
                alt="Print enviado pelo cliente"
              />
            )}
            <div className="flex gap-2">
              <Button
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                disabled={pending}
                onClick={() => startTransition(() => approveTestimonial(testimonial.id))}
              >
                ✓ Aprovar
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                disabled={pending}
                onClick={() => startTransition(() => rejectTestimonial(testimonial.id))}
              >
                ✕ Rejeitar
              </Button>
            </div>
          </>
        )}

        {testimonial.status === "approved" && (
          <>
            <div className="flex justify-center py-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- prévia gerada pela nossa própria rota autenticada */}
              <img
                src={cardUrl("feed")}
                alt={`Prévia do card de ${businessName} no estilo ${CARD_STYLES[selectedStyle].label}`}
                className="w-full max-w-[280px] rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Estilo do card</p>
              <div className="flex gap-2.5">
                {Object.values(CARD_STYLES).map((style) => (
                  <button
                    key={style.id}
                    type="button"
                    onClick={() => handleSelectStyle(style.id)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element -- miniatura gerada pela nossa própria rota autenticada */}
                    <img
                      src={`/api/testimonials/${testimonial.id}/card?formato=feed&estilo=${style.id}&v=${cacheBust}`}
                      alt={`Estilo ${style.label}`}
                      width={64}
                      height={64}
                      className={cn(
                        "size-16 rounded-lg object-cover ring-2 ring-offset-2 ring-offset-background transition-opacity",
                        selectedStyle === style.id
                          ? "ring-primary opacity-100"
                          : "ring-transparent opacity-60",
                      )}
                    />
                    <span className="text-[11px] text-muted-foreground">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button asChild variant="secondary" className="flex-1">
                <a href={cardUrl("feed")} download>
                  ⬇ Feed
                </a>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <a href={cardUrl("stories")} download>
                  ⬇ Stories
                </a>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <a href={cardUrl("google")} download>
                  ⬇ Google
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Carrossel pro Instagram (baixe os 2 slides):
            </p>
            <div className="flex gap-2">
              <Button asChild variant="secondary" className="flex-1">
                <a href={cardUrl("feed")} download>
                  ⬇ Slide 1 — depoimento
                </a>
              </Button>
              <Button asChild variant="secondary" className="flex-1">
                <a
                  href={`/api/qrcode?formato=carrossel&estilo=${selectedStyle}&v=${cacheBust}`}
                  download
                >
                  ⬇ Slide 2 — convite
                </a>
              </Button>
            </div>

            <div className="space-y-2 pt-1">
              <Label htmlFor={`caption-${testimonial.id}`}>Legenda sugerida (IA)</Label>
              {caption ? (
                <>
                  <Textarea
                    id={`caption-${testimonial.id}`}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    rows={4}
                  />
                  {captionError && (
                    <p className="text-sm text-destructive">{captionError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={handleCopyCaption}
                    >
                      {copied ? "Copiado!" : "⬇ Copiar legenda"}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      onClick={handleGenerateCaption}
                      disabled={generatingCaption}
                    >
                      {generatingCaption ? "Gerando..." : "↻ Gerar de novo"}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {captionError && (
                    <p className="text-sm text-destructive">{captionError}</p>
                  )}
                  <Button
                    type="button"
                    onClick={handleGenerateCaption}
                    disabled={generatingCaption}
                  >
                    {generatingCaption ? "Gerando..." : "✨ Gerar legenda com IA"}
                  </Button>
                </>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
