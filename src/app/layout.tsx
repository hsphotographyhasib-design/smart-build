import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: "#0B2345",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "SmartBuild EPPM — Enterprise Project Portfolio Management",
    template: "%s | SmartBuild EPPM",
  },
  description:
    "SmartBuild EPPM is an Enterprise Project Portfolio Management platform for construction, maintenance, and facility management.",
  applicationName: "SmartBuild EPPM",
  authors: [{ name: "SmartBuild" }],
  generator: "Next.js",
  keywords: [
    "SmartBuild", "EPPM", "enterprise project portfolio management",
    "construction management", "project management",
    "facility management", "maintenance management", "Primavera",
  ],
  referrer: "origin-when-cross-origin",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "SmartBuild EPPM",
    title: "SmartBuild EPPM — Enterprise Project Portfolio Management",
    description:
      "Enterprise Project Portfolio Management, Construction, Maintenance, and Facility Management Platform.",
    images: [
      {
        url: "/brand/smartbuild-primary-logo.svg",
        width: 400,
        height: 200,
        alt: "SmartBuild EPPM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SmartBuild EPPM",
    description: "Enterprise Project Portfolio Management Platform.",
  },
  robots: { index: false, follow: false },
  icons: {
    icon: [
      { url: "/brand/icon.svg", type: "image/svg+xml" },
      { url: "/brand/smartbuild-circle.svg", sizes: "any", type: "image/svg+xml" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "SmartBuild EPPM",
    statusBarStyle: "default",
  },
  category: "technology",
  classification: "Enterprise Software",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/brand/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/brand/smartbuild-circle.svg" sizes="192x192" type="image/svg+xml" />
      </head>
      <body
        className={`${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
