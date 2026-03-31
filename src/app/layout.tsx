import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { AnalyticsProvider } from "@/components/analytics-provider";
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
  title: {
    default: "PageCraft - AI Landing Page Generator",
    template: "%s | PageCraft",
  },
  description:
    "Create stunning, conversion-optimized landing pages in seconds with AI. No design skills needed. Free to start.",
  keywords: [
    "landing page generator",
    "AI website builder",
    "landing page builder",
    "AI copywriting",
    "conversion optimization",
    "free landing page",
    "no-code website builder",
  ],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://pagecraft.ai"
  ),
  openGraph: {
    title: "PageCraft - AI Landing Page Generator",
    description:
      "Create stunning, conversion-optimized landing pages in seconds with AI. No design skills needed.",
    type: "website",
    siteName: "PageCraft",
  },
  twitter: {
    card: "summary_large_image",
    title: "PageCraft - AI Landing Page Generator",
    description:
      "Create stunning, conversion-optimized landing pages in seconds with AI.",
  },
  alternates: {
    canonical: "/",
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
      <body className="min-h-full flex flex-col">
        <AnalyticsProvider>
          <ToastProvider>{children}</ToastProvider>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
