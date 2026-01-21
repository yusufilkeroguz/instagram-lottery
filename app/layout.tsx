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
  title: "Instagram Çekiliş - Ücretsiz Rastgele Kazanan Seçici",
  description:
    "Instagram gönderilerinden rastgele yorum çekilişi yapın. Tamamen ücretsiz ve kolay kullanım.",
  keywords: [
    "instagram",
    "çekiliş",
    "giveaway",
    "random",
    "kazanan",
    "seçici",
    "ücretsiz",
  ],
  authors: [{ name: "Instagram Çekiliş" }],
  openGraph: {
    title: "Instagram Çekiliş - Ücretsiz Rastgele Kazanan Seçici",
    description: "Instagram gönderilerinden rastgele yorum çekilişi yapın.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
