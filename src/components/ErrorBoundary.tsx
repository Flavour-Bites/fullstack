import React from "react";

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

  private p = () => (this as any).props as Props;
  private s = () => (this as any).state as State;

  render() {
    const { fallback, children } = this.p();
    const { hasError } = this.s();
    if (hasError) {
      if (fallback) return fallback;
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-20">
          <div className="text-center max-w-md">
            <div className="mb-6">
              <span className="text-6xl font-serif text-lux-gold/20 leading-none">!</span>
            </div>
            <h2 className="font-serif text-xl text-stone-900 dark:text-stone-100 mb-3">
              Something went wrong
            </h2>
            <p className="text-sm text-stone-500 dark:text-stone-400 font-light mb-8 leading-relaxed font-sans">
              An unexpected error occurred. Please try reloading the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-stone-900 dark:bg-stone-800 hover:bg-lux-gold hover:text-stone-950 text-white text-xs font-mono uppercase tracking-widest font-bold rounded-sm transition-all cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return children;
  }
}
