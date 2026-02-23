"use client";

import * as React from "react";
import QRCode from "qrcode";
import { cn } from "./utils";

export interface CustomQRCodeProps {
  value: string;
  size?: number;
  ecl?: "L" | "M" | "Q" | "H";
  margin?: number;
  className?: string;
  loading?: boolean;
  scanning?: boolean;
}

export function CustomQRCode({
  value,
  size = 240,
  ecl = "M",
  margin = 1,
  className,
  loading,
  scanning,
}: CustomQRCodeProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!value) {
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    QRCode.toCanvas(canvas, value, {
      width: size,
      margin,
      errorCorrectionLevel: ecl,
      color: { dark: "#000000", light: "#ffffff" },
    }).catch(() => {});
  }, [ecl, margin, size, value]);

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-[var(--color-border)] bg-white p-3",
        className,
      )}
      style={{ width: size + 24, height: size + 24 }}
    >
      <canvas ref={canvasRef} width={size} height={size} className={cn("block", loading ? "opacity-20" : "opacity-100")} />

      {loading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black/20 border-t-black/70" />
        </div>
      ) : null}

      {scanning && !loading ? (
        <div className="pointer-events-none absolute inset-3 overflow-hidden rounded-lg">
          <div className="absolute inset-x-0 top-0 h-px animate-pulse bg-black/40" />
        </div>
      ) : null}
    </div>
  );
}

