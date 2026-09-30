interface IconProps {
  className?: string;
}

export function MagnifierIcon({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" className={className} aria-hidden>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ className = "h-3.5 w-3.5" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5A2.5 2.5 0 1 1 12 6a2.5 2.5 0 0 1 0 5.5z" />
    </svg>
  );
}

export function CartIcon({ className = "h-9 w-9" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className={className} aria-hidden>
      <path d="M1.5 3h2.2l1 3m0 0 2 8.6a1.6 1.6 0 0 0 1.6 1.2h8.6a1.6 1.6 0 0 0 1.6-1.2l1.6-7.4a1 1 0 0 0-1-1.2H4.7z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="17.5" cy="20.5" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function ChevronDownIcon({ className = "h-3 w-3" }: IconProps) {
  return (
    <svg viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden>
      <path d="M1 1.5 6 6.5 11 1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HamburgerIcon({ className = "h-4 w-4" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className={className} aria-hidden>
      <line x1="3" y1="5" x2="21" y2="5" strokeLinecap="round" />
      <line x1="3" y1="12" x2="21" y2="12" strokeLinecap="round" />
      <line x1="3" y1="19" x2="21" y2="19" strokeLinecap="round" />
    </svg>
  );
}
