"use client";

import React, { useMemo } from "react";
import { useDepthAnalysis } from "@/hooks/useDepthAnalysis";
import { formatRate, formatAmount, formatSpread } from "@/lib/utils";
import type { DepthLevel } from "@solafx/types";

/* ─── Helpers ──────────────────────────────────────────────────────── */

function formatCompactAmount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(n % 1_000 === 0 ? 0 : 1) + "K";
  return n.toFixed(0);
}

function formatSizeLabel(n: number): string {
  if (n >= 1_000_000) return "$" + (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + "M";
  if (n >= 10_000) return "$" + (n / 1_000).toFixed(0) + "K";
  return "$" + new Intl.NumberFormat("en-US").format(n);
}

function spreadDirection(spreadPercent: number): "premium" | "discount" | "par" {
  if (spreadPercent > 0.005) return "premium";
  if (spreadPercent < -0.005) return "discount";
  return "par";
}

function barColor(spreadPercent: number): string {
  const dir = spreadDirection(spreadPercent);
  if (dir === "premium") return "var(--color-up)";
  if (dir === "discount") return "var(--color-down)";
  return "var(--color-text-muted)";
}

function impactColor(impactPercent: number): string {
  const abs = Math.abs(impactPercent);
  if (abs < 0.1) return "var(--color-text-muted)";
  if (abs <= 0.5) return "var(--color-warm)";
  return "var(--color-down)";
}

function spreadLabelColor(spreadPercent: number): string {
  const dir = spreadDirection(spreadPercent);
  if (dir === "premium") return "var(--color-up)";
  if (dir === "discount") return "var(--color-down)";
  return "var(--color-text-muted)";
}

/* ─── Props ────────────────────────────────────────────────────────── */

interface DepthChartProps {
  inputToken: string;
  outputToken: string;
}

interface DepthBarChartProps {
  levels: DepthLevel[];
  oracleRate: number;
}

interface DepthTableProps {
  levels: DepthLevel[];
  outputToken: string;
}

/* ─── Bar Chart (SVG) ──────────────────────────────────────────────── */

const SVG_W = 500;
const SVG_H = 160;
const PAD_LEFT = 60;
const PAD_RIGHT = 16;
const PAD_TOP = 14;
const PAD_BOTTOM = 28;
const CHART_W = SVG_W - PAD_LEFT - PAD_RIGHT;
const CHART_H = SVG_H - PAD_TOP - PAD_BOTTOM;

function DepthBarChart({ levels, oracleRate }: DepthBarChartProps) {
  const { minRate, maxRate, yScale, oracleY } = useMemo(() => {
    const rates = levels.map((l) => l.dexRate);
    const allValues = [...rates, oracleRate];
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const range = dataMax - dataMin || dataMax * 0.001;
    const margin = range * 0.15;
    const min = dataMin - margin;
    const max = dataMax + margin;

    const scale = (rate: number) =>
      PAD_TOP + CHART_H - ((rate - min) / (max - min)) * CHART_H;

    return {
      minRate: min,
      maxRate: max,
      yScale: scale,
      oracleY: scale(oracleRate),
    };
  }, [levels, oracleRate]);

  /* Y-axis tick values — 5 evenly spaced */
  const yTicks = useMemo(() => {
    const count = 5;
    const step = (maxRate - minRate) / (count - 1);
    return Array.from({ length: count }, (_, i) => minRate + step * i);
  }, [minRate, maxRate]);

  const barCount = levels.length;
  const barGap = 6;
  const totalGaps = (barCount - 1) * barGap;
  const barWidth = Math.max(8, (CHART_W - totalGaps) / barCount);

  return (
    <div
      className="border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <svg
        viewBox={"0 0 " + SVG_W + " " + SVG_H}
        width="100%"
        preserveAspectRatio="xMidYMid meet"
        style={{ display: "block" }}
      >
        {/* Grid lines & Y-axis labels */}
        {yTicks.map((tick, i) => {
          const y = yScale(tick);
          return (
            <g key={i}>
              <line
                x1={PAD_LEFT}
                x2={SVG_W - PAD_RIGHT}
                y1={y}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth={0.5}
              />
              <text
                x={PAD_LEFT - 6}
                y={y + 3}
                textAnchor="end"
                fill="var(--color-text-muted)"
                fontSize={8}
                fontFamily="var(--font-mono)"
              >
                {formatRate(tick)}
              </text>
            </g>
          );
        })}

        {/* Oracle reference line (dashed cyan) */}
        <line
          x1={PAD_LEFT}
          x2={SVG_W - PAD_RIGHT}
          y1={oracleY}
          y2={oracleY}
          stroke="var(--color-accent)"
          strokeWidth={1}
          strokeDasharray="4 3"
        />
        <text
          x={SVG_W - PAD_RIGHT + 2}
          y={oracleY + 3}
          fill="var(--color-accent)"
          fontSize={7}
          fontFamily="var(--font-mono)"
          textAnchor="start"
        >
          Oracle
        </text>

        {/* Bars */}
        {levels.map((level, i) => {
          const x = PAD_LEFT + i * (barWidth + barGap);
          const barY = yScale(level.dexRate);
          const baseY = yScale(minRate);
          const height = Math.max(1, baseY - barY);

          return (
            <g key={i}>
              {/* Bar fill */}
              <rect
                x={x}
                y={barY}
                width={barWidth}
                height={height}
                fill={barColor(level.spreadPercent)}
                opacity={0.75}
              />
              {/* Top edge highlight */}
              <rect
                x={x}
                y={barY}
                width={barWidth}
                height={1}
                fill={barColor(level.spreadPercent)}
                opacity={1}
              />
            </g>
          );
        })}

        {/* X-axis labels */}
        {levels.map((level, i) => {
          const x = PAD_LEFT + i * (barWidth + barGap) + barWidth / 2;
          return (
            <text
              key={i}
              x={x}
              y={SVG_H - 6}
              textAnchor="middle"
              fill="var(--color-text-muted)"
              fontSize={7}
              fontFamily="var(--font-mono)"
            >
              {formatCompactAmount(level.inputAmount)}
            </text>
          );
        })}

        {/* Chart border — left + bottom axes */}
        <line
          x1={PAD_LEFT}
          x2={PAD_LEFT}
          y1={PAD_TOP}
          y2={SVG_H - PAD_BOTTOM}
          stroke="var(--color-border)"
          strokeWidth={0.5}
        />
        <line
          x1={PAD_LEFT}
          x2={SVG_W - PAD_RIGHT}
          y1={SVG_H - PAD_BOTTOM}
          y2={SVG_H - PAD_BOTTOM}
          stroke="var(--color-border)"
          strokeWidth={0.5}
        />
      </svg>
    </div>
  );
}

/* ─── Data Table ───────────────────────────────────────────────────── */

function DepthTable({ levels, outputToken }: DepthTableProps) {
  return (
    <div
      className="border overflow-hidden"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      {/* Column headers */}
      <div
        className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr] items-center gap-x-2 px-4 py-2.5 text-[10px] font-medium uppercase tracking-wider"
        style={{
          background: "var(--color-bg-subtle)",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>Size</span>
        <span className="text-right">Rate</span>
        <span className="text-right">Output ({outputToken})</span>
        <span className="text-right">Spread</span>
        <span className="text-right">Impact</span>
      </div>

      {/* Data rows */}
      {levels.map((level, i) => {
        const dir = spreadDirection(level.spreadPercent);
        const spreadPrefix = dir === "premium" ? "+" : dir === "discount" ? "\u2212" : "";

        return (
          <div
            key={i}
            className="grid grid-cols-[1fr_1fr_1fr_0.8fr_0.8fr] items-center gap-x-2 px-4 py-2 text-[11px]"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text)",
              borderTop: "1px solid var(--color-border)",
            }}
          >
            {/* Size */}
            <span style={{ color: "var(--color-text-secondary)" }}>
              {formatSizeLabel(level.inputAmount)}
            </span>

            {/* Rate */}
            <span className="text-right">{formatRate(level.dexRate)}</span>

            {/* Output */}
            <span className="text-right" style={{ color: "var(--color-text-secondary)" }}>
              {formatAmount(level.outputAmount, 2)}
            </span>

            {/* Spread */}
            <span
              className="text-right"
              style={{ color: spreadLabelColor(level.spreadPercent) }}
            >
              {spreadPrefix}{formatSpread(level.spreadPercent)}
            </span>

            {/* Impact */}
            <span
              className="text-right"
              style={{ color: impactColor(level.priceImpact) }}
            >
              {Math.abs(level.priceImpact) < 0.01
                ? "< 0.01%"
                : Math.abs(level.priceImpact).toFixed(2) + "%"}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── Main Component ───────────────────────────────────────────────── */

export function DepthChart({ inputToken, outputToken }: DepthChartProps) {
  const { analysis, isLoading } = useDepthAnalysis({ inputToken, outputToken });

  if (isLoading) {
    return (
      <div
        className="py-6 text-center text-[11px] uppercase tracking-wider"
        style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
      >
        Fetching depth data...
      </div>
    );
  }

  if (!analysis) return null;

  return (
    <div className="space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <h3
          className="text-[11px] font-medium uppercase tracking-widest"
          style={{ fontFamily: "var(--font-mono)", color: "var(--color-text-muted)" }}
        >
          Liquidity Depth
        </h3>
        <span
          className="text-[10px]"
          style={{
            fontFamily: "var(--font-mono)",
            color: "var(--color-text-muted)",
          }}
        >
          {inputToken} &rarr; {outputToken}
        </span>
      </div>

      {/* Bar chart visualization */}
      <DepthBarChart levels={analysis.levels} oracleRate={analysis.oracleRate} />

      {/* Detailed data table */}
      <DepthTable levels={analysis.levels} outputToken={outputToken} />
    </div>
  );
}
