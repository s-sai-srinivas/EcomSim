export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-block leading-none ${className}`} aria-label="EcoMart.in">
      <span className="text-[26px] font-bold tracking-tight text-white">EcoMart</span>
      <span className="text-[26px] font-bold text-white">.</span>
      <span className="absolute -top-[3px] text-[11px] font-normal text-white">in</span>
      <svg
        viewBox="0 0 90 18"
        aria-hidden
        className="absolute -bottom-[7px] left-1 h-[14px] w-[68px]"
      >
        <path
          d="M2 4 C 22 16, 62 16, 82 5"
          fill="none"
          stroke="#FF9900"
          strokeWidth="3.4"
          strokeLinecap="round"
        />
        <path d="M82 5 L 88 2.4 L 84.6 9.4 Z" fill="#FF9900" />
      </svg>
    </span>
  );
}
