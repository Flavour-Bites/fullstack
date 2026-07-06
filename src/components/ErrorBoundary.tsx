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
    const { hasError, error } = this.s();
    if (hasError) {
      if (fallback) return fallback;
      return (
        <div className="min-h-[60vh] flex items-center justify-center px-4 py-20 bg-[#faf7f2] dark:bg-[#111111]">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 bg-stone-100 dark:bg-stone-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-stone-200 dark:border-stone-800">
              <span className="text-2xl font-serif text-lux-gold">!</span>
            </div>
            <h2 className="font-serif text-xl text-stone-900 dark:text-white mb-2">Something went wrong</h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-light mb-6 leading-relaxed">
              {error?.message || "An unexpected error occurred."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-stone-900 hover:bg-lux-gold text-white hover:text-stone-950 font-mono text-xs uppercase font-bold tracking-wider rounded-sm transition-all cursor-pointer"
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
