import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface ChristmasConfig {
  isEnabled: boolean;
  bannerText: string;
  showSnow: boolean;
  highlightPacks: boolean;
}

const DEFAULT_CONFIG: ChristmasConfig = {
  isEnabled: true,
  bannerText: " Féerie de Noël chez KPL SERVICES : Réservez vos surprises & décorations de fin d'année !",
  showSnow: true,
  highlightPacks: true,
};

interface ChristmasContextType {
  config: ChristmasConfig;
  updateConfig: (newConfig: Partial<ChristmasConfig>) => Promise<void>;
  toggleChristmas: () => Promise<void>;
  isLoading: boolean;
}

const ChristmasContext = createContext<ChristmasContextType | undefined>(undefined);

export function ChristmasProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<ChristmasConfig>(() => {
    try {
      const saved = localStorage.getItem('kpl_christmas_config');
      return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG;
    } catch {
      return DEFAULT_CONFIG;
    }
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadRemoteConfig = async () => {
      try {
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'christmas_config')
          .maybeSingle();

        if (data && data.value) {
          setConfig((prev) => {
            const merged = { ...prev, ...data.value };
            localStorage.setItem('kpl_christmas_config', JSON.stringify(merged));
            return merged;
          });
        }
      } catch {
        // Fallback local
      }
    };

    loadRemoteConfig();
  }, []);

  const updateConfig = async (newConfig: Partial<ChristmasConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);
    localStorage.setItem('kpl_christmas_config', JSON.stringify(updated));

    try {
      await supabase
        .from('site_settings')
        .upsert({ key: 'christmas_config', value: updated, updated_at: new Date().toISOString() });
    } catch {
      // Fallback local
    }
  };

  const toggleChristmas = async () => {
    await updateConfig({ isEnabled: !config.isEnabled });
  };

  return (
    <ChristmasContext.Provider value={{ config, updateConfig, toggleChristmas, isLoading }}>
      {children}
    </ChristmasContext.Provider>
  );
}

export function useChristmas() {
  const context = useContext(ChristmasContext);
  if (!context) {
    throw new Error('useChristmas must be used within a ChristmasProvider');
  }
  return context;
}
