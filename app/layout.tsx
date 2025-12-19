export const dynamic = "force-dynamic";
import "./globals.css";

export const metadata = {
  title: "The Fair View",
  description: "Predictive Sport Analytics with RAI/PAI"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
