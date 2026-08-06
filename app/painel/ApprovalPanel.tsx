"use client";

import { Inbox } from "lucide-react";
import type { Testimonial } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmissionItem from "./SubmissionItem";
import ApprovedLibrary from "./ApprovedLibrary";
import CarouselCtaEditor from "./CarouselCtaEditor";
import { EmptyState } from "./EmptyState";

type Props = {
  pendingTestimonials: (Testimonial & { screenshotUrl: string | null })[];
  businessId: string;
  businessName: string;
  carouselCtaText: string;
  defaultCardStyle: string;
  googlePlaceId: string | null;
  isPaid: boolean;
  atFreeLimit: boolean;
};

export default function ApprovalPanel({
  pendingTestimonials,
  businessId,
  businessName,
  carouselCtaText,
  defaultCardStyle,
  googlePlaceId,
  isPaid,
  atFreeLimit,
}: Props) {
  return (
    <Tabs defaultValue="pendentes">
      <TabsList>
        <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
        <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
      </TabsList>

      <TabsContent value="pendentes" className="space-y-3 pt-4">
        {pendingTestimonials.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="Nenhum depoimento pendente"
            description="Peça pros seus clientes deixarem um depoimento — assim que eles enviarem, aparece aqui pra você aprovar."
            action={{ label: "Pedir depoimento", href: "/painel/pedir" }}
          />
        ) : (
          pendingTestimonials.map((t) => (
            <SubmissionItem
              key={t.id}
              testimonial={t}
              businessName={businessName}
              defaultCardStyle={defaultCardStyle}
              googlePlaceId={googlePlaceId}
              isPaid={isPaid}
              atFreeLimit={atFreeLimit}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="aprovados" className="space-y-4 pt-4">
        <CarouselCtaEditor text={carouselCtaText} />
        <ApprovedLibrary
          businessId={businessId}
          businessName={businessName}
          defaultCardStyle={defaultCardStyle}
          googlePlaceId={googlePlaceId}
          isPaid={isPaid}
        />
      </TabsContent>
    </Tabs>
  );
}
