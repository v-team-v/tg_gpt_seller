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
  title: "ChatGPT Plus",
  description: "Доступ к ChatGPT-4 и DALL-E 3 без ограничений в России",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0",
  openGraph: {
    title: "ChatGPT Plus",
    description: "Доступ к ChatGPT-4 и DALL-E 3 без ограничений в России",
    url: "https://chatgpt-plus.ru",
    siteName: "ChatGPT Plus",
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "ChatGPT Plus",
    description: "Доступ к ChatGPT-4 и DALL-E 3 без ограничений в России",
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
        {/* <Suspense fallback={null}>
          <Analytics />
        </Suspense> */}
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
