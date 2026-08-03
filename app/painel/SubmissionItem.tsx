"use client";

import { useTransition } from "react";
import type { Testimonial } from "@/lib/types";
import TestimonialCard from "@/components/TestimonialCard";
import { approveTestimonial, rejectTestimonial } from "./actions";

type Props = {
  testimonial: Testimonial & { screenshotUrl: string | null };
  businessName: string;
};

export default function SubmissionItem({ testimonial, businessName }: Props) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="submission">
      <div className="top">
        <div>
          <div className="name">{testimonial.client_name}</div>
          <div className="stars-small">
            {"★".repeat(testimonial.rating)}
            {"☆".repeat(5 - testimonial.rating)}
          </div>
        </div>
        <span
          className={`status-badge status-${
            testimonial.status === "pending" ? "pendente" : "aprovado"
          }`}
        >
          {testimonial.status === "pending" ? "pendente" : "aprovado"}
        </span>
      </div>
      <div className="text">&quot;{testimonial.body}&quot;</div>

      {testimonial.status === "pending" && (
        <>
          {testimonial.screenshotUrl && (
            // eslint-disable-next-line @next/next/no-img-element -- print de referência interno, não precisa de otimização do next/image
            <img
              className="upload-preview"
              src={testimonial.screenshotUrl}
              alt="Print enviado pelo cliente"
            />
          )}
          <div className="actions">
            <button
              className="btn-approve"
              disabled={pending}
              onClick={() =>
                startTransition(() => approveTestimonial(testimonial.id))
              }
            >
              ✓ Aprovar
            </button>
            <button
              className="btn-reject"
              disabled={pending}
              onClick={() =>
                startTransition(() => rejectTestimonial(testimonial.id))
              }
            >
              ✕ Rejeitar
            </button>
          </div>
        </>
      )}

      {testimonial.status === "approved" && (
        <>
          <TestimonialCard testimonial={testimonial} businessName={businessName} />
          <a
            className="btn-download"
            href={`/api/testimonials/${testimonial.id}/card`}
            download
          >
            ⬇ Baixar imagem pra postar
          </a>
        </>
      )}
    </div>
  );
}
