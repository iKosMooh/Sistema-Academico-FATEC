import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionWrapper } from "./providers/SessionWrapper";
import Header from "./components/Header/Header";
import Footer from "./components/Footer/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SOFTMARE - Sistema Acadêmico",
  description: "Sistema Integrado de Gestão Educacional",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <SessionWrapper>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </SessionWrapper>
      </body>
    </html>
  );
}
