"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import StarRating from "@/components/StarRating";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function CollectionForm({ businessId }: { businessId: string }) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [body, setBody] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [website, setWebsite] = useState(""); // honeypot: campo invisível, só bots preenchem
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0] ?? null;
    if (selected && selected.size > MAX_FILE_SIZE) {
      setErrorMsg("A imagem precisa ter no máximo 5MB.");
      e.target.value = "";
      setFile(null);
      return;
    }
    setErrorMsg("");
    setFile(selected);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (website.trim()) {
      // preenchido só por bots — finge sucesso sem gravar nada
      setStatus("sent");
      return;
    }

    if (!name.trim() || !body.trim()) {
      setErrorMsg("Preencha seu nome e o depoimento antes de enviar.");
      return;
    }
    if (rating === 0) {
      setErrorMsg("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    const supabase = createClient();
    let screenshotPath: string | null = null;

    if (file) {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${businessId}/${crypto.randomUUID()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from("whatsapp-screenshots")
        .upload(path, file);

      if (uploadError) {
        setStatus("error");
        setErrorMsg(
          "Não deu pra enviar o print. Tenta de novo, ou envie sem o print.",
        );
        return;
      }
      screenshotPath = path;
    }

    const { error: insertError } = await supabase.from("testimonials").insert({
      business_id: businessId,
      client_name: name.trim(),
      rating,
      body: body.trim(),
      screenshot_path: screenshotPath,
      status: "pending",
    });

    if (insertError) {
      setStatus("error");
      setErrorMsg("Não deu pra enviar seu depoimento agora. Tenta de novo.");
      return;
    }

    setStatus("sent");
    setName("");
    setRating(0);
    setBody("");
    setFile(null);
  }

  if (status === "sent") {
    return (
      <div className="card-panel">
        <div className="success-msg">
          Obrigado! Seu depoimento foi enviado e já está com o time pra
          aprovação. 🎉
        </div>
      </div>
    );
  }

  return (
    <div className="card-panel">
      <h2>Deixe seu depoimento ✨</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{
            position: "absolute",
            left: "-9999px",
            width: 1,
            height: 1,
            opacity: 0,
          }}
        />

        <label htmlFor="nome">Seu nome</label>
        <input
          id="nome"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex: Mariana Souza"
        />

        <label>Sua avaliação</label>
        <StarRating value={rating} onChange={setRating} />

        <label htmlFor="texto">Conte como foi sua experiência</label>
        <textarea
          id="texto"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Ex: Atendimento incrível, super recomendo!"
        />

        <label htmlFor="arquivo">Print da conversa (opcional)</label>
        <input
          id="arquivo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />

        {errorMsg && (
          <div className="error-msg" style={{ marginTop: 14 }}>
            {errorMsg}
          </div>
        )}

        <button className="primary" type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Enviando..." : "Enviar depoimento"}
        </button>
      </form>
    </div>
  );
}
