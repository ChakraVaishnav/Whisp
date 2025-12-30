
export const metadata = {
  title: "Login | Whisp",
  description: "Login to your secure Whisp account for encrypted, private messaging.",
  keywords: [
    "login",
    "Whisp login",
    "secure login",
    "encrypted chat login"
  ],
  openGraph: {
    title: "Login | Whisp",
    description: "Login to your secure Whisp account for encrypted, private messaging.",
    url: "https://whispchat.vercel.app/login",
    siteName: "Whisp",
    type: "website",
    images: [
      {
        url: "https://whispchat.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whisp login screenshot",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import LoginClient from './LoginClient';

export default function LoginPage() {
  return <LoginClient />;
}
