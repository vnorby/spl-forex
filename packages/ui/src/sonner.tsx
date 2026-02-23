"use client";

import { Toaster as Sonner, type ToasterProps, toast } from "sonner";

function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="dark"
      position="bottom-right"
      richColors
      toastOptions={{
        style: {
          border: "1px solid var(--color-border-bright)",
          background: "var(--color-bg-subtle)",
          color: "var(--color-text)",
        },
      }}
      {...props}
    />
  );
}

export { Toaster, toast };
