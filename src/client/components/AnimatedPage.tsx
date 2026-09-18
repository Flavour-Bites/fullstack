import React from 'react';
import { motion } from 'motion/react';

interface AnimatedPageProps {
  children: React.ReactNode;
}

export default function AnimatedPage({ children }: Readonly<AnimatedPageProps>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  );
}
