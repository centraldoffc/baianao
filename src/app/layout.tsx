import type { Metadata } from "next";
import { Anton, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthProvider from "@/components/AuthProvider";

const display = Anton({
  subsets: ["latin"],
  variable: "--font-display",
  weight: "400",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const data = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-data",
});

export const metadata: Metadata = {
  title: "Baianão — Série A e B",
  description:
    "Tabelas, escalações, elencos, transferências e onde assistir o Campeonato Baiano.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${body.variable} ${data.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main className="mx-auto min-h-[70vh] max-w-6xl px-4 py-6">{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
