import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MotionForge - Create Videos with React",
  description: "A powerful React framework for creating stunning videos programmatically. Build animations, visualizations, and videos with pure React code.",
  keywords: ["MotionForge", "video", "React", "TypeScript", "animation", "programmatic video", "Remotion alternative"],
  authors: [{ name: "MotionForge Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "MotionForge - Create Videos with React",
    description: "Build stunning videos with React components and spring animations",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MotionForge",
    description: "Create videos with React - A powerful video framework",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
