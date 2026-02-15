"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(0,229,200,0.35)] bg-[var(--color-accent-dim)] text-[var(--color-accent)]",
        secondary:
          "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)]",
        destructive:
          "border-[rgba(255,71,87,0.35)] bg-[rgba(255,71,87,0.12)] text-[var(--color-danger)]",
        outline:
          "border-[var(--color-border)] bg-transparent text-[var(--color-text-muted)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";

  return <Comp data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
