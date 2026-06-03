import type { Metadata } from "next";
import { Inter } from "next/font/google";

// Points to your stylesheet using a relative import path
import "./globals.css";

// Optimize font loading to prevent layout shifts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    template: "%s | School ERP",
    default: "School ERP - Management System", 
  },
  description: "Comprehensive ERP Management System for modern school administrations.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${inter.variable} font-sans antialiased bg-background text-foreground min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
