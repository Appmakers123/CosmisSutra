
import React from 'react';

export type Language = 'en' | 'hi';

export type ViewMode = 'daily' | 'kundali' | 'panchang' | 'numerology' | 'learning' | 'matchmaking' | 'tarot' | 'compatibility' | 'cosmic-art' | 'story-hub' | 'games' | 'palm-reading' | 'mystic-lens' | 'muhurat' | 'transits' | 'mantra' | 'rudraksh' | 'occult-vault';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
  karma: number;
}

export interface ZodiacSignData {
  id: string;
  name: string;
  hindiName: string; 
  dateRange: string;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  symbol: React.ReactNode;
  description: string;
}

export interface HoroscopeResponse {
  horoscope: string;
  luckyNumber: number;
  luckyColor: string;
  mood: string;
  compatibility: string;
}

export interface KundaliFormData {
  id?: string;
  name: string;
  date: string;
  time: string;
  location: string;
  lat?: number;
  lon?: number;
  tzone?: string;
}

export interface PlanetaryPosition {
  planet: string;
  sign: string;
  signId: number; 
  house: number;
  isRetrograde?: boolean;
  nakshatra?: string;
}

export interface DailyPanchangResponse {
  date: string;
  location: string;
  sunrise: string;
  sunset: string;
  moonrise: string;
  tithi: { name: string; endTime: string };
  nakshatra: { name: string; endTime: string };
  yoga: { name: string; endTime: string };
  karana: { name: string; endTime: string };
  rahuKalam: string;
  yamaganda: string;
  abhijitMuhurat: string;
}

export interface KundaliResponse {
  basicDetails: {
    ascendant: string;
    ascendantSignId: number;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
    name?: string;
  };
  panchang: any;
  charts: {
    planetaryPositions: PlanetaryPosition[];
    navamshaPositions: PlanetaryPosition[];
    navamshaAscendantSignId: number;
  };
  planetAnalysis?: any[];
  dasha: {
    currentMahadasha: string;
    antardasha: string;
    endsAt: string;
    analysis?: string;
  };
  predictions: {
    general: string;
    career: string;
    love: string;
    health: string;
  };
}

export interface MatchMakingInput {
    name: string;
    date: string;
    time: string;
    location: string;
}

export interface MatchMakingResponse {
    ashtakoot_score: any;
    conclusion: {
        status: boolean;
        report: string;
    };
}

export interface NumerologyResponse {
  lifePath: { number: number; description: string };
  destiny: { number: number; description: string };
  soulUrge: { number: number; description: string };
  personality: { number: number; description: string };
  birthday: { number: number; description: string };
  dailyForecast: string;
}

export interface NumerologyInput {
  name: string;
  dob: string;
}

export interface MuhuratItem {
    activity: string;
    status: 'Excellent' | 'Good' | 'Average' | 'Avoid';
    timeRange: string;
    reason: string;
}

export interface TransitResponse {
    currentPositions: PlanetaryPosition[];
    personalImpact: {
        planet: string;
        house: number;
        sign: string;
        meaning: string;
    }[];
}

export interface PalmPrediction {
  line: string;
  meaning: string;
}
