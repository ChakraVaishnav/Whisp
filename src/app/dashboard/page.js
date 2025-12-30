
export const metadata = {
  title: "Dashboard | Whisp",
  description: "Your private, encrypted dashboard for secure messaging on Whisp.",
  keywords: [
    "dashboard",
    "private chat",
    "encrypted messaging",
    "Whisp",
    "user dashboard"
  ],
  openGraph: {
    title: "Dashboard | Whisp",
    description: "Your private, encrypted dashboard for secure messaging on Whisp.",
    url: "https://whispchat.vercel.app/dashboard",
    siteName: "Whisp",
    type: "website",
    images: [
      {
        url: "https://whispchat.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whisp dashboard screenshot",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import DashboardClient from './DashboardClient';

export default function DashboardPage() {
  return <DashboardClient />;
}
