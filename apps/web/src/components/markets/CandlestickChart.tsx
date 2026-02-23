"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { useHistoryContext } from "@/components/providers/MarketDataProvider";
import type { Timeframe, OHLCCandle } from "@/lib/ohlc";

type LWChartModule = typeof import("lightweight-charts");

interface CandlestickChartProps {
  pair: string;
  height?: number;
}

const TIMEFRAMES: { key: Timeframe; label: string }[] = [
  { key: "1m", label: "1M" },
  { key: "5m", label: "5M" },
  { key: "15m", label: "15M" },
  { key: "1h", label: "1H" },
];

/** Candle refresh interval — reads from aggregator every 3s instead of re-rendering on every price tick */
const CANDLE_POLL_MS = 3_000;

export function CandlestickChart({ pair, height = 300 }: CandlestickChartProps) {
  const { ohlcAggregator } = useHistoryContext();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const [timeframe, setTimeframe] = useState<Timeframe>("1m");
  const [lwModule, setLwModule] = useState<LWChartModule | null>(null);
  const [candles, setCandles] = useState<OHLCCandle[]>([]);

  // Dynamically import lightweight-charts (it's a client-only library)
  useEffect(() => {
    import("lightweight-charts").then((mod) => setLwModule(mod));
  }, []);

  // Poll candle data on a fixed 3s interval (decoupled from price-tick re-renders)
  useEffect(() => {
    if (!ohlcAggregator) return;

    const readCandles = () => {
      const data = ohlcAggregator.getCandles(pair, timeframe);
      setCandles(data);
    };

    // Read immediately on mount / pair / timeframe change
    readCandles();
    const id = setInterval(readCandles, CANDLE_POLL_MS);
    return () => clearInterval(id);
  }, [ohlcAggregator, pair, timeframe]);

  // Create chart
  useEffect(() => {
    if (!lwModule || !chartContainerRef.current) return;

    const chart = lwModule.createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height,
      layout: {
        background: { color: "transparent" },
        textColor: "#5c6070",
        fontFamily: "var(--font-mono)",
        fontSize: 10,
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.03)" },
        horzLines: { color: "rgba(255, 255, 255, 0.03)" },
      },
      crosshair: {
        mode: 0, // Normal
        vertLine: {
          color: "rgba(0, 229, 200, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#0f1118",
        },
        horzLine: {
          color: "rgba(0, 229, 200, 0.3)",
          width: 1,
          style: 2,
          labelBackgroundColor: "#0f1118",
        },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.06)",
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const series = chart.addSeries(lwModule.CandlestickSeries, {
      upColor: "#00dc82",
      downColor: "#ff4757",
      borderUpColor: "#00dc82",
      borderDownColor: "#ff4757",
      wickUpColor: "#00dc82",
      wickDownColor: "#ff4757",
    });

    chartRef.current = chart;
    seriesRef.current = series;

    // Resize observer
    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        chart.applyOptions({ width: entry.contentRect.width });
      }
    });
    resizeObserver.observe(chartContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [lwModule, height]);

  // Update data
  useEffect(() => {
    if (!seriesRef.current || candles.length === 0) return;
    seriesRef.current.setData(candles);
    if (chartRef.current) {
      chartRef.current.timeScale().fitContent();
    }
  }, [candles]);

  const hasData = candles.length > 0;

  return (
    <div className="space-y-2">
      {/* Timeframe selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {TIMEFRAMES.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTimeframe(key)}
              className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider transition-colors"
              style={{
                fontFamily: "var(--font-mono)",
                color:
                  key === timeframe
                    ? "var(--color-accent)"
                    : "var(--color-text-muted)",
                background:
                  key === timeframe
                    ? "var(--color-accent-dim)"
                    : "transparent",
                border:
                  key === timeframe
                    ? "1px solid rgba(0, 229, 200, 0.2)"
                    : "1px solid transparent",
              }}
            >
              {label}
            </button>
          ))}
        </div>
        {hasData && (
          <span
            className="text-[9px] uppercase tracking-wider"
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-text-muted)",
            }}
          >
            {candles.length} candles &middot; Session data
          </span>
        )}
      </div>

      {/* Chart container */}
      <div
        className="relative overflow-hidden"
        style={{
          border: "1px solid var(--color-border)",
          background: "var(--color-surface)",
        }}
      >
        <div ref={chartContainerRef} style={{ height: `${height}px` }} />

        {/* Overlay message if no data yet */}
        {!hasData && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ background: "var(--color-surface)" }}
          >
            <div className="text-lg opacity-20">&#x1f4ca;</div>
            <p
              className="text-[11px] uppercase tracking-wider"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Chart builds from session start
            </p>
            <p
              className="text-[10px]"
              style={{
                fontFamily: "var(--font-mono)",
                color: "var(--color-text-muted)",
              }}
            >
              Candles will appear as price data streams in
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
