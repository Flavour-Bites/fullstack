import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundView() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="mb-8">
          <span className="text-8xl font-serif text-lux-gold/30 leading-none">404</span>
        </div>

        <h1 className="font-serif text-2xl text-stone-900 dark:text-stone-100 mb-3">
          Page Not Found
        </h1>
        <p className="text-sm text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-8 font-sans">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back to something delicious.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold hover:text-stone-950 text-white text-xs font-mono uppercase tracking-widest font-bold rounded-sm transition-all cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-lux-gold hover:text-lux-gold text-xs font-mono uppercase tracking-widest rounded-sm transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
