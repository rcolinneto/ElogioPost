import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getInitials } from "@/lib/text";

export type PublicTestimonial = {
  id: string;
  client_name: string;
  rating: number;
  body: string;
  created_at: string;
};

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={i < rating ? "size-4 fill-amber-400 text-amber-400" : "size-4 text-neutral-200"}
        />
      ))}
    </div>
  );
}

export function PublicTestimonialCard({ testimonial }: { testimonial: PublicTestimonial }) {
  const date = new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(testimonial.created_at));

  return (
    <Card className="h-full">
      <CardContent className="flex h-full flex-col gap-3">
        <Stars rating={testimonial.rating} />
        <p className="flex-1 text-sm leading-relaxed text-foreground/80">
          &quot;{testimonial.body}&quot;
        </p>
        <div className="flex items-center gap-2.5 border-t pt-3">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {getInitials(testimonial.client_name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{testimonial.client_name}</p>
            <p className="text-xs text-muted-foreground">{date}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
