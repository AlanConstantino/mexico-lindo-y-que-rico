import type { Metadata } from "next";
import { DM_Sans, Lora } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

export const metadata: Metadata = {
  title: "México Lindo Y Que Rico | Taco Catering in Los Angeles",
  description:
    "Authentic taco catering for your next event. Serving the greater Los Angeles area for over 20 years. Aquí la panza es primero.",
  keywords: [
    "taco catering",
    "Los Angeles",
    "Mexican food",
    "catering service",
    "LA catering",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} ${lora.variable}`}>
      <body>{children}</body>
    </html>
  );
}
