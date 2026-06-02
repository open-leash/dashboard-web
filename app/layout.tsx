import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpenLeash",
  description: "CISO visibility and policy control for local AI agents",
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/openleash-icon.png", type: "image/png" }
    ],
    shortcut: "/favicon.png",
    apple: "/openleash-icon.png"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/openleash.css" />
      </head>
      <body>{children}</body>
    </html>
  );
}
