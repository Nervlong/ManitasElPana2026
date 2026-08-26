import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Manitas El Pana — Servicios técnicos a domicilio, al instante",
  description:
    "Montaje IKEA, fontanería, electricidad y más. Cotiza al instante y sigue a tu profesional en tiempo real.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
