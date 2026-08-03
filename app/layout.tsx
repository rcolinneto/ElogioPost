import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ElogioPost",
  description:
    "Transforme os elogios que seus clientes mandam no WhatsApp em posts prontos pra postar no Instagram.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
