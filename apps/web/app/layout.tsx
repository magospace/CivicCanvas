import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CivicCanvas",
  description: "MCP-powered visual explorer for Texas public datasets."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
