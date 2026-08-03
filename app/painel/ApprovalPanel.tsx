"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types";
import SubmissionItem from "./SubmissionItem";

type Props = {
  testimonials: (Testimonial & { screenshotUrl: string | null })[];
  businessName: string;
};

type Tab = "pendentes" | "aprovados";

export default function ApprovalPanel({ testimonials, businessName }: Props) {
  const [tab, setTab] = useState<Tab>("pendentes");

  const filtered = testimonials.filter((t) =>
    tab === "pendentes" ? t.status === "pending" : t.status === "approved",
  );

  return (
    <>
      <div className="tabs">
        <button
          className={tab === "pendentes" ? "active" : ""}
          onClick={() => setTab("pendentes")}
        >
          Pendentes
        </button>
        <button
          className={tab === "aprovados" ? "active" : ""}
          onClick={() => setTab("aprovados")}
        >
          Aprovados
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="empty">Nada por aqui ainda.</div>
      ) : (
        filtered.map((t) => (
          <SubmissionItem key={t.id} testimonial={t} businessName={businessName} />
        ))
      )}
    </>
  );
}
