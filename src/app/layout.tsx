import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SmartBuild EPPM — Enterprise Project Portfolio Management",
  description:
    "Enterprise-grade Project Portfolio Management platform: planning, scheduling, cost control, resource management, risk management & analytics. Built for SmartBuild Enterprise.",
  keywords: [
    "EPPM", "Primavera P6", "Project Controls", "Portfolio Management", "Gantt",
    "Earned Value Management", "Critical Path", "SmartBuild",
  ],
  authors: [{ name: "SmartBuild Enterprise" }],
  icons: { icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg" },
  openGraph: {
    title: "SmartBuild EPPM",
    description: "Enterprise Project Portfolio Management Platform",
    siteName: "SmartBuild",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
