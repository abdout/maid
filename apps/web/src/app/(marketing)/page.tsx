import {
  HeroSection,
  InspirationSection,
  FeaturesSection,
  HowItWorksSection,
  DownloadSection,
  PopularMaids,
  RecentMaids,
  HostingCta,
  TestimonialsSection,
} from '@/components/marketing';

export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <PopularMaids />
      <RecentMaids />
      <InspirationSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <HostingCta />
      <DownloadSection />
    </>
  );
}
