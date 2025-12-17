import React from 'react';

export type Language = 'en' | 'hi';

export interface User {
  id: string;
  name: string;
  email: string;
  isGuest?: boolean;
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

export interface HistoryItem {
  date: string;
  signId: string;
  data: HoroscopeResponse;
}

export interface KundaliFormData {
  id?: string; // Added ID for saved charts
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
  signId: number; // 1 = Aries, 12 = Pisces
  house: number;
  isRetrograde?: boolean;
}

export interface PanchangDetails {
  tithi: string;
  vara: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  sunrise?: string;
  sunset?: string;
}

// Separate type for the Daily Panchang Tab
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
  // Added for Current Chart Feature
  planetaryPositions?: PlanetaryPosition[];
  ascendantSignId?: number;
}

export interface ShadbalaData {
  planet: string;
  strength: number; // Rupas or score
  isStrong: boolean;
}

// New Types for Advanced API integration
export interface DoshaData {
  present: boolean;
  one_line_description?: string;
}

export interface GemstoneSuggestion {
  name: string;
  gem: string;
  wear_finger: string;
  wear_metal: string;
  wear_day: string;
  reason?: string; // Reason for recommendation
}

export interface GemstoneData {
  life: GemstoneSuggestion;
  lucky: GemstoneSuggestion;
  benefic: GemstoneSuggestion;
}

export interface SadeSatiData {
  is_undergoing: boolean;
  phase: string;
  description: string;
}

export interface YogaData {
  name: string;
  description: string;
}

export interface Remedy {
  title: string;
  description: string;
}

export interface FavorablePoints {
  lucky_number: number;
  lucky_day: string;
  lucky_metal: string;
  lucky_stone: string;
  friendly_numbers: string;
  neutral_numbers: string;
  evil_numbers: string;
}

export interface PlanetAnalysis {
  planet: string;
  position: string;
  analysis: string;
}

export interface KundaliResponse {
  basicDetails: {
    ascendant: string;
    ascendantSignId: number;
    moonSign: string;
    sunSign: string;
    nakshatra: string;
  };
  panchang: PanchangDetails;
  charts: {
    planetaryPositions: PlanetaryPosition[];
    navamshaPositions: PlanetaryPosition[];
    navamshaAscendantSignId: number;
    shadbala: ShadbalaData[];
    d1Svg?: string; // API generated SVG for D1
    d9Svg?: string; // API generated SVG for D9
  };
  details: {
    mangalDosha: DoshaData;
    kalsarpaDosha: DoshaData;
    sadeSati: SadeSatiData;
    gemstones: GemstoneData;
    yogas: YogaData[];
    remedies?: Remedy[];
    favorablePoints?: FavorablePoints;
  };
  planetAnalysis?: PlanetAnalysis[];
  dasha: {
    currentMahadasha: string;
    antardasha: string;
    endsAt: string;
    analysis?: string; // Detailed analysis of the period
  };
  predictions: {
    general: string;
    career: string;
    love: string;
    health: string;
  };
}

// Palm Reading Types
export interface PalmPrediction {
  x: number;
  y: number;
  width: number;
  height: number;
  class: string;
  confidence: number;
}

export interface PalmReadingResponse {
    predictions: PalmPrediction[];
    image?: { width: number; height: number };
}

// Numerology Types
export interface NumerologyInput {
  name: string;
  dob: string; // YYYY-MM-DD
}

export interface NumerologyResponse {
  lifePath: { number: number; description: string };
  destiny: { number: number; description: string };
  soulUrge: { number: number; description: string };
  personality: { number: number; description: string };
  birthday: { number: number; description: string };
  dailyForecast: string;
}

// Matchmaking Types
export interface MatchMakingInput {
    name: string;
    date: string;
    time: string;
    location: string;
    lat?: number;
    lon?: number;
    tzone?: string;
}

export interface AshtakootScore {
    varna: { total_points: number; obtained_points: number; description: string };
    vashya: { total_points: number; obtained_points: number; description: string };
    tara: { total_points: number; obtained_points: number; description: string };
    yoni: { total_points: number; obtained_points: number; description: string };
    graha_maitri: { total_points: number; obtained_points: number; description: string };
    gana: { total_points: number; obtained_points: number; description: string };
    bhakoot: { total_points: number; obtained_points: number; description: string };
    nadi: { total_points: number; obtained_points: number; description: string };
    total: { total_points: number; obtained_points: number; description: string };
}

export interface MatchMakingResponse {
    ashtakoot_score: AshtakootScore;
    conclusion: {
        status: boolean;
        report: string;
    };
    male_kuta?: any; // Extra data if needed
    female_kuta?: any;
}