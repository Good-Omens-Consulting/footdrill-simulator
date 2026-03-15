import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Foot Drill Simulator",
  description:
    "Interactive 3D foot drill training simulator for scouts and cadets",
  openGraph: {
    title: "Foot Drill Simulator",
    description:
      "Interactive 3D foot drill training simulator for scouts and cadets",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0a0a0a] h-full overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
