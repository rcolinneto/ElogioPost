"use client";

import type { Testimonial } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SubmissionItem from "./SubmissionItem";
import ApprovedLibrary from "./ApprovedLibrary";
import CarouselCtaEditor from "./CarouselCtaEditor";

type Props = {
  pendingTestimonials: (Testimonial & { screenshotUrl: string | null })[];
  businessId: string;
  businessName: string;
  carouselCtaText: string;
  defaultCardStyle: string;
};

export default function ApprovalPanel({
  pendingTestimonials,
  businessId,
  businessName,
  carouselCtaText,
  defaultCardStyle,
}: Props) {
  return (
    <Tabs defaultValue="pendentes">
      <TabsList>
        <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
        <TabsTrigger value="aprovados">Aprovados</TabsTrigger>
      </TabsList>

      <TabsContent value="pendentes" className="space-y-3 pt-4">
        {pendingTestimonials.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            Nada por aqui ainda.
          </p>
        ) : (
          pendingTestimonials.map((t) => (
            <SubmissionItem
              key={t.id}
              testimonial={t}
              businessName={businessName}
              defaultCardStyle={defaultCardStyle}
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
        />
      </TabsContent>
    </Tabs>
  );
}
