import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://chamascore-agent.vercel.app";
const OG_DESCRIPTION =
  "An autonomous Celo agent for savings-circle trust: it executes rotating payouts on its own, flags late payers onchain, and earns portable ERC-8004 reputation from real members.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "ChamaScore Agent — autonomous trust for savings circles on Celo",
  description: OG_DESCRIPTION,
  openGraph: {
    title: "ChamaScore Agent — autonomous trust for savings circles on Celo",
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "ChamaScore Agent",
    images: [
      {
        url: "/og-chamascore-16x9.png",
        width: 1280,
        height: 720,
        alt: "ChamaScore — autonomous trust agent for savings circles on Celo",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChamaScore Agent — autonomous trust for savings circles on Celo",
    description: OG_DESCRIPTION,
    images: ["/og-chamascore-16x9.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
