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

export const metadata: Metadata = {
  title: "PageCraft - AI Landing Page Generator",
  description:
    "Create stunning, conversion-optimized landing pages in seconds with AI. No design skills needed.",
  keywords: [
    "landing page generator",
    "AI website builder",
    "landing page builder",
    "AI copywriting",
    "conversion optimization",
  ],
  openGraph: {
    title: "PageCraft - AI Landing Page Generator",
    description:
      "Create stunning, conversion-optimized landing pages in seconds with AI.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PageCraft - AI Landing Page Generator",
    description:
      "Create stunning, conversion-optimized landing pages in seconds with AI.",
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
