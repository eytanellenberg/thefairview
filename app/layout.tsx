import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TheFairView - Predictive Sport Analytics",
  description: "RAI/PAI causal attribution for professional sports",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
