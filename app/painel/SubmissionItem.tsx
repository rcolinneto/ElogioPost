"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { CARD_STYLES, type CardStyleId } from "@/lib/cardStyles";
import { approveTestimonial, logCardGeneration, rejectTestimonial, updateCardStyle } from "./actions";
import { generateCaption } from "./captionActions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { LoadingButton } from "./LoadingButton";
import { DownloadButton } from "./DownloadButton";

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

type ReviewAction = "approving" | "rejecting" | null;

export default function SubmissionItem({ testimonial, businessName, defaultCardStyle }: Props) {
  const [reviewAction, setReviewAction] = useState<ReviewAction>(null);

  const [caption, setCaption] = useState(testimonial.caption ?? "");
  const [generatingCaption, setGeneratingCaption] = useState(false);
  const [copyingCaption, setCopyingCaption] = useState(false);

  const [selectedStyle, setSelectedStyle] = useState<CardStyleId>(
    isCardStyleId(defaultCardStyle) ? defaultCardStyle : "moderno",
  );
  const [switchingStyle, setSwitchingStyle] = useState<CardStyleId | null>(null);
  const [cacheBust, setCacheBust] = useState(0);

  async function handleApprove() {
    setReviewAction("approving");
    try {
      await approveTestimonial(testimonial.id);
      toast.success("Depoimento aprovado!");
    } catch {
      toast.error("Não deu pra aprovar agora. Tenta de novo.");
    } finally {
      setReviewAction(null);
    }
  }

  async function handleReject() {
    setReviewAction("rejecting");
    try {
      await rejectTestimonial(testimonial.id);
      toast("Depoimento rejeitado.");
    } catch {
      toast.error("Não deu pra rejeitar agora. Tenta de novo.");
    } finally {
      setReviewAction(null);
    }
  }

  async function handleSelectStyle(styleId: CardStyleId) {
    if (styleId === selectedStyle || switchingStyle) return;
    setSwitchingStyle(styleId);
    try {
      await updateCardStyle(styleId);
      setSelectedStyle(styleId);
      setCacheBust((v) => v + 1);
    } catch {
      toast.error("Não deu pra trocar o estilo agora. Tenta de novo.");
    } finally {
      setSwitchingStyle(null);
    }
  }

  const cardUrl = (formato: "feed" | "stories" | "google") =>
    `/api/testimonials/${testimonial.id}/card?formato=${formato}&estilo=${selectedStyle}&v=${cacheBust}`;

  async function handleGenerateCaption() {
    setGeneratingCaption(true);
    const result = await generateCaption(testimonial.id);
    if (result.error) {
      toast.error(result.error);
    } else if (result.caption) {
      setCaption(result.caption);
    }
    setGeneratingCaption(false);
  }

  async function handleCopyCaption() {
    setCopyingCaption(true);
    try {
      await navigator.clipboard.writeText(caption);
      toast.success("Legenda copiada!");
    } catch {
      toast.error("Não deu pra copiar. Seleciona o texto manualmente.");
    } finally {
      setCopyingCaption(false);
    }
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
              <LoadingButton
                className="flex-1 bg-green-600 text-white hover:bg-green-700"
                loading={reviewAction === "approving"}
                loadingText="Aprovando..."
                disabled={reviewAction !== null}
                onClick={handleApprove}
              >
                ✓ Aprovar
              </LoadingButton>
              <LoadingButton
                variant="destructive"
                className="flex-1"
                loading={reviewAction === "rejecting"}
                loadingText="Rejeitando..."
                disabled={reviewAction !== null}
                onClick={handleReject}
              >
                ✕ Rejeitar
              </LoadingButton>
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
                    disabled={switchingStyle !== null}
                    className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
                  >
                    <div className="relative">
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
                          switchingStyle === style.id && "opacity-40",
                        )}
                      />
                      {switchingStyle === style.id && (
                        <Loader2 className="absolute inset-0 m-auto size-5 animate-spin text-primary" />
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground">{style.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <DownloadButton
                href={cardUrl("feed")}
                fallbackFilename={`depoimento-${testimonial.client_name}-feed.png`}
                className="flex-1"
                onDownloaded={() => logCardGeneration(testimonial.id, "feed")}
              >
                ⬇ Feed
              </DownloadButton>
              <DownloadButton
                href={cardUrl("stories")}
                fallbackFilename={`depoimento-${testimonial.client_name}-stories.png`}
                className="flex-1"
                onDownloaded={() => logCardGeneration(testimonial.id, "stories")}
              >
                ⬇ Stories
              </DownloadButton>
              <DownloadButton
                href={cardUrl("google")}
                fallbackFilename={`depoimento-${testimonial.client_name}-google.png`}
                className="flex-1"
                onDownloaded={() => logCardGeneration(testimonial.id, "google")}
              >
                ⬇ Google
              </DownloadButton>
            </div>

            <p className="text-xs text-muted-foreground">
              Carrossel pro Instagram (baixe os 2 slides):
            </p>
            <div className="flex gap-2">
              <DownloadButton
                href={cardUrl("feed")}
                fallbackFilename={`depoimento-${testimonial.client_name}-feed.png`}
                className="flex-1"
                onDownloaded={() => logCardGeneration(testimonial.id, "carrossel-slide1")}
              >
                ⬇ Slide 1 — depoimento
              </DownloadButton>
              <DownloadButton
                href={`/api/qrcode?formato=carrossel&estilo=${selectedStyle}&v=${cacheBust}`}
                fallbackFilename="carrossel-slide2.png"
                className="flex-1"
                onDownloaded={() => logCardGeneration(testimonial.id, "carrossel-slide2")}
              >
                ⬇ Slide 2 — convite
              </DownloadButton>
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
                  <div className="flex gap-2">
                    <LoadingButton
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      loading={copyingCaption}
                      onClick={handleCopyCaption}
                    >
                      ⬇ Copiar legenda
                    </LoadingButton>
                    <LoadingButton
                      type="button"
                      variant="secondary"
                      className="flex-1"
                      loading={generatingCaption}
                      loadingText="Gerando..."
                      onClick={handleGenerateCaption}
                    >
                      ↻ Gerar de novo
                    </LoadingButton>
                  </div>
                </>
              ) : (
                <LoadingButton
                  type="button"
                  loading={generatingCaption}
                  loadingText="Gerando..."
                  onClick={handleGenerateCaption}
                >
                  ✨ Gerar legenda com IA
                </LoadingButton>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
