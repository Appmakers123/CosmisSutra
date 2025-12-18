
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
    description: 'Brave, leader, active.',
    symbol: <IconWrapper><path d="M12 21a9 9 0 0 0 9-9h-9v9" /><path d="M12 21a9 9 0 0 1-9-9h9v9" /><path d="M12 3a9 9 0 1 0 0 18 9 9 0 1 0 0-18z" opacity="0" /><path d="M12 3v9" /><path d="M6.5 6.5C8 5 10 4 12 4s4 1 5.5 2.5" /></IconWrapper>
  },
  {
    id: 'taurus',
    name: 'Taurus',
    hindiName: 'वृषभ',
    dateRange: 'Apr 20 - May 20',
    element: 'Earth',
    description: 'Patient, loyal, hardworking.',
    symbol: <IconWrapper><path d="M7 12a5 5 0 1 0 10 0A5 5 0 1 0 7 12z" /><path d="M6 6c0 4 2 6 6 6s6-2 6-6" /><path d="M12 12v9" /></IconWrapper>
  },
  {
    id: 'gemini',
    name: 'Gemini',
    hindiName: 'मिथुन',
    dateRange: 'May 21 - Jun 20',
    element: 'Air',
    description: 'Curious, friendly, smart.',
    symbol: <IconWrapper><path d="M6 3v18" /><path d="M18 3v18" /><path d="M6 7h12" /><path d="M6 17h12" /><path d="M4.5 3h15" /><path d="M4.5 21h15" /></IconWrapper>
  },
  {
    id: 'cancer',
    name: 'Cancer',
    hindiName: 'कर्क',
    dateRange: 'Jun 21 - Jul 22',
    element: 'Water',
    description: 'Caring, emotional, family-oriented.',
    symbol: <IconWrapper><path d="M6 12a3 3 0 1 0 3-3" /><path d="M18 12a3 3 0 1 1-3 3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="12" r="3" /><path d="M9 12h6" opacity="0.5" /></IconWrapper>
  },
  {
    id: 'leo',
    name: 'Leo',
    hindiName: 'सिंह',
    dateRange: 'Jul 23 - Aug 22',
    element: 'Fire',
    description: 'Confident, kind, kingly.',
    symbol: <IconWrapper><path d="M16 3.5a2.5 2.5 0 1 0-4.5 2 2.5 2.5 0 1 1-4.5 2A2.5 2.5 0 0 0 4.5 10v1a8 8 0 1 0 16 0" /><circle cx="12" cy="12" r="1" fill="currentColor" opacity="0.2" /></IconWrapper>
  },
  {
    id: 'virgo',
    name: 'Virgo',
    hindiName: 'कन्या',
    dateRange: 'Aug 23 - Sep 22',
    element: 'Earth',
    description: 'Helpful, organized, realistic.',
    symbol: <IconWrapper><path d="M4 4v16" /><path d="M4 12c0-3 2-4 4-4s4 2 4 5v7" /><path d="M12 12c0-3 2-4 4-4s4 2 4 5v7c0 2 2 3 3 1" /></IconWrapper>
  },
  {
    id: 'libra',
    name: 'Libra',
    hindiName: 'तुला',
    dateRange: 'Sep 23 - Oct 22',
    element: 'Air',
    description: 'Fair, charming, loves beauty.',
    symbol: <IconWrapper><path d="M12 21v-8" /><path d="M5 13h14" /><path d="M5 13a4 4 0 0 1 6.5-2.5" /><path d="M12 10.5A4 4 0 0 1 19 13" /><line x1="4" y1="21" x2="20" y2="21" /></IconWrapper>
  },
  {
    id: 'scorpio',
    name: 'Scorpio',
    hindiName: 'वृश्चिक',
    dateRange: 'Oct 23 - Nov 21',
    element: 'Water',
    description: 'Strong, mysterious, honest.',
    symbol: <IconWrapper><path d="M4 4v16" /><path d="M4 12c0-3 2-4 4-4s4 2 4 5v7" /><path d="M12 12c0-3 2-4 4-4s4 2 4 5v7l2 2 2-2" /></IconWrapper>
  },
  {
    id: 'sagittarius',
    name: 'Sagittarius',
    hindiName: 'धनु',
    dateRange: 'Nov 22 - Dec 21',
    element: 'Fire',
    description: 'Cheerful, explorer, lucky.',
    symbol: <IconWrapper><path d="M12 2l10 10" /><path d="M22 2l-10 10" /><path d="M22 2v5" /><path d="M22 2h-5" /><line x1="2" y1="22" x2="15" y2="9" /></IconWrapper>
  },
  {
    id: 'capricorn',
    name: 'Capricorn',
    hindiName: 'मकर',
    dateRange: 'Dec 22 - Jan 19',
    element: 'Earth',
    description: 'Ambitious, wise, stable.',
    symbol: <IconWrapper><path d="M4 15a4 4 0 1 1 5-3" /><path d="M9 12V9c0-3 2-4 4-4s4 1 4 4v3" /><path d="M17 12c2 0 3 2 3 4s-3 5-5 5c-2 0-3-2-3-4" /></IconWrapper>
  },
  {
    id: 'aquarius',
    name: 'Aquarius',
    hindiName: 'कुंभ',
    dateRange: 'Jan 20 - Feb 18',
    element: 'Air',
    description: 'Unique, creative, helpful.',
    symbol: <IconWrapper><path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /><path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0" /></IconWrapper>
  },
  {
    id: 'pisces',
    name: 'Pisces',
    hindiName: 'मीन',
    dateRange: 'Feb 19 - Mar 20',
    element: 'Water',
    description: 'Dreamy, artistic, kind.',
    symbol: <IconWrapper><path d="M10 4c0 8 4 10 4 16" /><path d="M14 4c0 8-4 10-4 16" /><line x1="2" y1="12" x2="22" y2="12" /></IconWrapper>
  },
];

export const PLANETS_INFO = [
  { name: 'Sun', hindi: 'सूर्य', description: 'Represents the Atman (Soul), authority, fatherhood, and kingly status. It is the source of all life and confidence.', descriptionHi: 'आत्मा, अधिकार, पिता और राजा का प्रतिनिधित्व करता है। यह जीवन और आत्मविश्वास का स्रोत है।', color: 'text-yellow-400' },
  { name: 'Moon', hindi: 'चंद्र', description: 'Controls the Manas (Mind), emotions, motherhood, and mental peace. It governs the tides and our intuition.', descriptionHi: 'मानस (मन), भावनाओं, मातृत्व और मानसिक शांति को नियंत्रित करता है। यह हमारे अंतर्ज्ञान को नियंत्रित करता है।', color: 'text-slate-200' },
  { name: 'Mars', hindi: 'मंगल', description: 'The Commander. Rules energy, brothers, courage, land, and technical ability. A strong Mars makes one a warrior.', descriptionHi: 'कमांडर। ऊर्जा, भाइयों, साहस, भूमि और तकनीकी क्षमता पर शासन करता है। मजबूत मंगल व्यक्ति को योद्धा बनाता है।', color: 'text-red-500' },
  { name: 'Mercury', hindi: 'बुध', description: 'The Prince. Rules speech, logic, business, and youthful energy. It is the messenger planet of communication.', descriptionHi: 'राजकुमार। वाणी, तर्क, व्यापार और युवा ऊर्जा पर शासन करता है। यह संचार का संदेशवाहक ग्रह है।', color: 'text-emerald-400' },
  { name: 'Jupiter', hindi: 'गुरु', description: 'The Guru. Represents wisdom, children, expansion, spiritual growth, and prosperity. The great benefic.', descriptionHi: 'गुरु। ज्ञान, संतान, विस्तार, आध्यात्मिक विकास और समृद्धि का प्रतिनिधित्व करता है। महान शुभ ग्रह।', color: 'text-yellow-200' },
  { name: 'Venus', hindi: 'शुक्र', description: 'Represents luxury, marriage, love, fine arts, and beauty. It is the master of material success and relationships.', descriptionHi: 'विलासिता, विवाह, प्रेम, ललित कला और सुंदरता का प्रतिनिधित्व करता है। यह भौतिक सफलता और संबंधों का स्वामी है।', color: 'text-pink-300' },
  { name: 'Saturn', hindi: 'शनि', description: 'The Taskmaster. Rules karma, delay, discipline, hard work, and old age. It brings justice through persistence.', descriptionHi: 'कर्म, अनुशासन, कड़ी मेहनत और बुढ़ापे पर शासन करता है। यह दृढ़ता के माध्यम से न्याय लाता है।', color: 'text-blue-400' },
  { name: 'Rahu', hindi: 'राहु', description: 'The Dragon\'s Head. Represents obsession, worldly desires, sudden gains, and foreign lands. Master of illusion.', descriptionHi: 'जुनून, सांसारिक इच्छाओं, अचानक लाभ और विदेशी भूमि का प्रतिनिधित्व करता है। भ्रम का स्वामी।', color: 'text-slate-500' },
  { name: 'Ketu', hindi: 'केतु', description: 'The Dragon\'s Tail. Represents moksha (liberation), detachment, spirituality, and past life karmas.', descriptionHi: 'मोक्ष (मुक्ति), वैराग्य, आध्यात्मिकता और पिछले जीवन के कर्मों का प्रतिनिधित्व करता है।', color: 'text-orange-900' },
];

export const HOUSES_INFO = [
  { id: 1, name: 'Tanubbhava (Self)', nameHi: 'तनु भाव', desc: 'Appearance, physical health, character, and early childhood.', descHi: 'दिखावट, शारीरिक स्वास्थ्य, चरित्र और प्रारंभिक बचपन।' },
  { id: 2, name: 'Dhanabhava (Wealth)', nameHi: 'धन भाव', desc: 'Family lineage, accumulated wealth, speech, and food habits.', descHi: 'पारिवारिक वंश, संचित धन, वाणी और भोजन की आदतें।' },
  { id: 3, name: 'Sahajabhava (Sibilings)', nameHi: 'सहज भाव', desc: 'Courage, younger siblings, communication, and short travels.', descHi: 'साहस, छोटे भाई-बहन, संचार और छोटी यात्राएं।' },
  { id: 4, name: 'Matrubhava (Mother)', nameHi: 'मातृ भाव', desc: 'Mother, domestic peace, vehicles, land, and happiness.', descHi: 'माता, घरेलू शांति, वाहन, भूमि और सुख।' },
  { id: 5, name: 'Putrabhava (Children)', nameHi: 'पुत्र भाव', desc: 'Creativity, children, past life merit, and intelligence.', descHi: 'रचनात्मकता, संतान, पूर्व जन्म के पुण्य और बुद्धि।' },
  { id: 6, name: 'Ari-bhava (Enemies)', nameHi: 'अरि भाव', desc: 'Debts, diseases, enemies, litigation, and daily service.', descHi: 'ऋण, रोग, शत्रु, मुकदमेबाजी और दैनिक सेवा।' },
  { id: 7, name: 'Yuvatibhava (Partner)', nameHi: 'युवती भाव', desc: 'Marriage, business partners, and all legal relationships.', descHi: 'विवाह, व्यावसायिक साझेदार और सभी कानूनी संबंध।', color: 'text-pink-400' },
  { id: 8, name: 'Randhrabhava (Occult)', nameHi: 'रंध्र भाव', desc: 'Longevity, sudden transformations, hidden secrets, and insurance.', descHi: 'दीर्घायु, अचानक परिवर्तन, छिपे हुए रहस्य और बीमा।' },
  { id: 9, name: 'Bhagyabhava (Luck)', nameHi: 'भाग्य भाव', desc: 'Fortune, father-figure, dharma, gurus, and long distance travel.', descHi: 'भाग्य, पिता-समान, धर्म, गुरु और लंबी दूरी की यात्रा।' },
  { id: 10, name: 'Karmabhava (Career)', nameHi: 'कर्म भाव', desc: 'Public life, status, professional career, and father\'s legacy.', descHi: 'सार्वजनिक जीवन, स्थिति, पेशेवर करियर और पिता की विरासत।' },
  { id: 11, name: 'Labhabhava (Gains)', nameHi: 'लाभ भाव', desc: 'Wishes, elder siblings, income, and large social circles.', descHi: 'इच्छाएं, बड़े भाई-बहन, आय और बड़े सामाजिक दायरे।' },
  { id: 12, name: 'Vyayabhava (Losses)', nameHi: 'व्यय भाव', desc: 'Expenditure, isolation, spirituality, sleep, and foreign lands.', descHi: 'व्यय, अलगाव, आध्यात्मिकता, नींद और विदेशी भूमि।' },
];

export const NAKSHATRAS_INFO = [
  { name: 'Ashwini', ruler: 'Ketu', trait: 'Swiftness, Healing' },
  { name: 'Bharani', ruler: 'Venus', trait: 'Intensity, Creation' },
  { name: 'Krittika', ruler: 'Sun', trait: 'Transformation, Sharpness' },
  { name: 'Rohini', ruler: 'Moon', trait: 'Growth, Beauty' },
  { name: 'Mrigashira', ruler: 'Mars', trait: 'Searching, Curiosity' },
  { name: 'Ardra', ruler: 'Rahu', trait: 'Intensity, Renewal' },
  { name: 'Punarvasu', ruler: 'Jupiter', trait: 'Light, Return' },
  { name: 'Pushya', ruler: 'Saturn', trait: 'Nourishment, Care' },
  { name: 'Ashlesha', ruler: 'Mercury', trait: 'Clarity, Enticement' },
  { name: 'Magha', ruler: 'Ketu', trait: 'Royal, Ancestral' },
  { name: 'Purva Phalguni', ruler: 'Venus', trait: 'Leisure, Creation' },
  { name: 'Uttara Phalguni', ruler: 'Sun', trait: 'Service, Stability' },
  { name: 'Hasta', ruler: 'Moon', trait: 'Skill, Craftsmanship' },
  { name: 'Chitra', ruler: 'Mars', trait: 'Architecture, Brilliance' },
  { name: 'Swati', ruler: 'Rahu', trait: 'Movement, Independence' },
  { name: 'Vishakha', ruler: 'Jupiter', trait: 'Ambition, Goals' },
  { name: 'Anuradha', ruler: 'Saturn', trait: 'Friendship, Devotion' },
  { name: 'Jyeshtha', ruler: 'Mercury', trait: 'Seniority, Courage' },
  { name: 'Mula', ruler: 'Ketu', trait: 'Foundation, Deep Roots' },
  { name: 'Purva Ashadha', ruler: 'Venus', trait: 'Victory, Flow' },
  { name: 'Uttara Ashadha', ruler: 'Sun', trait: 'Endurance, Triumph' },
  { name: 'Shravana', ruler: 'Moon', trait: 'Listening, Wisdom' },
  { name: 'Dhanishta', ruler: 'Mars', trait: 'Rhythm, Wealth' },
  { name: 'Shatabhisha', ruler: 'Rahu', trait: 'Healing, Secrets' },
  { name: 'Purva Bhadrapada', ruler: 'Jupiter', trait: 'Fire, Transformation' },
  { name: 'Uttara Bhadrapada', ruler: 'Saturn', trait: 'Depths, Wisdom' },
  { name: 'Revati', ruler: 'Mercury', trait: 'Journey, Completion' },
];

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
