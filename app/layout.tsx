import type { Metadata } from "next";
import "./globals.css";
import SupportWidget from "./support-widget";

export const metadata: Metadata = {
  title: "SponsorPilot: the AI sponsorship broker",
  description:
    "Describe your event and its minimum deal. SponsorPilot lists fitting sponsors, drafts a pitch for each, and counters their replies above your floor. Free for organizers.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@500;600;700&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <SupportWidget />
      </body>
    </html>
  );
}
