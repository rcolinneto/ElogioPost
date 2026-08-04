"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex gap-2">
      <Input type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
      <Button type="button" variant="secondary" onClick={copy} className="shrink-0">
        {copied ? <Check /> : <Copy />}
        {copied ? "Copiado" : "Copiar"}
      </Button>
    </div>
  );
}
