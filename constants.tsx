import React from 'react';
import { ZodiacSignData, Language } from './types';

const IconWrapper = ({ children }: { children?: React.ReactNode }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
    {children}
  </svg>
);

export const ZODIAC_SIGNS: ZodiacSignData[] = [
  {
    id: 'aries',
    name: 'Aries',
    hindiName: 'मेष',
    dateRange: 'Mar 21 - Apr 19',
    element: 'Fire',
    description: 'The Ram',
    symbol: <IconWrapper><path d="M12 21a9 9 0 0 0 9-9h-9v9" /><path d="M12 21a9 9 0 0 1-9-9h9v9" /><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z" opacity="0" /><path d="M12 3v9" /><path d="M6.5 6.5C8 5 10 4 12 4s4 1 5.5 2.5" /></IconWrapper>
  },
  {
    id: 'taurus',
    name: 'Taurus',
    hindiName: 'वृषभ',
    dateRange: 'Apr 20 - May 20',
    element: 'Earth',
    description: 'The Bull',
    symbol: <IconWrapper><path d="M7 12a5 5 0 1 0 10 0A5 5 0 1 0 7 12z" /><path d="M6 6c0 4 2 6 6 6s6-2 6-6" /><path d="M12 12v9" /></IconWrapper>
  },
  {
    id: 'gemini',
    name: 'Gemini',
    hindiName: 'मिथुन',
    dateRange: 'May 21 - Jun 20',
    element: 'Air',
    description: 'The Twins',
    symbol: <IconWrapper><path d="M6 3v18" /><path d="M18 3v18" /><path d="M6 7h12" /><path d="M6 17h12" /><path d="M4.5 3h15" /><path d="M4.5 21h15" /></IconWrapper>
  },
  {
    id: 'cancer',
    name: 'Cancer',
    hindiName: 'कर्क',
    dateRange: 'Jun 21 - Jul 22',
    element: 'Water',
    description: 'The Crab',
    symbol: <IconWrapper><path d="M6 12a3 3 0 1 0 3-3" /><path d="M18 12a3 3 0 1 1-3 3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M9 12h6" opacity="0.5" /></IconWrapper>
  },
  {
    id: 'leo',
    name: 'Leo',
    hindiName: 'सिंह',
    dateRange: 'Jul 23 - Aug 22',
    element: 'Fire',
    description: 'The Lion',
    symbol: <IconWrapper><path d="M16 3.5a2.5 2.5 0 1 0-4.5 2 2.5 2.5 0 1 1-4.5 2A2.5 2.5 0 0 0 4.5 10v1a8 8 0 1 0 16 0" /><circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.2" /></IconWrapper>
  },
  {
    id: 'virgo',
    name: 'Virgo',
    hindiName: 'कन्या',
    dateRange: 'Aug 23 - Sep 22',
    element: 'Earth',
    description: 'The Virgin',
    symbol: <IconWrapper><path d="M4 4v16" /><path d="M4 12c0-3 2-4 4-4s4 2 4 5v7" /><path d="M12 12c0-3 2-4 4-4s4 2 4 5v7c0 2 2 3 3 1" /></IconWrapper>
  },
  {
    id: 'libra',
    name: 'Libra',
    hindiName: 'तुला',
    dateRange: 'Sep 23 - Oct 22',
    element: 'Air',
    description: 'The Scales',
    symbol: <IconWrapper><path d="M12 21v-8" /><path d="M5 13h14" /><path d="M5 13a4 4 0 0 1 6.5-2.5" /><path d="M12 10.5A4 4 0 0 1 19 13" /><line x1="4" y1="21" x2="20" y2="21" /></IconWrapper>
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    hindiName: 'वृश्चिक',
    dateRange: 'Oct 23 - Nov 21',
    element: 'Water',
    description: 'The Scorpion',
    symbol: <IconWrapper><path d="M4 4v16" /><path d="M4 12c0-3 2-4 4-4s4 2 4 5v7" /><path d="M12 12c0-3 2-4 4-4s4 2 4 5v7l2 2 2-2" /></IconWrapper>
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    hindiName: 'धनु',
    dateRange: 'Nov 22 - Dec 21',
    element: 'Fire',
    description: 'The Archer',
    symbol: <IconWrapper><path d="M12 2l10 10" /><path d="M22 2l-10 10" /><path d="M22 2v5" /><path d="M22 2h-5" /><line x1="2" y1="22" x2="15" y2="9" /></IconWrapper>
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    hindiName: 'मकर',
    dateRange: 'Dec 22 - Jan 19',
    element: 'Earth',
    description: 'The Goat',
    symbol: <IconWrapper><path d="M4 15a4 4 0 1 1 5-3" /><path d="M9 12V9c0-3 2-4 4-4s4 1 4 4v3" /><path d="M17 12c2 0 3 2 3 4s-3 5-5 5c-2 0-3-2-3-4" /></IconWrapper>
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    hindiName: 'कुंभ',
    dateRange: 'Jan 20 - Feb 18',
    element: 'Air',
    description: 'The Water Bearer',
    symbol: <IconWrapper><path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></IconWrapper>
  },
  {
    id: 'pisces',
    name: 'Pisces',
    hindiName: 'मीन',
    dateRange: 'Feb 19 - Mar 20',
    element: 'Water',
    description: 'The Fish',
    symbol: <IconWrapper><path d="M10 4c0 8 4 10 4 16" /><path d="M14 4c0 8-4 10-4 16" /><line x1="2" y1="12" x2="22" y2="12" /></IconWrapper>
  },
];

export const PLANETS_INFO = [
  { name: 'Sun', hindi: 'सूर्य', description: 'Soul, Father, Power, Ego, Vitality, Leadership.', descriptionHi: 'आत्मा, पिता, शक्ति, अहंकार, जीवन शक्ति, नेतृत्व।', color: 'text-yellow-400' },
  { name: 'Moon', hindi: 'चंद्र', description: 'Mind, Mother, Emotions, Nourishment, Queen.', descriptionHi: 'मन, माता, भावनाएं, पोषण, रानी।', color: 'text-slate-200' },
  { name: 'Mars', hindi: 'मंगल', description: 'Energy, Courage, Brothers, War, Land, Technology.', descriptionHi: 'ऊर्जा, साहस, भाई, युद्ध, भूमि, तकनीक।', color: 'text-red-500' },
  { name: 'Mercury', hindi: 'बुध', description: 'Intellect, Speech, Communication, Commerce, Logic.', descriptionHi: 'बुद्धि, वाणी, संचार, व्यापार, तर्क।', color: 'text-emerald-400' },
  { name: 'Jupiter', hindi: 'गुरु', description: 'Wisdom, Guru, Wealth, Husband (in female chart), Luck.', descriptionHi: 'ज्ञान, गुरु, धन, पति (महिला कुंडली में), भाग्य।', color: 'text-yellow-200' },
  { name: 'Venus', hindi: 'शुक्र', description: 'Love, Beauty, Luxury, Wife (in male chart), Arts.', descriptionHi: 'प्रेम, सुंदरता, विलासिता, पत्नी (पुरुष कुंडली में), कला।', color: 'text-pink-300' },
  { name: 'Saturn', hindi: 'शनि', description: 'Discipline, Sorrow, Delay, Servants, Longevity, Karma.', descriptionHi: 'अनुशासन, दुख, देरी, सेवक, लंबी उम्र, कर्म।', color: 'text-blue-400' },
  { name: 'Rahu', hindi: 'राहु', description: 'Illusion, Obsession, Foreign Lands, Technology, Rebellion.', descriptionHi: 'भ्रम, जुनून, विदेश, तकनीक, विद्रोह।', color: 'text-slate-500' },
  { name: 'Ketu', hindi: 'केतु', description: 'Detachment, Spirituality, Moksha, Sudden Events.', descriptionHi: 'वैराग्य, आध्यात्मिकता, मोक्ष, आकस्मिक घटनाएं।', color: 'text-orange-900' },
];

export const HOUSES_INFO = [
  { id: 1, name: 'Tanur Bhava', nameHi: 'तनु भाव', desc: 'Self, Personality, Body, Appearance, Beginning.', descHi: 'स्वयं, व्यक्तित्व, शरीर, उपस्थिति, शुरुआत।' },
  { id: 2, name: 'Dhan Bhava', nameHi: 'धन भाव', desc: 'Wealth, Family, Speech, Food, Right Eye.', descHi: 'धन, परिवार, वाणी, भोजन, दाहिनी आंख।' },
  { id: 3, name: 'Sahaj Bhava', nameHi: 'सहज भाव', desc: 'Siblings, Courage, Communication, Short Travels.', descHi: 'भाई-बहन, साहस, संचार, छोटी यात्राएं।' },
  { id: 4, name: 'Sukh Bhava', nameHi: 'सुख भाव', desc: 'Mother, Home, Happiness, Vehicles, Land.', descHi: 'माता, घर, सुख, वाहन, भूमि।' },
  { id: 5, name: 'Putra Bhava', nameHi: 'पुत्र भाव', desc: 'Children, Intelligence, Romance, Speculation, Past Life Karma.', descHi: 'संतान, बुद्धि, रोमांस, सट्टा, पिछले जन्म के कर्म।' },
  { id: 6, name: 'Ari Bhava', nameHi: 'अरि भाव', desc: 'Enemies, Debts, Diseases, Service, Litigation.', descHi: 'शत्रु, ऋण, रोग, सेवा, मुकदमेबाजी।' },
  { id: 7, name: 'Yuvati Bhava', nameHi: 'युवती भाव', desc: 'Spouse, Marriage, Partnerships, Business, Public Image.', descHi: 'जीवनसाथी, विवाह, साझेदारी, व्यवसाय, सार्वजनिक छवि।' },
  { id: 8, name: 'Randhra Bhava', nameHi: 'रन्ध्र भाव', desc: 'Longevity, Occult, Sudden Gains/Losses, Transformation.', descHi: 'आयु, गुप्त ज्ञान, आकस्मिक लाभ/हानि, परिवर्तन।' },
  { id: 9, name: 'Dharma Bhava', nameHi: 'धर्म भाव', desc: 'Luck, Father, Guru, Religion, Long Journeys.', descHi: 'भाग्य, पिता, गुरु, धर्म, लंबी यात्राएं।' },
  { id: 10, name: 'Karma Bhava', nameHi: 'कर्म भाव', desc: 'Career, Status, Fame, Father (South India), Actions.', descHi: 'करियर, प्रतिष्ठा, प्रसिद्धि, पिता (दक्षिण भारत), कर्म।' },
  { id: 11, name: 'Labh Bhava', nameHi: 'लाभ भाव', desc: 'Gains, Friends, Elder Siblings, Desires.', descHi: 'लाभ, मित्र, बड़े भाई-बहन, इच्छाएं।' },
  { id: 12, name: 'Vyaya Bhava', nameHi: 'व्यय भाव', desc: 'Losses, Expenses, Foreign Lands, Moksha, Sleep.', descHi: 'हानि, खर्च, विदेश, मोक्ष, नींद।' },
];

// Helper functions for translation
export const translatePlanet = (planetName: string, lang: Language): string => {
  if (lang === 'en') return planetName;
  const p = PLANETS_INFO.find(p => p.name.toLowerCase() === planetName.toLowerCase());
  return p ? p.hindi : planetName;
};

export const translateSign = (signName: string, lang: Language): string => {
  if (lang === 'en') return signName;
  const s = ZODIAC_SIGNS.find(z => z.name.toLowerCase() === signName.toLowerCase());
  return s ? s.hindiName : signName;
};
