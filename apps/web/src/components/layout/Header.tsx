"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useState } from "react";
import { useCluster } from "@solana/connector/react";
import { WalletButton } from "@/components/wallet/WalletButton";
import { StablecoinSettings } from "@/components/settings/StablecoinSettings";
import { Logo } from "@/components/layout/Logo";
import { getSolanaClusterLabel, isSolanaDevnetCluster } from "@/lib/solana-cluster";

const NAV_ITEMS = [
  { id: "markets", href: "/", label: "markets" },
  { id: "matrix", href: "/matrix", label: "matrix" },
  { id: "arbitrage", href: "/arbitrage", label: "arbitrage" },
  { id: "tools", href: "/tools", label: "tools" },
  { id: "swap", href: "/swap", label: "swap" },
] as const;

function getIsActiveHref(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { cluster } = useCluster();
  const isDevnet = isSolanaDevnetCluster(cluster?.id);
  const clusterLabel = getSolanaClusterLabel(cluster);

  function closeMobileMenu() {
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
          <Link href="/" onClick={closeMobileMenu} className="flex items-center gap-2.5">
            <Logo className="h-5 w-auto md:h-[21px]" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = getIsActiveHref(pathname, item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive ? "page" : undefined}
                  className={`relative px-4 py-2 text-sm font-medium tracking-wide uppercase transition-colors ${
                    isActive
                    ? "text-[var(--color-text)]"
                    : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
                  }`}
                  style={{ fontFamily: "var(--font-body)" }}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-3 h-px bg-[var(--color-accent)] md:-bottom-4" />
                  )}
                </Link>
              );
            })}
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
              {clusterLabel}
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
            {NAV_ITEMS.map((item) => {
              const isActive = getIsActiveHref(pathname, item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive ? "page" : undefined}
                  className="w-full px-3 py-3 text-left text-sm font-medium uppercase tracking-wide transition-colors"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: isActive ? "var(--color-accent)" : "var(--color-text-secondary)",
                    background: isActive ? "var(--color-accent-dim)" : "transparent",
                    borderLeft: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
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
                {clusterLabel}
              </span>
            </div>
            <WalletButton />
          </div>
        </div>
      )}
    </header>
  );
}
