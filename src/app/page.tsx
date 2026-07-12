import { HeroLanding } from '@/components/sections/hero-landing';
import { HowItWorks } from '@/components/sections/how-it-works';
import { FeatureShowcase } from '@/components/sections/feature-showcase';
import { CTASection } from '@/components/sections/cta-section';

export default function HomePage() {
  return (
    <>
      <HeroLanding />
      <HowItWorks />
      <FeatureShowcase />
      <CTASection />
    </>
  );
}
