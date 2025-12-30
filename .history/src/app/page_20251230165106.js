export const metadata = {
  title: "Whisp | Encrypted Chat App",
  description: "Whisp is a modern, encrypted chat app focused on privacy, simplicity, and speed. Start secure conversations instantly.",
  keywords: [
    "encrypted chat",
    "private messaging",
    "real-time chat",
    "secure chat",
    "Whisp"
  ],
  openGraph: {
    title: "Whisp | Encrypted Chat App",
    description: "Whisp is a modern, encrypted chat app focused on privacy, simplicity, and speed. Start secure conversations instantly.",
    url: "https://whispchat.vercel.app/",
    siteName: "Whisp",
    type: "website",
    images: [
      {
        url: "https://whispchat.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Whisp homepage screenshot",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import SecuritySection from '@/components/SecuritySection';
import ShowcaseSection from '@/components/ShowcaseSection';
import Footer from '@/components/Footer';
import CTASection from '@/components/CTASection';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <main className="w-full bg-gray-950">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <ShowcaseSection />
      <ContactSection />
      <CTASection />
      <Footer />
    </main>
  );
}
