import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import {
  getThemeSettings,
  saveThemeSettings,
  applyThemeToDOM,
  THEME_PALETTES,
  THEME_UPDATED_EVENT,
  type ThemeSettingsState,
  type ThemeMode,
  type ThemePaletteId,
  type ThemePaletteConfig
} from '../utils/themeSettings';

export interface ThemeStyles {
  bannerGradient: string;
  primaryTextColor: string;
  accentBorderColor: string;
  subtleBgColor: string;
  btnPrimary: string;
  badgeClass: string;
  activeRing: string;
}

const PALETTE_STYLES_MAP: Record<ThemePaletteId, ThemeStyles> = {
  saffron: {
    bannerGradient: 'from-amber-600 via-orange-600 to-amber-700',
    primaryTextColor: 'text-amber-600 dark:text-amber-400',
    accentBorderColor: 'border-amber-200 dark:border-amber-800/60',
    subtleBgColor: 'bg-amber-50 dark:bg-amber-950/25',
    btnPrimary: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/25',
    badgeClass: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800',
    activeRing: 'ring-amber-500'
  },
  lotus: {
    bannerGradient: 'from-rose-600 via-pink-600 to-rose-700',
    primaryTextColor: 'text-rose-600 dark:text-rose-400',
    accentBorderColor: 'border-rose-200 dark:border-rose-800/60',
    subtleBgColor: 'bg-rose-50 dark:bg-rose-950/25',
    btnPrimary: 'bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/25',
    badgeClass: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-300 dark:border-rose-800',
    activeRing: 'ring-rose-500'
  },
  emerald: {
    bannerGradient: 'from-emerald-600 via-teal-600 to-emerald-700',
    primaryTextColor: 'text-emerald-600 dark:text-emerald-400',
    accentBorderColor: 'border-emerald-200 dark:border-emerald-800/60',
    subtleBgColor: 'bg-emerald-50 dark:bg-emerald-950/25',
    btnPrimary: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-emerald-500/25',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800',
    activeRing: 'ring-emerald-500'
  },
  ocean: {
    bannerGradient: 'from-blue-600 via-indigo-600 to-blue-700',
    primaryTextColor: 'text-blue-600 dark:text-blue-400',
    accentBorderColor: 'border-blue-200 dark:border-blue-800/60',
    subtleBgColor: 'bg-blue-50 dark:bg-blue-950/25',
    btnPrimary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25',
    badgeClass: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800',
    activeRing: 'ring-blue-500'
  },
  royal: {
    bannerGradient: 'from-purple-600 via-violet-600 to-indigo-700',
    primaryTextColor: 'text-purple-600 dark:text-purple-400',
    accentBorderColor: 'border-purple-200 dark:border-purple-800/60',
    subtleBgColor: 'bg-purple-50 dark:bg-purple-950/25',
    btnPrimary: 'bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white shadow-purple-500/25',
    badgeClass: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800',
    activeRing: 'ring-purple-500'
  },
  sunrise: {
    bannerGradient: 'from-orange-600 via-amber-600 to-red-600',
    primaryTextColor: 'text-orange-600 dark:text-orange-400',
    accentBorderColor: 'border-orange-200 dark:border-orange-800/60',
    subtleBgColor: 'bg-orange-50 dark:bg-orange-950/25',
    btnPrimary: 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-orange-500/25',
    badgeClass: 'bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800',
    activeRing: 'ring-orange-500'
  }
};

interface ThemeContextType {
  settings: ThemeSettingsState;
  paletteConfig: ThemePaletteConfig;
  styles: ThemeStyles;
  setMode: (mode: ThemeMode) => void;
  setPalette: (palette: ThemePaletteId) => void;
  toggleFlowerShower: () => void;
  toggleLighting: () => void;
  toggleBackground: () => void;
  resetDefaults: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ThemeSettingsState>(() => getThemeSettings());

  useEffect(() => {
    applyThemeToDOM(settings);

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<ThemeSettingsState>;
      if (customEvent.detail) {
        setSettings(customEvent.detail);
        applyThemeToDOM(customEvent.detail);
      }
    };

    window.addEventListener(THEME_UPDATED_EVENT, handleUpdate);
    return () => window.removeEventListener(THEME_UPDATED_EVENT, handleUpdate);
  }, []);

  const setMode = (mode: ThemeMode) => {
    const updated = saveThemeSettings({ mode });
    setSettings(updated);
    applyThemeToDOM(updated);
  };

  const setPalette = (palette: ThemePaletteId) => {
    const updated = saveThemeSettings({ palette });
    setSettings(updated);
    applyThemeToDOM(updated);
  };

  const toggleFlowerShower = () => {
    const updated = saveThemeSettings({ flowerShower: !settings.flowerShower });
    setSettings(updated);
    applyThemeToDOM(updated);
  };

  const toggleLighting = () => {
    const updated = saveThemeSettings({ lightingEffects: !settings.lightingEffects });
    setSettings(updated);
    applyThemeToDOM(updated);
  };

  const toggleBackground = () => {
    const updated = saveThemeSettings({ backgroundAtmosphere: !settings.backgroundAtmosphere });
    setSettings(updated);
    applyThemeToDOM(updated);
  };

  const resetDefaults = () => {
    const def: ThemeSettingsState = {
      mode: 'light',
      palette: 'emerald',
      flowerShower: false, // Default off to prevent screen clutter unless devotee requests it
      lightingEffects: true,
      backgroundAtmosphere: true
    };
    saveThemeSettings(def);
    setSettings(def);
    applyThemeToDOM(def);
  };

  const paletteConfig = THEME_PALETTES.find(p => p.id === settings.palette) || THEME_PALETTES[0];
  const styles = PALETTE_STYLES_MAP[settings.palette] || PALETTE_STYLES_MAP.saffron;

  return (
    <ThemeContext.Provider
      value={{
        settings,
        paletteConfig,
        styles,
        setMode,
        setPalette,
        toggleFlowerShower,
        toggleLighting,
        toggleBackground,
        resetDefaults
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
