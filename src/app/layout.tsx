import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elevare Sales OS - AI-Powered CRM for Insurance Agents",
  description: "The ultimate sales operating system for life insurance professionals. Capture leads, track calls with AI, manage your pipeline, and close more deals.",
  keywords: ["CRM", "insurance", "sales", "life insurance", "lead management", "AI", "sales automation"],
  authors: [{ name: "Elevare Sales OS" }],
  icons: {
    icon: [
      {
        url: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='20' fill='%2310B981'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-size='50' fill='white'>E</text></svg>",
        type: "image/svg+xml",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
