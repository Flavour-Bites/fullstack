import { motion } from 'motion/react';

export default function ProfileTabPanel({ title, subtitle, children }: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-serif text-stone-900 dark:text-stone-100 font-semibold italic">{title}</h2>
        <p className="text-xs text-stone-400 dark:text-stone-500 font-mono tracking-wider uppercase mt-1">{subtitle}</p>
        <div className="h-[1px] w-full bg-stone-100 dark:bg-stone-850 mt-4" />
      </div>
      <div className="space-y-8 max-w-lg mt-8">{children}</div>
    </motion.div>
  );
}