"use client";

import { useState, type ReactNode } from "react";

const TABS = [
  {
    key: "depoimentos",
    label: "Depoimentos",
    title: "Depoimentos",
    description: "Aprove os depoimentos recebidos e baixe os cards prontos pra postar.",
  },
  {
    key: "pedir",
    label: "Pedir depoimento",
    title: "Pedir depoimento",
    description: "Gere uma mensagem pronta com o nome do cliente pra mandar no WhatsApp.",
  },
  {
    key: "qrcode",
    label: "QR Code",
    title: "QR Code",
    description: "Baixe a plaquinha pra deixar no balcão do seu negócio.",
  },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function PainelTabs({
  depoimentos,
  pedir,
  qrcode,
}: {
  depoimentos: ReactNode;
  pedir: ReactNode;
  qrcode: ReactNode;
}) {
  const [tab, setTab] = useState<TabKey>("depoimentos");
  const active = TABS.find((t) => t.key === tab)!;
  const content = { depoimentos, pedir, qrcode }[tab];

  return (
    <>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? "active" : ""}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="card-panel">
        <h2>{active.title}</h2>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 0 }}>
          {active.description}
        </p>
        {content}
      </div>
    </>
  );
}
