import { useState, useEffect } from 'react';

// Rotating review carousel over a live list. Count comes from the data source
// (zero until reviews load, one or more once known) so the hooks never index
// a static, fabricated array.
export function useTestimonialCarousel(count: number) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % count);
    }, 7000);
    return () => clearInterval(timer);
  }, [count, activeTestimonial]);

  const handleNextTestimonial = () => {
    if (count <= 1) return;
    setActiveTestimonial((prev) => (prev + 1) % count);
  };

  const handlePrevTestimonial = () => {
    if (count <= 1) return;
    setActiveTestimonial((prev) => (prev - 1 + count) % count);
  };

  return { activeTestimonial, setActiveTestimonial, handleNextTestimonial, handlePrevTestimonial };
}