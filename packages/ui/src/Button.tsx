"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]/30 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // shadcn-compatible set
        default:
          "border-2 border-[var(--color-accent)] bg-[var(--color-accent)] text-black hover:shadow-[0_0_24px_rgba(0,229,200,0.3)]",
        destructive:
          "border border-[rgba(255,71,87,0.35)] bg-[rgba(255,71,87,0.12)] text-[var(--color-danger)] hover:bg-[rgba(255,71,87,0.18)] focus-visible:ring-[var(--color-danger)]/30",
        outline:
          "border border-[var(--color-border-bright)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-hover)]",
        secondary:
          "border-2 border-[var(--color-accent)] bg-transparent text-[var(--color-accent)] hover:bg-[var(--color-accent-dim)]",
        ghost:
          "border border-[var(--color-border)] bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]",
        link: "bg-transparent text-[var(--color-accent)] underline-offset-4 hover:underline",

        // backward-compat aliases used across app
        primary:
          "border-2 border-[var(--color-accent)] bg-[var(--color-accent)] text-black hover:shadow-[0_0_24px_rgba(0,229,200,0.3)]",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3",
        lg: "h-11 rounded-md px-6 text-[12px] font-bold uppercase tracking-wider",
        icon: "h-9 w-9 p-0",

        // backward-compat alias
        md: "h-9 px-4 py-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, asChild = false, loading, disabled, children, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const isDisabled = Boolean(disabled || loading);

  return (
    <Comp
      ref={ref}
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={!asChild ? isDisabled : undefined}
      aria-disabled={isDisabled}
      {...props}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : null}
      {children}
    </Comp>
  );
});

export { buttonVariants };
