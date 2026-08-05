"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateQrBackgroundPath, updateQrBandStyle, updateQrHeadline } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LoadingButton } from "./LoadingButton";
import { DownloadButton } from "./DownloadButton";
import { ImageUploadField } from "./ImageUploadField";
import { cn } from "@/lib/utils";

type Props = {
  businessId: string;
  headline: string;
  qrBackgroundPath: string | null;
  qrBandStyle: "light" | "dark";
};

export default function QrCodePanel({
  businessId,
  headline,
  qrBackgroundPath,
  qrBandStyle,
}: Props) {
  const [headlineDraft, setHeadlineDraft] = useState(headline);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);

  const [hasBackground, setHasBackground] = useState(!!qrBackgroundPath);
  const [bandStyle, setBandStyle] = useState(qrBandStyle);
  const [savingBand, setSavingBand] = useState(false);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateQrHeadline(headlineDraft);
      setCacheBust((v) => v + 1);
      toast.success("Texto da plaquinha salvo!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSelectBand(next: "light" | "dark") {
    if (next === bandStyle) return;
    setSavingBand(true);
    try {
      await updateQrBandStyle(next);
      setBandStyle(next);
      setCacheBust((v) => v + 1);
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSavingBand(false);
    }
  }

  const plaquinhaUrl = `/api/qrcode?formato=plaquinha&v=${cacheBust}`;
  const puroUrl = `/api/qrcode?formato=puro&v=${cacheBust}`;

  return (
    <Card>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element -- prévia gerada pela nossa própria rota autenticada */}
          <img
            src={plaquinhaUrl}
            alt="Prévia da plaquinha com QR code"
            className="w-full max-w-[280px] rounded-xl"
          />
        </div>

        <div className="flex gap-2">
          <DownloadButton href={plaquinhaUrl} fallbackFilename="plaquinha.png" className="flex-1">
            ⬇ Baixar plaquinha
          </DownloadButton>
          <DownloadButton href={puroUrl} fallbackFilename="qrcode.png" className="flex-1">
            ⬇ Baixar QR code puro
          </DownloadButton>
        </div>

        <div className="space-y-3 border-t pt-4">
          <ImageUploadField
            businessId={businessId}
            currentPath={qrBackgroundPath}
            prefix="qr-fundo"
            aspect="wide"
            label="Foto de fundo da plaquinha"
            helpText="Opcional. O QR code ganha uma faixa sólida atrás pra continuar fácil de escanear."
            onSave={async (newPath, oldPath) => {
              await updateQrBackgroundPath(newPath, oldPath);
              setHasBackground(!!newPath);
              setCacheBust((v) => v + 1);
            }}
          />

          {hasBackground && (
            <div className="space-y-1.5">
              <p className="text-sm font-medium">Faixa atrás do QR code</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={bandStyle === "light" ? "default" : "outline"}
                  size="sm"
                  disabled={savingBand}
                  onClick={() => handleSelectBand("light")}
                  className={cn(bandStyle === "light" && "pointer-events-none")}
                >
                  Clara
                </Button>
                <Button
                  type="button"
                  variant={bandStyle === "dark" ? "default" : "outline"}
                  size="sm"
                  disabled={savingBand}
                  onClick={() => handleSelectBand("dark")}
                  className={cn(bandStyle === "dark" && "pointer-events-none")}
                >
                  Escura
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Escolha a que fizer mais contraste com a sua foto — QR code com pouco contraste
                falha na leitura.
              </p>
            </div>
          )}
        </div>

        <details className="group">
          <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
            Personalizar texto da plaquinha
          </summary>
          <form onSubmit={handleSave} className="mt-3 space-y-2">
            <Label htmlFor="qrHeadline">Chamada no topo da plaquinha</Label>
            <Input
              id="qrHeadline"
              type="text"
              value={headlineDraft}
              onChange={(e) => setHeadlineDraft(e.target.value)}
            />
            <LoadingButton type="submit" loading={saving} loadingText="Salvando...">
              {saved ? "Salvo!" : "Salvar texto"}
            </LoadingButton>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}
