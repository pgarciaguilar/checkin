import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({ subsets: ["latin"], variable: "--font-display", weight: ["400", "600", "700", "800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["300", "400", "500"] });

export const metadata: Metadata = {
  title: "Check-in Online",
  description: "Check-in online per a allotjaments rurals",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ca" className={`${syne.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
