import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from '../context/AuthContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Whisp";
const description = "A modern, encrypted chat app focused on privacy, simplicity, and speed.";
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://whispchat.vercel.app";

export const metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Whisp",
    template: "%s | Whisp",
  },
  description,
  keywords: [
    "encrypted chat",
    "private messaging",
    "real-time chat",
    "Next.js",
    "socket.io",
  ],
  authors: [{ name: "Whisp Team", url: "https://whispchat.vercel.app" }],
  openGraph: {
    title,
    description,
    url: baseUrl,
    siteName: "Whisp",
    type: "website",
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Whisp encrypted chat interface",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    creator: "@WhispApp",
    images: [`${baseUrl}/twitter-card.png`],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  verification: {
    google: "jka4DRBGLCNJ_bMO3bCsvIu1JzP7aLQoiF_-cUn7-lE",
  },
  referrer: 'strict-origin-when-cross-origin',
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">

      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
