import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextTopLoader from "nextjs-toploader";
import { ToastProvider } from "@/components/ui/toast-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | Renata Imóveis",
    default: "Renata Imóveis - Sua imobiliária de confiança",
  },
  description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros.",
  icons: {
    icon: "/icon.svg",
  },
  keywords: ["imóveis", "apartamentos", "casas", "terrenos", "imobiliária", "Rio de Janeiro", "Renata Imóveis"],
  openGraph: {
    title: "Renata Imóveis - Sua imobiliária de confiança",
    description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros.",
    type: "website",
    locale: "pt-BR",
    siteName: "Renata Imóveis",
    url: "https://renataimoveis.com.br",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis - Sua imobiliária de confiança",
      },
    ],
  },
  twitter: {
    title: "Renata Imóveis - Sua imobiliária de confiança",
    description: "Encontre o imóvel dos seus sonhos com a Renata Imóveis. Apartamentos, casas e terrenos nos melhores bairros.",
    card: "summary_large_image",
    images: [
      {
        url: "https://renataimoveis.com.br/og-image.png",
        width: 1200,
        height: 630,
        alt: "Renata Imóveis - Sua imobiliária de confiança",
      },
    ],
  },
  alternates: {
    canonical: "https://renataimoveis.com.br",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <NextTopLoader color="#960000" showSpinner={false} />
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
