interface AppLoaderProps {
  darkMode: boolean;
}

export default function AppLoader({ darkMode }: AppLoaderProps) {
  return (
    <div className={`min-h-screen flex flex-col justify-center items-center ${darkMode ? 'bg-stone-950' : 'bg-lux-cream'}`}>
      <div className="h-1 w-full bg-gradient-to-r from-stone-900 via-lux-gold to-stone-900 fixed top-0 left-0 z-[1000]" />
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-sm bg-stone-900 flex items-center justify-center animate-pulse">
          <span className="text-lux-gold font-serif text-lg">F</span>
        </div>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-lux-gold animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  );
}