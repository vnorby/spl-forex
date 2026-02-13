import React from "react";
import { cn } from "./utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  loading,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center font-bold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]",
        variant === "primary" &&
          "border-2 border-[var(--color-accent)] text-black hover:shadow-[0_0_24px_rgba(0,229,200,0.3)] focus-visible:ring-[var(--color-accent)]",
        variant === "secondary" &&
          "border-2 border-[var(--color-accent)] bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)] focus-visible:ring-[var(--color-accent)]",
        variant === "ghost" &&
          "border border-[var(--color-border-bright)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] hover:border-[var(--color-text-muted)] hover:text-[var(--color-text)]",
        size === "sm" && "h-9 px-4 text-[11px]",
        size === "md" && "h-11 px-5 text-[12px]",
        size === "lg" && "h-13 px-7 text-[13px]",
        className,
      )}
      style={{
        fontFamily: "var(--font-mono)",
        ...(variant === "primary" ? { background: "var(--color-accent)" } : {}),
      }}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}
