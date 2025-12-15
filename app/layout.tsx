import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheFairView - Attribution Causale Sportive",
  description: "Analyse RAI/PAI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
