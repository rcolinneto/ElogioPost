"use client";

import { useState } from "react";
import type { Testimonial } from "@/lib/types";
import SubmissionItem from "./SubmissionItem";
import ApprovedLibrary from "./ApprovedLibrary";

type Props = {
  pendingTestimonials: (Testimonial & { screenshotUrl: string | null })[];
  businessId: string;
  businessName: string;
};

type Tab = "pendentes" | "aprovados";

export default function ApprovalPanel({
  pendingTestimonials,
  businessId,
  businessName,
}: Props) {
  const [tab, setTab] = useState<Tab>("pendentes");

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

      {tab === "pendentes" &&
        (pendingTestimonials.length === 0 ? (
          <div className="empty">Nada por aqui ainda.</div>
        ) : (
          pendingTestimonials.map((t) => (
            <SubmissionItem key={t.id} testimonial={t} businessName={businessName} />
          ))
        ))}

      {tab === "aprovados" && (
        <ApprovedLibrary businessId={businessId} businessName={businessName} />
      )}
    </>
  );
}
