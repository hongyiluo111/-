import Hero from '@/components/Hero';
import GameList from '@/components/GameList';
import FeaturedCompanions from '@/components/FeaturedCompanions';
import Footer from '@/components/Footer';
import MouseGlow from '@/components/MouseGlow';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col page-enter">
      <MouseGlow />
      <Hero />
      <div className="container mx-auto px-4 py-12">
        <GameList />
        <FeaturedCompanions />
      </div>
      <Footer />
    </div>
  );
}
