interface SwitchProps {
  on: boolean;
}

/** Visual toggle indicator; the wrapping control owns state and semantics. */
export function Switch({ on }: SwitchProps) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-6 w-10 shrink-0 items-center rounded-full transition-colors ${
        on ? "bg-accent" : "border border-line bg-ink-3/30"
      }`}
    >
      <span
        className={`absolute rounded-full bg-white shadow transition-transform ${
          on ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
        style={{ height: 18, width: 18 }}
      />
    </span>
  );
}
