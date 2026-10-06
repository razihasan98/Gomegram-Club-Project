import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { ClubSettings } from '../types';

interface ClubContextType {
  settings: ClubSettings;
  formatBDT: (amount: number | string | undefined | null) => string;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const defaultSettings: ClubSettings = {
  club_name: 'Gomegram Swapnosiri Tarun Sangha',
  club_bangla_name: 'Youth & Socio-Cultural Club',
  club_tagline: 'Unity • Culture • Community Welfare',
  club_tagline_en: 'Unity, Culture & Community Welfare',
  established_year: '2018',
  registration_no: 'REG-GS-2018-092',
  club_phone: '+880 1712-345678',
  club_email: 'contact@swapnosiri.org',
  club_address: 'Gomegram, Singair, Manikganj, Dhaka, Bangladesh',
  club_description: 'Gomegram Swapnosiri Tarun Sangha is a leading socio-cultural youth organization dedicated to community empowerment, cultural preservation, blood donation camps, education support, and festive celebrations.',
  facebook_url: 'https://facebook.com/gomegramswapnosiri',
  youtube_url: 'https://youtube.com/@gomegramswapnosiri',
  hide_public_phone: false,
  hide_public_email: false,
  hide_public_address: false,
  hide_public_financials: false,
};

const ClubContext = createContext<ClubContextType | undefined>(undefined);

export const ClubProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ClubSettings>(defaultSettings);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await api.get('/settings');
      if (res.data && res.data.settings) {
        setSettings({ ...defaultSettings, ...res.data.settings });
      }
    } catch {
      // Use defaults if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const formatBDT = (amount: number | string | undefined | null): string => {
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return '৳0';
    }
    const num = Number(amount);
    return '৳' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  return (
    <ClubContext.Provider
      value={{
        settings,
        formatBDT,
        loading,
        refreshSettings: fetchSettings,
      }}
    >
      {children}
    </ClubContext.Provider>
  );
};

export const useClub = () => {
  const context = useContext(ClubContext);
  if (!context) {
    throw new Error('useClub must be used within a ClubProvider');
  }
  return context;
};
