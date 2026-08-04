"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateQrHeadline } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "./LoadingButton";
import { DownloadButton } from "./DownloadButton";

export default function QrCodePanel({ headline }: { headline: string }) {
  const [headlineDraft, setHeadlineDraft] = useState(headline);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);

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
