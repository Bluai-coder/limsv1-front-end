
// ============================================================
// app/layout.jsx — FINAL CORRECT VERSION
// ============================================================

import { Inter, Playfair_Display } from "next/font/google";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

import { Providers } from "./providers";
import "@/styles/globals.css";

// 🔹 Fonts
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// 🔹 Metadata
export const metadata = {
  title: { default: "BluLiMS", template: "%s | BluLiMS" },
  description: "Laboratory Information Management System",
};

// 🔹 Root Layout
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`
        ${GeistSans.variable}
        ${GeistMono.variable}
        ${inter.variable}
        ${playfair.variable}
      `}
    >
      <body className="bg-gray-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}