import type { Metadata } from "next";
import "./globals.css";
import SupportWidget from "./support-widget";

export const metadata: Metadata = {
  title: "SponsorPilot: the AI sponsorship broker",
  description:
    "An autonomous AI broker that gets your event sponsored: it researches the sponsors, writes the pitches, negotiates the deals, and drafts the contracts. Free for organizers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="bg-glow" aria-hidden="true" />
        <div className="bg-grid" aria-hidden="true" />
        {children}
        <SupportWidget />
      </body>
    </html>
  );
}
