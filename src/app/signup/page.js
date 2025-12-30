
export const metadata = {
  title: "Sign Up | Whisp",
  description: "Create your free Whisp account for secure, encrypted messaging.",
  keywords: [
    "sign up",
    "register",
    "Whisp signup",
    "encrypted chat registration"
  ],
  openGraph: {
    title: "Sign Up | Whisp",
    description: "Create your free Whisp account for secure, encrypted messaging.",
    url: "https://whispchat.vercel.app/signup",
    siteName: "Whisp",
    type: "website",
    images: [
      {
        url: "https://whispchat.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whisp signup screenshot",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

import SignupClient from './SignupClient';

export default function SignupPage() {
  return <SignupClient />;
}
