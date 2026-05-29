import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import GameList from '@/components/GameList';
import FeaturedCompanions from '@/components/FeaturedCompanions';
import Footer from '@/components/Footer';

function SectionSkeleton({ height }: { height: string }) {
  return (
    <div className={`${height} animate-pulse`}>
      <div className="mx-auto mb-6 h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="mx-auto mb-10 h-4 w-72 rounded bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card h-48 bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
    </div>
  );
}

const PlatformStats = dynamic(() => import('@/components/PlatformStats'), { loading: () => <SectionSkeleton height="py-16" /> });
const HowItWorks = dynamic(() => import('@/components/HowItWorks'), { loading: () => <SectionSkeleton height="py-12" /> });
const FeaturedClubs = dynamic(() => import('@/components/FeaturedClubs'), { loading: () => <SectionSkeleton height="py-16" /> });
const RankingPreview = dynamic(() => import('@/components/RankingPreview'), { loading: () => <SectionSkeleton height="py-16" /> });
const Testimonials = dynamic(() => import('@/components/Testimonials'), { loading: () => <SectionSkeleton height="py-16" /> });

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col page-enter">
      <Hero />
      <div className="container mx-auto px-4 py-12 space-y-20">
        <GameList />
        <FeaturedCompanions />
        <FeaturedClubs />
        <RankingPreview />
        <HowItWorks />
        <PlatformStats />
        <Testimonials />
      </div>
      <Footer />
    </div>
  );
}
