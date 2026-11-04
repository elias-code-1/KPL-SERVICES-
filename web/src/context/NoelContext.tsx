import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '../lib/supabase';

export type NoelMode = 'off' | 'on' | 'auto';

export interface NoelSettings {
  mode: NoelMode;
  date_debut: string; // Format YYYY-MM-DD
  date_fin: string; // Format YYYY-MM-DD
  texte_banniere: string;
  date_limite_commandes: string | null;
}

export const DEFAULT_NOEL_SETTINGS: NoelSettings = {
  mode: 'off',
  date_debut: '2026-12-01',
  date_fin: '2027-01-02',
  texte_banniere: 'Les réservations pour Noël et le Réveillon sont ouvertes ! Places limitées',
  date_limite_commandes: null,
};

export interface NoelContextValue {
  isNoel: boolean;
  settings: NoelSettings;
  loading: boolean;
}

const CACHE_KEY = 'kpl-noel-cache';

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function computeIsNoel(settings: NoelSettings): boolean {
  if (settings.mode === 'on') return true;
  if (settings.mode === 'off') return false;
  if (settings.mode === 'auto') {
    const today = getLocalDateString();
    return today >= settings.date_debut && today <= settings.date_fin;
  }
  return false;
}

function loadInitialState(): { settings: NoelSettings; isNoel: boolean } {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object') {
          const mergedSettings: NoelSettings = {
            ...DEFAULT_NOEL_SETTINGS,
            ...(parsed.settings || {}),
          };
          const active = computeIsNoel(mergedSettings);
          return {
            settings: mergedSettings,
            isNoel: typeof parsed.isNoel === 'boolean' ? parsed.isNoel : active,
          };
        }
      }
    }
  } catch (err) {
    console.warn('[NoelContext] Impossible de lire le cache localStorage:', err);
  }
  return {
    settings: DEFAULT_NOEL_SETTINGS,
    isNoel: false,
  };
}

const NoelContext = createContext<NoelContextValue | undefined>(undefined);

export function NoelProvider({ children }: { children: ReactNode }) {
  const [initial] = useState(loadInitialState);
  const [settings, setSettings] = useState<NoelSettings>(initial.settings);
  const [isNoel, setIsNoel] = useState<boolean>(initial.isNoel);
  const [loading, setLoading] = useState<boolean>(true);

  // Synchronisation de l'attribut data-theme="noel" sur document.documentElement
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (isNoel) {
        document.documentElement.setAttribute('data-theme', 'noel');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    }
  }, [isNoel]);

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'noel')
        .maybeSingle();

      if (error) {
        console.error('[NoelContext] Erreur lors de la récupération des réglages Noël:', error);
        return;
      }

      const rawValue = data?.value;
      const mergedSettings: NoelSettings = {
        ...DEFAULT_NOEL_SETTINGS,
        ...(rawValue && typeof rawValue === 'object' ? rawValue : {}),
      };

      const active = computeIsNoel(mergedSettings);

      setSettings(mergedSettings);
      setIsNoel(active);

      try {
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ settings: mergedSettings, isNoel: active })
        );
      } catch (cacheErr) {
        console.warn('[NoelContext] Impossible d\'écrire dans le cache localStorage:', cacheErr);
      }
    } catch (err) {
      console.error('[NoelContext] Erreur inattendue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Lecture initiale au montage
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Ré-écoute quand l'onglet redevient visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchSettings]);

  return (
    <NoelContext.Provider value={{ isNoel, settings, loading }}>
      {children}
    </NoelContext.Provider>
  );
}

export function useNoel(): NoelContextValue {
  const context = useContext(NoelContext);
  if (!context) {
    throw new Error('useNoel must be used within a NoelProvider');
  }
  return context;
}
