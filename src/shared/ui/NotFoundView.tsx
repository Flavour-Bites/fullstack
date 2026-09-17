import { motion } from 'motion/react';
import { Home, ArrowLeft } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function NotFoundView() {
  const navigate = useNavigate();
  return (
    <div className="min-h-[80vh] flex flex-col md:flex-row items-center justify-center px-4 py-20 gap-12 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.02]">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="sprinkles" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <rect x="10" y="20" width="4" height="12" rx="2" fill="currentColor" transform="rotate(45 12 26)" />
              <rect x="40" y="60" width="4" height="12" rx="2" fill="currentColor" transform="rotate(-30 42 66)" />
              <rect x="80" y="30" width="4" height="12" rx="2" fill="currentColor" transform="rotate(15 82 36)" />
              <circle cx="20" cy="80" r="3" fill="currentColor" />
              <circle cx="70" cy="90" r="3" fill="currentColor" />
            </pattern>
          </defs>
          <rect x="0" y="0" width="100%" height="100%" fill="url(#sprinkles)" />
        </svg>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-10 hidden md:block"
      >
        <div className="relative w-72 h-72">
           {/* Cake with missing slice SVG */}
           <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
             <motion.path 
               initial={{ pathLength: 0, opacity: 0 }} 
               animate={{ pathLength: 1, opacity: 1 }} 
               transition={{ duration: 1.5, delay: 0.2 }}
               d="M100 40 C 150 40, 180 60, 180 90 C 180 95, 178 100, 175 105 L 175 150 C 175 180, 150 190, 100 190 C 50 190, 25 180, 25 150 L 25 105 C 22 100, 20 95, 20 90 C 20 60, 50 40, 100 40 Z" 
               fill="#FDE68A" 
               className="dark:fill-stone-850"
             />
             <path d="M25 105 C 50 115, 150 115, 175 105" stroke="#D97706" strokeWidth="4" fill="none" className="dark:stroke-lux-gold opacity-50"/>
             
             {/* Missing slice overlay, creating cutout effect */}
             <motion.path 
               initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
               animate={{ x: 30, y: -30, opacity: 0, rotate: 15 }}
               transition={{ duration: 1.2, delay: 1, ease: "anticipate" }}
               d="M100 40 L 160 100 C 140 110, 100 112, 100 112 Z" 
               fill="#FEF3C7" 
               className="dark:fill-stone-950"
               style={{ transformOrigin: "100px 40px" }}
             />
             
             {/* The gap inside the cake */}
             <path d="M100 40 L 160 100 C 140 110, 100 112, 100 112 Z" fill="#D97706" className="dark:fill-lux-gold opacity-10"/>
             
             {/* Decor */}
             <circle cx="60" cy="65" r="8" fill="#EF4444" className="dark:fill-red-500" />
             <circle cx="140" cy="65" r="8" fill="#EF4444" className="dark:fill-red-500" />
             <circle cx="100" cy="75" r="8" fill="#EF4444" className="dark:fill-red-500" />
             
             {/* Missing Decor */}
             <motion.circle 
               initial={{ opacity: 1, x: 0, y: 0 }}
               animate={{ opacity: 0, x: 20, y: -20 }}
               transition={{ duration: 1, delay: 1, ease: "anticipate" }}
               cx="130" cy="50" r="8" fill="#EF4444" 
             />
           </svg>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center md:text-left max-w-md relative z-10"
      >
        <div className="mb-4">
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="text-[100px] sm:text-[120px] font-serif font-bold text-lux-gold leading-none drop-shadow-md inline-block"
          >
            4
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.5 }}
            className="text-[100px] sm:text-[120px] font-serif font-bold text-stone-300 dark:text-stone-800 leading-none drop-shadow-md inline-block mx-1 sm:mx-2"
          >
            0
          </motion.span>
          <motion.span 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="text-[100px] sm:text-[120px] font-serif font-bold text-lux-gold leading-none drop-shadow-md inline-block"
          >
            4
          </motion.span>
        </div>

        <h1 className="font-serif text-3xl sm:text-4xl text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
          Someone took a bite out of this page!
        </h1>
        <p className="text-base text-stone-500 dark:text-stone-400 font-light leading-relaxed mb-8 font-sans">
          The page you're looking for doesn't exist, has been moved, or was just too delicious to leave alone. 
          Let's get you back to the bakery.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-stone-900 dark:bg-lux-gold text-white dark:text-stone-950 hover:bg-lux-gold dark:hover:bg-white hover:text-stone-950 text-xs font-mono uppercase tracking-widest font-bold rounded-sm transition-all shadow-xl hover:shadow-lux-gold/20 hover:-translate-y-0.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Back to Home
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-lux-gold hover:bg-lux-gold/5 hover:text-lux-gold text-xs font-mono uppercase tracking-widest rounded-sm transition-all hover:-translate-y-0.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
