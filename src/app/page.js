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
