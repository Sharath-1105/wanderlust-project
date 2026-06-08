import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wanderlust — AI-Powered Travel Planning",
  description:
    "Plan smarter, travel better. Wanderlust uses Gemini AI to craft personalized itineraries, discover destinations, and book your dream trip in seconds.",
  keywords: ["travel", "AI trip planner", "itinerary", "booking", "wanderlust"],
  openGraph: {
    title: "Wanderlust — AI-Powered Travel Planning",
    description: "Plan smarter, travel better with Wanderlust AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-inter">{children}</body>
    </html>
  );
}
