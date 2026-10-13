import React, { useId } from 'react';

export interface LiquidAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  tint?: string;
  size?: number;
  fallback?: React.ReactNode;
  className?: string;
}

// Generate consistent hash hue from name string
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0;i < str.length;i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Extract up to 2 uppercase initials
function getInitials(name?: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const LiquidAvatar: React.FC<LiquidAvatarProps> = ({
  name = '',
  avatarUrl,
  tint,
  size = 36,
  fallback,
  className = '',
}) => {
  const filterId = useId().replace(/:/g, '');

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'User avatar'}
        style={{ width: size, height: size }}
        className={`rounded-full object-cover shadow-sm ${className}`}
      />
    );
  }

  // Determine base colors from tint or string hash
  const hash = hashString(name || 'avatar');
  const hue1 = hash % 360;
  const hue2 = (hue1 + 60) % 360;
  const hue3 = (hue1 + 140) % 360;

  const bgGradient = tint
    ? `radial-gradient(circle at 30% 30%, ${tint} 0%, rgba(24, 24, 27, 0.95) 100%)`
    : `radial-gradient(circle at 20% 20%, hsl(${hue1}, 85%, 65%) 0%, hsl(${hue2}, 75%, 50%) 50%, hsl(${hue3}, 80%, 35%) 100%)`;

  const initials = getInitials(name);

  return (
    <div
      style={{ width: size, height: size, background: bgGradient }}
      className={`relative rounded-full flex items-center justify-center text-white font-mono font-bold shadow-sm overflow-hidden select-none shrink-0 ${className}`}
    >
      {/* Liquid Organic Wave SVG Distortion Layer */}
      <svg className="absolute inset-0 w-full h-full opacity-35 pointer-events-none" viewBox="0 0 100 100">
        <defs>
          <filter id={`liquid-${filterId}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="3" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="15" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <circle cx="50" cy="50" r="45" fill="white" filter={`url(#liquid-${filterId})`} />
      </svg>

      {/* Glassmorphic Inner Radial Shimmer Accent */}
      <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/30 rounded-full pointer-events-none" />

      {/* Center Content: Initials or Fallback Icon */}
      <div className="relative z-10 flex items-center justify-center text-white font-mono drop-shadow-xs">
        {fallback ? (
          fallback
        ) : (
          <span style={{ fontSize: Math.max(10, Math.floor(size * 0.38)) }}>
            {initials || '?'}
          </span>
        )}
      </div>
    </div>
  );
};
