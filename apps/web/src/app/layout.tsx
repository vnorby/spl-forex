import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
