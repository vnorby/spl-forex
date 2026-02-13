"use client";

import React, { useMemo } from "react";
import type { PricePoint } from "@solafx/types";

interface SparklineChartProps {
  data: PricePoint[];
  width?: number;
  height?: number;
  className?: string;
}

function SparklineChartInner({
  data,
  width = 80,
  height = 24,
  className,
}: SparklineChartProps) {
  const chartData = useMemo(() => {
    if (data.length < 2) return null;

    const prices = data.map((d) => d.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min || 1;
    const padding = 2;

    const coords = data.map((d, i) => {
      const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
      const y = height - padding - ((d.price - min) / range) * (height - padding * 2);
      return { x, y };
    });

    const linePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
    const first = coords[0];
    const last = coords[coords.length - 1];
    const fillPoints = linePoints + ` ${last.x},${height} ${first.x},${height}`;
    const isUp = prices[prices.length - 1] >= prices[0];

    return { linePoints, fillPoints, isUp, last };
  }, [data, width, height]);

  if (!chartData) {
    return (
      <div
        style={{ width, height }}
        className={`flex items-center justify-center ${className ?? ""}`}
      >
        <span
          className="text-[10px] tracking-wider"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
        >
          --
        </span>
      </div>
    );
  }

  const { linePoints, fillPoints, isUp, last } = chartData;
  const gradientId = `spark-${isUp ? "up" : "down"}-${width}-${height}`;

  return (
    <svg width={width} height={height} className={className}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop
            offset="0%"
            stopColor={isUp ? "var(--color-up)" : "var(--color-down)"}
            stopOpacity="0.25"
          />
          <stop
            offset="100%"
            stopColor={isUp ? "var(--color-up)" : "var(--color-down)"}
            stopOpacity="0"
          />
        </linearGradient>
      </defs>
      <polygon fill={`url(#${gradientId})`} points={fillPoints} />
      <polyline
        fill="none"
        stroke={isUp ? "var(--color-up)" : "var(--color-down)"}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={linePoints}
      />
      <circle
        cx={last.x}
        cy={last.y}
        r="1.5"
        fill={isUp ? "var(--color-up)" : "var(--color-down)"}
      />
    </svg>
  );
}

export const SparklineChart = React.memo(SparklineChartInner);
