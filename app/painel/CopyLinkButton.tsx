"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Check, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "./LoadingButton";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);

  async function copy() {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copiado!");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Não deu pra copiar. Seleciona o link manualmente.");
    } finally {
      setCopying(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Input type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
      <LoadingButton
        type="button"
        variant="secondary"
        onClick={copy}
        loading={copying}
        className="shrink-0"
      >
        {copied ? <Check /> : <Copy />}
        {copied ? "Copiado" : "Copiar"}
      </LoadingButton>
    </div>
  );
}
