"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Copy } from "lucide-react";
import { Button } from "./Button";
import { cn } from "./utils";

export interface CopyButtonProps {
  textToCopy: string;
  displayText?: string | React.ReactNode;
  className?: string;
  iconClassName?: string;
  iconClassNameCheck?: string;
  showText?: boolean;
  disabled?: boolean;
}

export function CopyButton({
  textToCopy,
  displayText,
  className,
  iconClassName,
  iconClassNameCheck,
  showText = true,
  disabled,
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    if (!navigator.clipboard) return;

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled}
      variant="outline"
      className={cn("group flex items-center justify-between", className, disabled && "cursor-not-allowed opacity-50")}
    >
      {showText ? (
        <span className="min-w-0 truncate font-mono text-xs text-[var(--color-text)]">
          {displayText ?? textToCopy}
        </span>
      ) : null}
      <div className="relative flex h-3.5 w-3.5 items-center justify-center">
        <AnimatePresence initial={false}>
          {copied ? (
            <motion.div
              key="checkmark"
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, rotate: 90, scale: 0 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -10, scale: 0.8 }}
              transition={{ duration: 0.22, ease: [0.175, 0.885, 0.32, 1.1] }}
            >
              <Check className={cn("h-3.5 w-3.5 text-[var(--color-success)]", iconClassNameCheck)} />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              className="absolute inset-0"
              initial={{ opacity: 0, rotateZ: -90, scale: 0.8 }}
              animate={{ opacity: 1, rotateZ: 0, scale: 1 }}
              exit={{ opacity: 0, rotateZ: -20, scale: 0 }}
              transition={{ duration: 0.22, ease: [0.175, 0.885, 0.32, 1.1] }}
              style={{ transformOrigin: "bottom right" }}
            >
              <Copy className={cn("h-3.5 w-3.5 text-[var(--color-text-muted)] group-hover:text-[var(--color-text)]", iconClassName)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Button>
  );
}

