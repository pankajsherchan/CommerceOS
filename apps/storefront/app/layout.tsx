import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";

import { CartProviderInner } from "@/components/cart-provider";
import { StorefrontShell } from "@/components/storefront-shell";
import { getStorefrontCartLines, getStorefrontProducts } from "@/lib/commerce-api";

import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "CommerceOS Storefront",
  description: "Mocked premium storefront flows for CommerceOS phase 1.",
};

const rootClassName = [
  manrope.variable,
  fraunces.variable,
  ibmPlexMono.variable,
  "h-full antialiased",
].join(" ");

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [initialCartLines, initialProducts] = await Promise.all([
    getStorefrontCartLines(),
    getStorefrontProducts(),
  ]);

  return (
    <html lang="en" className={rootClassName}>
      <body>
        <CartProviderInner
          initialLines={initialCartLines}
          initialProducts={initialProducts}
        >
          <StorefrontShell>{children}</StorefrontShell>
        </CartProviderInner>
      </body>
    </html>
  );
}
