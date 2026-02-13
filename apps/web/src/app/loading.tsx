export default function Loading() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center gap-6"
      style={{ background: "var(--color-bg)" }}
    >
      {/* Logo mark */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo.svg"
          alt="spl.forex"
          width={48}
          height={48}
          className="animate-pulse"
        />
      </div>

      {/* Brand name */}
      <div className="flex items-baseline gap-0">
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-text)" }}
        >
          spl.
        </span>
        <span
          className="text-2xl tracking-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}
        >
          forex
        </span>
      </div>

      {/* Status */}
      <p
        className="text-[11px] uppercase tracking-widest"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
      >
        Loading&hellip;
      </p>
    </div>
  );
}
