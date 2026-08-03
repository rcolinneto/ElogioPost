"use client";

import { useState, useTransition, type FormEvent } from "react";
import { updateCarouselCta } from "./actions";

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
    <details style={{ marginBottom: 18 }}>
      <summary
        style={{ cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--muted)" }}
      >
        Personalizar texto do carrossel (slide 2)
      </summary>
      <form onSubmit={handleSave} style={{ marginTop: 10 }}>
        <label htmlFor="carouselCta">Chamada no slide de convite</label>
        <input
          id="carouselCta"
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
        />
        <button className="primary" type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : saved ? "Salvo!" : "Salvar texto"}
        </button>
      </form>
    </details>
  );
}
