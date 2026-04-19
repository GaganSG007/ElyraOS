import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VE OS - Media Gallery",
  description: "Steam-style media gallery experience",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
  themeColor: "#1e293b",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    title: "VE OS - Media Gallery",
    description: "Experience a futuristic OS-inspired portfolio",
    url: "https://elyra-os.vercel.app",
    siteName: "VE OS",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VE OS - Media Gallery",
    description: "A futuristic OS-style portfolio",
    images: ["/preview.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}
    >
      <body style={{ height: '100%', width: '100%', margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
