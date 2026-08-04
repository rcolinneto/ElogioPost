"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { updateCarouselCta } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "./LoadingButton";

export default function CarouselCtaEditor({ text }: { text: string }) {
  const [draft, setDraft] = useState(text);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await updateCarouselCta(draft);
      toast.success("Texto do carrossel salvo!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error("Não deu pra salvar agora. Tenta de novo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <details className="group">
      <summary className="cursor-pointer text-xs font-semibold text-muted-foreground">
        Personalizar texto do carrossel (slide 2)
      </summary>
      <form onSubmit={handleSave} className="mt-3 space-y-2">
        <Label htmlFor="carouselCta">Chamada no slide de convite</Label>
        <Input
          id="carouselCta"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <LoadingButton type="submit" loading={saving} loadingText="Salvando...">
          {saved ? "Salvo!" : "Salvar texto"}
        </LoadingButton>
      </form>
    </details>
  );
}
