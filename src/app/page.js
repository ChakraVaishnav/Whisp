import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import SecuritySection from '@/components/SecuritySection';
import ShowcaseSection from '@/components/ShowcaseSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <main className="w-full bg-gray-950">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <SecuritySection />
      <ShowcaseSection />
      <CTASection />
      <Footer />
    </main>
  );
}
