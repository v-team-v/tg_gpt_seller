import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Купить ChatGPT Plus в России | Оплата картой РФ",
  description: "Оформите подписку ChatGPT Plus из России. Оплата рублевой картой или по QR коду. Активация на ваш личный аккаунт. Выберете подходящий тариф.",
  keywords: ["chatgpt plus купить", "chatgpt оплата россия", "chatgpt 4 оплатить", "подписка chatgpt plus", "openai оплата карты мир"],
  openGraph: {
    title: "Купить ChatGPT Plus в России | Оплата картой РФ",
    description: "Оформите подписку ChatGPT Plus из России. Оплата рублевой картой или по QR коду. Активация на ваш личный аккаунт. Выберете подходящий тариф.",
    url: "https://chatgpt-plus.ru",
    siteName: "ChatGPT Plus Russia",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "ChatGPT Plus Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Купить ChatGPT Plus в России | Оплата картой РФ",
    description: "Оформите подписку ChatGPT Plus из России. Оплата рублевой картой или по QR коду. Активация на ваш личный аккаунт. Выберете подходящий тариф.",
    images: ["/icon.png"],
  },
  other: {
    "yandex-verification": "no-preview"
  }
};

import { Suspense } from "react";
import { Analytics } from "@/components/Analytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
        {children}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              "name": "ChatGPT Plus",
              "url": "https://chatgpt-plus.ru",
              "description": "Доступ к ChatGPT-4 и DALL-E 3 без ограничений в России",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://chatgpt-plus.ru/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
