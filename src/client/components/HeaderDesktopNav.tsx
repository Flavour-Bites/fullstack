import { Link, useLocation } from 'react-router-dom';

interface HeaderDesktopNavProps {
  darkMode: boolean;
}

export default function HeaderDesktopNav({
  darkMode,
}: Readonly<HeaderDesktopNavProps>) {
  const location = useLocation();

  return (
    <nav className="hidden lg:flex items-center gap-1.5 ml-8 mr-auto font-sans">
      {[
        { label: 'Home', path: '/' },
        { label: 'Cake Gallery', path: '/gallery' },
        { label: 'Meet Yodit', path: '/about' },
        { label: 'Contact', path: '/contact' },
      ].map((item) => {
        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`px-3.5 py-1.5 text-[11px] uppercase tracking-widest font-bold transition-all rounded-sm cursor-pointer ${
              isActive
                ? darkMode ? 'text-lux-gold bg-lux-gold/10' : 'text-lux-gold bg-lux-gold/5'
                : darkMode
                  ? 'text-stone-400 hover:text-stone-200 hover:bg-stone-900/50'
                  : 'text-stone-500 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
