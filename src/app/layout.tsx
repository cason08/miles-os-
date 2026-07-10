import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { PrivacyModeProvider } from "@/components/privacy-mode-provider";
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
  title: "MilesOS",
  description: "A personal financial operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <PrivacyModeProvider>{children}</PrivacyModeProvider>
      </body>
    </html>
  );
}
