import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Daily Motivations — One message. That's all you need today.",
  description:
    "A clean, distraction-free space where you receive one impactful motivation. No feeds, no noise — just one powerful message to carry with you.",
  keywords: ["motivation", "daily motivation", "inspiration", "quotes", "mindfulness"],
  openGraph: {
    title: "Daily Motivations",
    description: "One message. That's all you need today.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Motivations",
    description: "One message. That's all you need today.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
