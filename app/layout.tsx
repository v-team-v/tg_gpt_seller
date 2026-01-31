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
  description: "Оформите подписку ChatGPT Plus из России с гарантией. Оплата картой РФ или по QR коду. Активация на ваш личный или новый аккаунт. Выберете подходящее предложение.",
  keywords: ["chatgpt plus купить", "chatgpt оплата россия", "chatgpt 4 оплатить", "подписка chatgpt plus", "openai оплата карты мир"],
  openGraph: {
    title: "Купить ChatGPT Plus в России | Оплата картой РФ",
    description: "Оформите подписку ChatGPT Plus из России с гарантией. Оплата картой РФ или по QR коду. Активация на ваш личный или новый аккаунт. Выберете подходящее предложение.",
    url: "https://gpt-plus.pro",
    siteName: "GPT Plus Russia",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/icon.png",
        width: 512,
        height: 512,
        alt: "GPT Plus Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Купить ChatGPT Plus в России | Оплата картой РФ",
    description: "Оформите подписку ChatGPT Plus из России с гарантией. Оплата картой РФ или по QR коду. Активация на ваш личный или новый аккаунт. Выберете подходящее предложение.",
    images: ["/icon.png"],
  },
  other: {
    "yandex-verification": "edd674dd941c7e1e"
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
        <script src="/cgppsu.js"></script>
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
              "name": "GPT Plus",
              "url": "https://gpt-plus.pro",
              "description": "Оформите подписку ChatGPT Plus из России с гарантией. Оплата картой РФ или по QR коду.",
              "potentialAction": {
                "@type": "SearchAction",
                "target": "https://gpt-plus.pro/?q={search_term_string}",
                "query-input": "required name=search_term_string"
              }
            })
          }}
        />
      </body>
    </html>
  );
}
