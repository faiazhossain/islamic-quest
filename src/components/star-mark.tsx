/** The Amalyn mark: an eight-point khatam star with a center light. */
export function StarMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} aria-hidden="true">
      <g stroke="currentColor" strokeWidth="2.5">
        <rect x="22" y="22" width="56" height="56" />
        <rect x="22" y="22" width="56" height="56" transform="rotate(45 50 50)" />
      </g>
      <circle cx="50" cy="50" r="6" fill="currentColor" />
    </svg>
  );
}
