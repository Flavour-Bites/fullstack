export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1 as const,
      duration: 0.15,
    },
  },
};

export const cardVariants = {
  hidden: { opacity: 0, y: 15, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 110,
      damping: 16,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    transition: { duration: 0.12, ease: 'easeInOut' as const },
  },
};