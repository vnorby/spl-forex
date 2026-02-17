import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { Header } from "@/components/layout/Header";

const dmSerifDisplay = localFont({
  src: [
    {
      path: "./fonts/dm-serif-display-latin.woff2",
      style: "normal",
      weight: "400",
    },
  ],
  variable: "--font-display",
  display: "swap",
});

const dmSans = localFont({
  src: [
    {
      path: "./fonts/dm-sans-latin.woff2",
      style: "normal",
      weight: "100 1000",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = localFont({
  src: [
    {
      path: "./fonts/jetbrains-mono-latin.woff2",
      style: "normal",
      weight: "100 800",
    },
  ],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spl.forex"),
  title: "spl.forex — Global FX on Solana",
  description:
    "Live oracle rates, cross-rate matrices, and stablecoin FX swaps on Solana. Powered by Pyth Network and Jupiter.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "spl.forex — Global FX on Solana",
    description:
      "Live oracle rates, cross-rate matrices, and stablecoin FX swaps on Solana. Powered by Pyth Network and Jupiter.",
    url: "https://spl.forex",
    siteName: "spl.forex",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "spl.forex — Global FX on Solana",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "spl.forex — Global FX on Solana",
    description:
      "Live oracle rates, cross-rate matrices, and stablecoin FX swaps on Solana.",
    images: ["/og-image.png"],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${dmSerifDisplay.variable} ${dmSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen antialiased">
        <Providers>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
