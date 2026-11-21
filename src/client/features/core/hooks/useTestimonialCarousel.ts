import { useState, useEffect } from 'react';

const ROTATION_INTERVAL_MS = 7000;

export function useTestimonialCarousel(count: number = 0) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (count <= 1) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % count);
    }, ROTATION_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [activeTestimonial, count]);

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