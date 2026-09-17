import React from "react";
import { RotateCcw, Flame } from "lucide-react";
import { motion } from "motion/react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[ErrorBoundary]", error.message, info.componentStack);
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError } = this.state;
    if (hasError) {
      if (fallback) return fallback;
      return (
        <div className="min-h-screen flex items-center justify-center px-4 py-20 bg-stone-50 dark:bg-stone-950 relative overflow-hidden">
          
          {/* Subtle animated smoke/fire background */}
          <div className="absolute inset-0 pointer-events-none opacity-20 dark:opacity-10 mix-blend-multiply dark:mix-blend-screen flex items-end justify-center">
             <div className="w-[120%] h-3/4 bg-gradient-to-t from-orange-500/40 via-red-500/20 to-transparent animate-pulse blur-3xl" />
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="text-center max-w-lg w-full relative z-10 bg-white/90 dark:bg-stone-900/90 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-stone-100 dark:border-stone-800"
          >
            <div className="mb-8 relative flex justify-center">
              <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center relative">
                 <div className="absolute inset-0 rounded-full border-2 border-red-200 dark:border-red-900/30 animate-ping opacity-75" style={{ animationDuration: '2s' }} />
                 <Flame className="w-12 h-12 text-red-500 dark:text-red-400 animate-bounce" style={{ animationDuration: '1.5s' }} />
              </div>
            </div>
            
            <div className="inline-block px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-mono tracking-widest uppercase font-bold rounded-full mb-6">
              Error 500
            </div>

            <h1 className="font-serif text-4xl text-stone-900 dark:text-stone-100 mb-4 tracking-tight">
              Kitchen Disaster!
            </h1>
            
            <p className="text-lg text-stone-700 dark:text-stone-300 font-light mb-3">
              Looks like our oven caught fire while preparing this page. 
            </p>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light mb-10 leading-relaxed font-sans">
              Our chefs (developers) have been notified of this Internal Server Error and are putting out the flames. Please bear with us and try reloading the page.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-mono uppercase tracking-widest font-bold rounded-sm transition-all shadow-lg shadow-red-600/20 hover:shadow-red-600/40 hover:-translate-y-0.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                Try Reloading
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800 text-xs font-mono uppercase tracking-widest rounded-sm transition-all cursor-pointer"
              >
                Flee the Kitchen
              </a>
            </div>
          </motion.div>
        </div>
      );
    }
    return children;
  }
}
