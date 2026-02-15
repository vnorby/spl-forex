"use client";

import React, { createContext, useContext, useCallback } from "react";
import { Toaster, toast as sonnerToast } from "@solafx/ui";

// ─── Types ──────────────────────────────────────────────────────────
export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  action?: { label: string; onClick: () => void };
  duration?: number; // ms, 0 = persist
}

interface ToastContextValue {
  toast: (t: Omit<Toast, "id">) => string;
  dismiss: (id?: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => "",
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const dismiss = useCallback((id?: string) => {
    if (id) {
      sonnerToast.dismiss(id);
      return;
    }
    sonnerToast.dismiss();
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const duration = t.duration === 0 ? Infinity : t.duration;
      const payload = {
        id: crypto.randomUUID(),
        description: t.message,
        duration,
        action: t.action
          ? {
              label: t.action.label,
              onClick: t.action.onClick,
            }
          : undefined,
      };

      switch (t.type) {
        case "success":
          return String(sonnerToast.success(t.title, payload));
        case "error":
          return String(sonnerToast.error(t.title, payload));
        case "warning":
          return String(sonnerToast.warning(t.title, payload));
        default:
          return String(sonnerToast.info(t.title, payload));
      }
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <Toaster />
    </ToastContext.Provider>
  );
}
