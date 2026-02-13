"use client";

import React, { useState } from "react";
import Image from "next/image";
import { WalletButton } from "@/components/wallet/WalletButton";
import { StablecoinSettings } from "@/components/settings/StablecoinSettings";
import { env } from "@/config/env";

export type AppTab = "markets" | "matrix" | "arbitrage" | "tools" | "swap";

interface HeaderProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
}

const TABS: AppTab[] = ["markets", "matrix", "arbitrage", "tools", "swap"];
const isDevnet = env.solanaNetwork === "devnet";

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  function handleTabClick(tab: AppTab) {
    onTabChange(tab);
    setMobileMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--color-border)]" style={{ background: "var(--color-bg)" }}>
      {/* Gradient accent line */}
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(0,229,200,0.25) 30%, rgba(0,180,216,0.2) 70%, transparent)" }}
      />

      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Left: Logo + Desktop nav */}
        <div className="flex items-center gap-4 md:gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="" width={28} height={28} priority />
            <div className="flex items-baseline gap-0">
              <span className="text-xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                spl.
              </span>
              <span className="text-xl tracking-tight" style={{ fontFamily: "var(--font-display)", color: "var(--color-accent)" }}>
                forex
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden gap-1 md:flex">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className={`relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors ${
                  activeTab === tab
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                }`}
                style={{ fontFamily: "var(--font-body)" }}
              >
                {tab}
                {activeTab === tab && (
                  <span className="absolute inset-x-2 -bottom-3 h-px bg-[var(--color-accent)] md:-bottom-4" />
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Right: desktop controls + mobile hamburger */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 md:flex">
            <StablecoinSettings />
            <span
              className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
              style={{
                fontFamily: "var(--font-mono)",
                border: `1px solid ${isDevnet ? "rgba(245,166,35,0.3)" : "var(--color-border-bright)"}`,
                color: isDevnet ? "var(--color-warm)" : "var(--color-text-muted)",
                background: isDevnet ? "var(--color-warm-dim)" : "transparent",
              }}
            >
              {isDevnet ? "Devnet" : "Mainnet"}
            </span>
            <WalletButton />
          </div>

          {/* Mobile hamburger */}
          <button
            className="flex h-9 w-9 items-center justify-center md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Menu"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              style={{ color: "var(--color-text-secondary)" }}
            >
              {mobileMenuOpen ? (
                <>
                  <line x1="4" y1="4" x2="16" y2="16" />
                  <line x1="16" y1="4" x2="4" y2="16" />
                </>
              ) : (
                <>
                  <line x1="3" y1="5" x2="17" y2="5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="15" x2="17" y2="15" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="absolute inset-x-0 top-full z-50 border-b md:hidden"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <nav className="flex flex-col px-4 py-3">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => handleTabClick(tab)}
                className="w-full px-3 py-3 text-left text-sm font-medium uppercase tracking-wide transition-colors"
                style={{
                  fontFamily: "var(--font-body)",
                  color: activeTab === tab ? "var(--color-accent)" : "var(--color-text-secondary)",
                  background: activeTab === tab ? "var(--color-accent-dim)" : "transparent",
                  borderLeft: activeTab === tab ? "2px solid var(--color-accent)" : "2px solid transparent",
                }}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div
            className="flex items-center justify-between border-t px-4 py-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <StablecoinSettings />
              <span
                className="rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest"
                style={{
                  fontFamily: "var(--font-mono)",
                  border: `1px solid ${isDevnet ? "rgba(245,166,35,0.3)" : "var(--color-border-bright)"}`,
                  color: isDevnet ? "var(--color-warm)" : "var(--color-text-muted)",
                  background: isDevnet ? "var(--color-warm-dim)" : "transparent",
                }}
              >
                {isDevnet ? "Devnet" : "Mainnet"}
              </span>
            </div>
            <WalletButton />
          </div>
        </div>
      )}
    </header>
  );
}
