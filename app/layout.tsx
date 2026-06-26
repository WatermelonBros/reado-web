import type { Metadata, Viewport } from "next";
import { Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const SITE = "https://reado.watermelon-studio.it";
const TITLE = "Reado — a calm place to read code";
const DESCRIPTION =
  "A read-first code IDE. You read and leave durable, anchored comments; Claude Code and Codex review and commit the fixes. Inverted code review for the AI era.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    template: "%s — Reado",
  },
  description: DESCRIPTION,
  applicationName: "Reado",
  keywords: [
    "code reader",
    "code review",
    "AI code review",
    "Claude Code",
    "Codex",
    "IDE",
    "read-first editor",
    "code comments",
    "Tauri app",
  ],
  authors: [{ name: "Watermelon Studio", url: "https://watermelon-studio.it" }],
  creator: "Watermelon Studio",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Reado",
    title: TITLE,
    description: "Read-first code IDE. You review; the AI commits.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Reado" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: "Read-first code IDE. You review; the AI commits.",
    images: ["/og.png"],
  },
  icons: { icon: "/icon.png", apple: "/icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#1b1f28",
  colorScheme: "dark",
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "Reado",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "macOS, Windows, Linux",
  description: DESCRIPTION,
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  url: SITE,
  author: { "@type": "Organization", name: "Watermelon Studio" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hanken.variable} ${jetbrains.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
          }}
        />
        {children}
      </body>
    </html>
  );
}
