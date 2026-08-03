type Props = {
  testimonial: { client_name: string; rating: number; body: string };
  businessName: string;
};

export default function TestimonialCard({ testimonial, businessName }: Props) {
  return (
    <div className="card-wrap">
      <div className="ig-card">
        <div className="quote-mark">&ldquo;</div>
        <div className="quote-text">{testimonial.body}</div>
        <div className="footer">
          <div>
            <div className="client-name">{testimonial.client_name}</div>
            <div className="biz-tag">via {businessName}</div>
          </div>
          <div className="stars-row">{"★".repeat(testimonial.rating)}</div>
        </div>
      </div>
    </div>
  );
}
