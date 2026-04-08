import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "StayNP — Discover Nepal, Stay Local",
  description:
    "Find unique homestays, lodges, and heritage stays across Nepal. From Kathmandu to Everest, experience authentic Nepali hospitality with StayNP.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen flex flex-col">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "12px",
              padding: "12px 20px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#2D6A4F", secondary: "#fff" } },
            error: { iconTheme: { primary: "#C41E3A", secondary: "#fff" } },
          }}
        />
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
