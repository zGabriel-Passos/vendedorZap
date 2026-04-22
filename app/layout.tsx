import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const bodyFont = localFont({
  src: "../node_modules/next/dist/esm/next-devtools/server/font/geist-latin.woff2",
  variable: "--font-body",
});

const geistMono = localFont({
  src: "../node_modules/next/dist/esm/next-devtools/server/font/geist-mono-latin.woff2",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Vendedor Zap",
  description: "Conecte seu WhatsApp, ative um bot de vendas com IA e receba pagamentos PIX.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${bodyFont.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
