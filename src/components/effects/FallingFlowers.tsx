import React, { useMemo, useState, useEffect } from 'react';
import { getThemeSettings, THEME_UPDATED_EVENT, type ThemeSettingsState } from '../../utils/themeSettings';

interface Petal {
  id: number;
  flower: string;
  left: number;
  duration: number;
  delay: number;
  scale: number;
  driftX: number;
  rotEnd: number;
  opacity: number;
}

// Curated delicate petals (soft lotus, divine blossoms, sparkles & tulasi leaves)
const FLOWER_ICONS = [
  '🌸', // Delicate Lotus Petal
  '🪷', // Sacred Lotus
  '✨', // Divine Sparkle
  '🌼', // Jasmine Blossom
  '🍃', // Gentle Leaf
  '💮', // White Parijata
  '🌸', // Pink Lotus
  '🪷'  // Blue/Pink Lotus
];

export const FallingFlowers: React.FC = () => {
  const [enabled, setEnabled] = useState<boolean>(() => getThemeSettings().flowerShower);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeSettingsState>;
      if (customEvent.detail) {
        setEnabled(customEvent.detail.flowerShower);
      }
    };
    window.addEventListener(THEME_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(THEME_UPDATED_EVENT, handleUpdate);
  }, []);

  const petals: Petal[] = useMemo(() => {
    if (!enabled) return [];
    // 16 gentle, micro-sized floating petals (unobtrusive and refined)
    return Array.from({ length: 16 }, (_, i) => {
      const flower = FLOWER_ICONS[i % FLOWER_ICONS.length];
      const left = ((i * 6.2 + (i % 3) * 4.7) % 94) + 3;
      const duration = 9.0 + ((i * 3) % 5) * 1.5;
      const delay = ((i * 0.9) % 11.0);
      // Micro-scaled: 0.45 to 0.65 of standard emoji size
      const scale = 0.45 + (i % 4) * 0.06;
      const driftX = -18 + (i % 5) * 9;
      const rotEnd = 120 + (i % 4) * 60;
      // Soft ambient opacity
      const opacity = 0.30 + (i % 3) * 0.08;

      return {
        id: i,
        flower,
        left,
        duration,
        delay,
        scale,
        driftX,
        rotEnd,
        opacity
      };
    });
  }, []);

  if (!enabled) return null;

  return (
    <div 
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-10 overflow-hidden select-none"
    >
      {petals.map((p) => (
        <div
          key={p.id}
          className="flower-petal"
          style={{
            left: `${p.left}%`,
            fontSize: '14px',
            lineHeight: '1',
            ['--petal-opacity' as string]: p.opacity,
            ['--scale' as string]: p.scale,
            ['--drift-x' as string]: `${p.driftX}px`,
            ['--rot-end' as string]: `${p.rotEnd}deg`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          <span 
            style={{ 
              display: 'inline-block',
              transform: `scale(${p.scale})`,
              transformOrigin: 'center center'
            }}
          >
            {p.flower}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FallingFlowers;
