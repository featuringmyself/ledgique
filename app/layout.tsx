// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import CurrencyProvider from "@/components/providers/CurrencyProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ledgique",
  description: "Financial Dashboard & Analytics - Track revenue, manage projects, and monitor client performance with powerful insights.",
  openGraph: {
    title: "Ledgique - Financial Dashboard & Analytics",
    description: "Track revenue, manage projects, and monitor client performance with powerful insights.",
    url: "https://ledgique.com",
    siteName: "Ledgique",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ledgique Dashboard Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ledgique - Financial Dashboard & Analytics",
    description: "Track revenue, manage projects, and monitor client performance with powerful insights.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased`}>
        <ClerkProvider>
          <CurrencyProvider>
            <ConditionalLayout>{children}</ConditionalLayout>
          </CurrencyProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}