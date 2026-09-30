export function RatingStars({
  value,
  size = 14,
}: {
  value: number;
  size?: number;
}) {
  const clamped = Math.max(0, Math.min(5, value));
  const full = Math.round(clamped);
  return (
    <span
      className="inline-flex items-center gap-[1px] align-middle"
      aria-label={`Rated ${clamped} out of 5 stars`}
      style={{ fontSize: size }}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={i <= full ? "text-[#DE7921]" : "text-[#D5D9D9]"}>
          ★
        </span>
      ))}
    </span>
  );
}
