import type { Metadata } from "next";
import { Anton } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import { PerformanceProvider } from "@/components/PerformanceContext";
import Nav from "@/components/Nav";
import CustomCursor from "@/components/CustomCursor";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ABHISHEK — Full-Stack Developer",
  description:
    "Editorial portfolio of Abhishek, Full-Stack Developer, NestJS Engineer, and Project Manager.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={anton.variable}>
      <body className="bg-[#F5F3EE] text-[#111111] antialiased selection:bg-[#FF4D00] selection:text-[#111111]">
        <PerformanceProvider>
          <CustomCursor />
          <div className="grain-overlay" aria-hidden="true" />
          <SmoothScroll>
            <Nav />
            <main>{children}</main>
          </SmoothScroll>
        </PerformanceProvider>
      </body>
    </html>
  );
}
