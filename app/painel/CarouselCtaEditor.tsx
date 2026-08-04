"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateCarouselCta } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CarouselCtaEditor({ text }: { text: string }) {
  const [draft, setDraft] = useState(text);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave(event: FormEvent) {
    event.preventDefault();
    startTransition(async () => {
      await updateCarouselCta(draft);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
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
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar texto"}
        </Button>
      </form>
    </details>
  );
}
