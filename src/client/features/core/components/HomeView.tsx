import { Product } from '@shared/types';
import { usePageTitle } from '../hooks/usePageTitle';
import { useFeaturedCakes } from '../hooks/useFeaturedCakes';
import { useTestimonialCarousel } from '../hooks/useTestimonialCarousel';
import { useReviews } from '../hooks/useReviews';
import HomeHero from './home/HomeHero';
import HomeTrustSeals from './home/HomeTrustSeals';
import HomeCollections from './home/HomeCollections';
import HomePhilosophy from './home/HomePhilosophy';
import HomeProcess from './home/HomeProcess';
import HomeShowcase from './home/HomeShowcase';
import HomeTestimonials from './home/HomeTestimonials';
import HomeFinalCta from './home/HomeFinalCta';

interface HomeViewProps {
  onSelectCake: (cake: Product) => void;
}

export default function HomeView({ onSelectCake }: HomeViewProps) {
  usePageTitle("Home");
  const featuredCakes = useFeaturedCakes();
  const { reviews, isLoading: reviewsLoading } = useReviews();
  const testimonials = useTestimonialCarousel(reviews.length);

  return (
    <div className="space-y-24 pb-16 overflow-hidden">
      {/* 1. HERO SECTION: Full-Bleed Dark & High-End Dramatic Mood */}
      <HomeHero />

      {/* 2. SOCIAL PROOF STRIP: Elegant Trust Seals */}
      <HomeTrustSeals />

      {/* 3. FLAGSHIP COLLECTIONS: Beautiful Cakes For Every Occasion */}
      <HomeCollections />

      {/* 4. THE BESPOKE PHILOSOPHY: The Standard of Excellence & Sourcing */}
      <HomePhilosophy />

      {/* 5. PROCESS SECTION: Dashed Guidelines and Steps */}
      <HomeProcess />

      {/* 6. CURATED SHOWCASE (Bento Asymmetrical Preview Grid) */}
      <HomeShowcase featuredCakes={featuredCakes} onSelectCake={onSelectCake} />

      {/* 7. SWEETEST STORIES: Refined Quotation Carousel */}
      <HomeTestimonials
        reviews={reviews}
        isLoading={reviewsLoading}
        activeIndex={testimonials.activeTestimonial}
        onSelect={testimonials.setActiveTestimonial}
        onPrev={testimonials.handlePrevTestimonial}
        onNext={testimonials.handleNextTestimonial}
      />

      {/* 8. FINAL CTA: Dramatic espresso canvas with gold heading */}
      <HomeFinalCta />
    </div>
  );
}