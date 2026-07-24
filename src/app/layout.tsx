import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter, Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

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
  themeColor: "#1B5E20",
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: {
    default: "HJSB EPPM — Enterprise Project Portfolio Management",
    template: "%s | HJSB EPPM",
  },
  description:
    "HJSB EPPM is an Enterprise Project Portfolio Management, Construction Management, Maintenance Management, and Facility Management Platform developed for Hasanur Jaya Sdn. Bhd.",
  applicationName: "HJSB EPPM",
  authors: [{ name: "Hasanur Jaya Sdn. Bhd." }],
  generator: "Next.js",
  keywords: [
    "HJSB", "EPPM", "enterprise project portfolio management",
    "construction management", "project management", "Brunei",
    "Hasanur Jaya", "facility management", "maintenance management",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Hasanur Jaya Sdn. Bhd.",
  publisher: "Hasanur Jaya Sdn. Bhd.",
  metadataBase: new URL("https://hasanurjaya.com"),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HJSB EPPM",
    title: "HJSB EPPM — Enterprise Project Portfolio Management",
    description:
      "Enterprise Project Portfolio Management, Construction Management, Maintenance Management, and Facility Management Platform developed for Hasanur Jaya Sdn. Bhd.",
    url: "https://hasanurjaya.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HJSB EPPM",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HJSB EPPM",
    description:
      "Enterprise Project Portfolio Management Platform for Hasanur Jaya Sdn. Bhd.",
    images: ["/og-image.png"],
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "HJSB EPPM",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: true,
    email: true,
    address: true,
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
        <link rel="icon" href="/favicon.ico" sizes="48x48" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} ${poppins.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
        <SonnerToaster />
      </body>
    </html>
  );
}
