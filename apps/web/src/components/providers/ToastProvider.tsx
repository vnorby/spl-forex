"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

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
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue>({
  toast: () => "",
  dismiss: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

// ─── Provider ────────────────────────────────────────────────────────
const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 5;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (t: Omit<Toast, "id">) => {
      const id = crypto.randomUUID();
      const newToast: Toast = { ...t, id };
      setToasts((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), newToast]);

      const duration = t.duration ?? DEFAULT_DURATION;
      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [dismiss],
  );

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Toast Container (renders in portal-like fixed position) ─────────
function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2"
      style={{ maxWidth: 380 }}
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

// ─── Single Toast ────────────────────────────────────────────────────
const BORDER_COLORS: Record<ToastType, string> = {
  success: "rgba(0, 220, 130, 0.4)",
  error: "rgba(255, 71, 87, 0.4)",
  warning: "rgba(245, 166, 35, 0.4)",
  info: "rgba(0, 229, 200, 0.4)",
};

const ICON_COLORS: Record<ToastType, string> = {
  success: "var(--color-success)",
  error: "var(--color-danger)",
  warning: "var(--color-warning)",
  info: "var(--color-accent)",
};

const ICONS: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

function ToastItem({
  toast,
  onDismiss,
}: {
  toast: Toast;
  onDismiss: (id: string) => void;
}) {
  const [entering, setEntering] = useState(true);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setEntering(false));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 shadow-xl backdrop-blur-sm transition-all duration-300"
      style={{
        background: "var(--glass-bg)",
        borderLeft: `3px solid ${BORDER_COLORS[toast.type]}`,
        border: `1px solid ${BORDER_COLORS[toast.type]}`,
        borderLeftWidth: 3,
        opacity: entering ? 0 : 1,
        transform: entering ? "translateX(40px)" : "translateX(0)",
      }}
    >
      {/* Icon */}
      <span
        className="mt-0.5 text-sm font-bold"
        style={{ color: ICON_COLORS[toast.type], fontFamily: "var(--font-mono)" }}
      >
        {ICONS[toast.type]}
      </span>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-medium uppercase tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-text)" }}
        >
          {toast.title}
        </p>
        {toast.message && (
          <p
            className="mt-0.5 text-[11px] leading-relaxed"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {toast.message}
          </p>
        )}
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-1.5 text-[10px] font-medium uppercase tracking-wider transition-colors hover:brightness-125"
            style={{ color: ICON_COLORS[toast.type], fontFamily: "var(--font-mono)" }}
          >
            {toast.action.label} →
          </button>
        )}
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-xs opacity-40 transition-opacity hover:opacity-80"
        style={{ color: "var(--color-text-muted)" }}
      >
        ✕
      </button>
    </div>
  );
}
