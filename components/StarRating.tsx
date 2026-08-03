"use client";

type Props = {
  value: number;
  onChange: (value: number) => void;
};

export default function StarRating({ value, onChange }: Props) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={n <= value ? "filled" : ""}
          onClick={() => onChange(n)}
          aria-label={`${n} estrela${n > 1 ? "s" : ""}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}
