import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CommerceOS Storefront",
  description: "Phase 0 storefront bootstrap for CommerceOS.",
};

const rootClassName = [
  manrope.variable,
  ibmPlexMono.variable,
  "h-full antialiased",
].join(" ");

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={rootClassName}>
      <body>{children}</body>
    </html>
  );
}
