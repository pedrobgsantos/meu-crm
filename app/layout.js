import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata = {
  title: "CRM Inteligente",
  description: "Assistente executivo inteligente",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${geist.variable} h-full`}>
      <body className="h-full bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
