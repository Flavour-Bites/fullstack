interface InitialsAvatarProps {
  name: string;
  className?: string;
}

// Letter avatar derived from a reviewer's name. Reviews store an author string
// (not a photo), so we render initials instead of fetching a remote image.
export default function InitialsAvatar({ name, className = '' }: InitialsAvatarProps) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      aria-hidden="true"
      className={`rounded-full flex items-center justify-center font-semibold text-white bg-lux-gold/70 border border-lux-gold/30 shrink-0 select-none ${className || 'w-12 h-12 text-sm'}`}
    >
      {initials}
    </div>
  );
}