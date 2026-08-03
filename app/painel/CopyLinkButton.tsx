"use client";

import { useState } from "react";

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <input type="text" readOnly value={url} onFocus={(e) => e.target.select()} />
      <button
        type="button"
        className="primary"
        style={{ width: "auto", marginTop: 0, whiteSpace: "nowrap" }}
        onClick={copy}
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
