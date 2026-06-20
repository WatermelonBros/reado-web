import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz"],
});
const hanken = Hanken_Grotesk({ variable: "--font-hanken", subsets: ["latin"] });
const jbMono = JetBrains_Mono({ variable: "--font-jbmono", subsets: ["latin"] });

const SITE = "https://reado.watermelon-studio.it";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Reado — a calm place to read code",
  description:
    "A read-first code IDE. You read and leave durable, anchored comments; an AI agent reviews and commits the fixes.",
  openGraph: {
    title: "Reado — a calm place to read code",
    description:
      "Read-first code IDE. You review; the AI commits. Durable comments an agent resolves.",
    url: SITE,
    siteName: "Reado",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${hanken.variable} ${jbMono.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
