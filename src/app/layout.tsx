import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motive. — A Spark of Light, Daily.",
  description:
    "Fuel your journey with curated wisdom and daily inspiration. Join our community for gentle reminders that encourage growth, resilience, and intentional living.",
  keywords: ["motivation", "daily motivation", "inspiration", "quotes", "mindfulness", "motive"],
  openGraph: {
    title: "Motive.",
    description: "A Spark of Light, Daily.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Motive.",
    description: "A Spark of Light, Daily.",
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
