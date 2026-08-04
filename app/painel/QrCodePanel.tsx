"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateQrHeadline } from "./actions";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function QrCodePanel({ headline }: { headline: string }) {
  const [headlineDraft, setHeadlineDraft] = useState(headline);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [cacheBust, setCacheBust] = useState(0);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      await updateQrHeadline(headlineDraft);
      setCacheBust((v) => v + 1);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
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
          <Button asChild variant="secondary" className="flex-1">
            <a href={plaquinhaUrl} download>
              ⬇ Baixar plaquinha
            </a>
          </Button>
          <Button asChild variant="secondary" className="flex-1">
            <a href={puroUrl} download>
              ⬇ Baixar QR code puro
            </a>
          </Button>
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar texto"}
            </Button>
          </form>
        </details>
      </CardContent>
    </Card>
  );
}
