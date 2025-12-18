
import React, { useState, useCallback, useEffect } from 'react';
import StarBackground from './components/StarBackground';
import ZodiacGrid from './components/ZodiacGrid';
import HoroscopeCard from './components/HoroscopeCard';
import KundaliForm from './components/KundaliForm';
import KundaliResult from './components/KundaliResult';
import DailyPanchang from './components/DailyPanchang';
import Numerology from './components/Numerology'; 
import LearningCenter from './components/LearningCenter'; 
import MatchMaking from './components/MatchMaking'; 
import CompatibilityTab from './components/CompatibilityTab'; 
import TarotReading from './components/TarotReading'; 
import CosmicArt from './components/CosmicArt';
import StoryHub from './components/StoryHub';
import AstroGames from './components/AstroGames';
import ChatWidget from './components/ChatWidget'; 
import PalmReading from './components/PalmReading';
import MysticLens from './components/MysticLens';
import VastuLab from './components/VastuLab';
import GemstoneLab from './components/GemstoneLab';
import DreamInterpreter from './components/DreamInterpreter';
import MuhuratPlanner from './components/MuhuratPlanner';
import PersonalTransits from './components/PersonalTransits';
import MantraLab from './components/MantraLab';
import RudrakshLab from './components/RudrakshLab';
import OccultVault from './components/OccultVault';
import NotificationToggle from './components/NotificationToggle';
import Logo from './components/Logo';
import { ZodiacSignData, HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, ViewMode } from './types';
import { generateHoroscope, generateKundali, generateDailyPanchang } from './services/geminiService';
import { useTranslation } from './utils/translations';

type AppViewMode = ViewMode | 'hub' | 'vastu' | 'gemstones' | 'dreams' | 'muhurat' | 'transits' | 'mantra' | 'rudraksh' | 'occult-vault';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppViewMode>('hub');
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);
  const [selectedSign, setSelectedSign] = useState<ZodiacSignData | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeResponse | null>(null);
  const [kundaliData, setKundaliData] = useState<KundaliResponse | null>(null);
  const [panchangData, setPanchangData] = useState<DailyPanchangResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getCachedHoroscope = (signName: string, lang: Language): HoroscopeResponse | null => {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${signName}_${lang}_${today}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch (e) { return null; }
    }
    return null;
  };

  const setCachedHoroscope = (signName: string, lang: Language, data: HoroscopeResponse) => {
    const today = new Date().toDateString();
    const cacheKey = `horoscope_${signName}_${lang}_${today}`;
    localStorage.setItem(cacheKey, JSON.stringify(data));
  };

  const handleSelectSign = useCallback(async (sign: ZodiacSignData) => {
    setSelectedSign(sign);
    setMode('daily');
    const cached = getCachedHoroscope(sign.name, language);
    if (cached) {
      setHoroscopeData(cached);
      return;
    }
    setLoading(true);
    try {
      const data = await generateHoroscope(sign.name, language);
      setHoroscopeData(data);
      setCachedHoroscope(sign.name, language, data);
    } catch (err) { setError(t.errorGeneric); }
    finally { setLoading(false); }
  }, [language, t]);

  const handleGenerateKundali = useCallback(async (formData: KundaliFormData) => {
    setLoading(true);
    try {
      const data = await generateKundali(formData, language);
      setKundaliData(data);
      setMode('kundali');
    } catch (err) { setError(t.errorGeneric); }
    finally { setLoading(false); }
  }, [language, t]);

  const fetchPanchang = useCallback(async () => {
      setLoading(true);
      try {
          const data = await generateDailyPanchang("New Delhi, India", language);
          setPanchangData(data);
      } catch (err) { setError(t.errorGeneric); }
      finally { setLoading(false); }
  }, [language, t]);

  const switchMode = (newMode: AppViewMode) => {
    if (newMode === 'panchang') fetchPanchang();
    setMode(newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError(null);
  };

  const resetDaily = () => {
    setSelectedSign(null);
    setHoroscopeData(null);
    setMode('hub');
  };

  const FeatureCard = ({ target, label, icon, desc, category, color }: any) => (
    <button onClick={() => switchMode(target)} className="group relative flex flex-col items-start p-6 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 rounded-2xl hover:bg-slate-700/60 hover:border-amber-500/50 transition-all text-left overflow-hidden shadow-xl">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${color} opacity-5 group-hover:opacity-10 transition-opacity rounded-bl-full`}></div>
      <div className="absolute top-2 right-4 text-[8px] uppercase tracking-tighter text-slate-500 font-bold group-hover:text-amber-500 transition-colors">{category}</div>
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-serif font-bold text-white mb-1 group-hover:text-amber-300">{label}</h3>
      <p className="text-[10px] text-slate-400 leading-tight uppercase tracking-widest">{desc}</p>
    </button>
  );

  return (
    <div className="min-h-screen w-full relative text-slate-200 selection:bg-amber-500/30">
      <StarBackground />
      <ChatWidget language={language} context={kundaliData} onUseKarma={() => true} hasKarma={true} onOpenStore={() => {}} />

      <header className="fixed top-0 left-0 w-full z-[60] px-6 py-4 flex justify-between items-center bg-slate-900/60 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setMode('hub'); setKundaliData(null); setSelectedSign(null);}}>
           <Logo className="w-10 h-10" /><span className="text-xl font-serif font-bold text-amber-100 hidden md:block tracking-widest uppercase">CosmicSutra</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationToggle language={language} />
          <button onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')} className="text-[10px] font-bold bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 hover:border-amber-500/50 transition-all uppercase tracking-widest">{language === 'en' ? 'हिन्दी' : 'English'}</button>
          <div className="hidden sm:block px-3 py-1.5 bg-amber-900/20 border border-amber-500/30 rounded-full text-[9px] uppercase font-bold text-amber-400">Premium Wisdom</div>
        </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-28 pb-32">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Logo className="w-24 h-24 animate-spin-slow" />
            <p className="text-amber-200 font-serif uppercase tracking-[0.3em] mt-6 animate-pulse">{t.loadingButton}</p>
          </div>
        )}
        
        {mode === 'hub' && !loading && !error && (
          <div className="animate-fade-in-up space-y-16">
            <div className="text-center space-y-4">
              <h2 className="text-5xl md:text-7xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-white to-amber-200">CosmicSutra</h2>
              <p className="text-slate-400 italic tracking-[0.5em] uppercase text-xs">{t.subtitle}</p>
            </div>
            
            <div className="space-y-12">
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-xs font-serif font-bold text-amber-500 uppercase tracking-widest">I. {language === 'en' ? 'Celestial Tools' : 'ब्रह्मांडीय उपकरण'}</span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard target="muhurat" label={t.muhuratPlanner} icon="⏱️" desc="Find your Power Hours" category="Utility" color="from-green-500 to-transparent" />
                        <FeatureCard target="transits" label={t.personalTransits} icon="🛰️" desc="Planets in your chart" category="Analysis" color="from-blue-500 to-transparent" />
                        <FeatureCard target="daily" label={t.dailyHoroscope} icon="🌞" desc="Your energy vibe" category="Daily" color="from-orange-500 to-transparent" />
                        <FeatureCard target="panchang" label={t.dailyPanchang} icon="⭐" desc="Vedic Almanac" category="Daily" color="from-yellow-500 to-transparent" />
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-xs font-serif font-bold text-purple-500 uppercase tracking-widest">II. {language === 'en' ? 'Sacred Labs' : 'पवित्र प्रयोगशाला'}</span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard target="rudraksh" label={t.rudrakshLab} icon="📿" desc="Sacred bead power" category="Utility" color="from-orange-600 to-transparent" />
                        <FeatureCard target="mantra" label={t.mantraLab} icon="🕉️" desc="Healing vibrations" category="Tool" color="from-purple-500 to-transparent" />
                        <FeatureCard target="learning" label={t.learning} icon="📜" desc="Learn Occult Science" category="Academy" color="from-indigo-500 to-transparent" />
                        <FeatureCard target="kundali" label={t.vedicKundali} icon="🧭" desc="Your birth map" category="Map" color="from-amber-500 to-transparent" />
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-xs font-serif font-bold text-emerald-500 uppercase tracking-widest">III. {language === 'en' ? 'Wisdom & Mystic Arts' : 'ज्ञान और रहस्य'}</span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard target="occult-vault" label={t.occultVault} icon="🗝️" desc="Universal Knowledge" category="Encyclopedia" color="from-yellow-600 to-transparent" />
                        <FeatureCard target="vastu" label={t.vastuLab} icon="🏠" desc="Vastu energy guide" category="Space" color="from-emerald-500 to-transparent" />
                        <FeatureCard target="gemstones" label={t.gemstoneLab} icon="💎" desc="Your lucky gems" category="Power" color="from-cyan-500 to-transparent" />
                        <FeatureCard target="palm-reading" label={t.palmReading} icon="✋" desc="Hand lines analysis" category="Lines" color="from-rose-500 to-transparent" />
                    </div>
                </section>
            </div>
          </div>
        )}

        {mode === 'daily' && (!selectedSign ? <ZodiacGrid onSelect={handleSelectSign} language={language} /> : horoscopeData && <HoroscopeCard data={horoscopeData} sign={selectedSign} language={language} onBack={resetDaily} />)}
        {mode === 'kundali' && (kundaliData ? <KundaliResult data={kundaliData} name="Seeker" language={language} onBack={() => setMode('hub')} /> : <KundaliForm onSubmit={handleGenerateKundali} isLoading={loading} language={language} />)}
        {mode === 'panchang' && panchangData && <DailyPanchang data={panchangData} language={language} />}
        {mode === 'muhurat' && <MuhuratPlanner language={language} />}
        {mode === 'transits' && <PersonalTransits language={language} kundali={kundaliData} onOpenKundali={() => setMode('kundali')} />}
        {mode === 'mantra' && <MantraLab language={language} />}
        {mode === 'rudraksh' && <RudrakshLab language={language} />}
        {mode === 'occult-vault' && <OccultVault language={language} />}
        {mode === 'dreams' && <DreamInterpreter language={language} />}
        {mode === 'vastu' && <VastuLab language={language} />}
        {mode === 'gemstones' && <GemstoneLab language={language} />}
        {mode === 'palm-reading' && <PalmReading language={language} />}
        {mode === 'mystic-lens' && <MysticLens language={language} />}
        {mode === 'tarot' && <TarotReading language={language} />}
        {mode === 'numerology' && <Numerology language={language} />}
        {mode === 'learning' && <LearningCenter language={language} />}
        {mode === 'compatibility' && <CompatibilityTab language={language} />}
        {mode === 'story-hub' && <StoryHub language={language} />}
        
        {mode !== 'hub' && !loading && (
          <button onClick={() => setMode('hub')} className="mt-12 mx-auto flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-amber-400 uppercase tracking-[0.4em] bg-slate-900/50 px-10 py-3 rounded-full border border-slate-800 transition-all shadow-lg">
            {t.return}
          </button>
        )}
      </main>

      <footer className="relative z-10 bg-slate-900/80 border-t border-white/5 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-2 mb-4">
                    <Logo className="w-8 h-8" />
                    <span className="text-xl font-serif font-bold text-amber-100 tracking-widest uppercase">CosmicSutra</span>
                </div>
                <p className="text-slate-400 text-sm max-w-sm italic mb-4">{t.footer}</p>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">© 2025 CosmicSutra Academy Team</p>
            </div>

            <div className="flex flex-col items-center md:items-end gap-6">
                <p className="text-xs font-serif font-bold text-amber-500 uppercase tracking-[0.3em]">{t.followCreator}</p>
                <div className="flex gap-6">
                    <a href="https://www.linkedin.com/in/nikeshmaurya/" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center group-hover:border-blue-500 transition-all shadow-xl group-hover:shadow-blue-500/10">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                            </svg>
                        </div>
                        <span className="text-[8px] uppercase font-bold text-slate-500 group-hover:text-blue-400 tracking-widest">LinkedIn</span>
                    </a>
                    <a href="https://www.youtube.com/@NikeshMaurya" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center group-hover:border-red-500 transition-all shadow-xl group-hover:shadow-red-500/10">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-red-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 4-8 4z" />
                            </svg>
                        </div>
                        <span className="text-[8px] uppercase font-bold text-slate-500 group-hover:text-red-400 tracking-widest">YouTube</span>
                    </a>
                    <a href="https://www.instagram.com/palm_reading/?hl=en" target="_blank" rel="noopener noreferrer" className="group flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-slate-800 border border-slate-700 rounded-2xl flex items-center justify-center group-hover:border-pink-500 transition-all shadow-xl group-hover:shadow-pink-500/10">
                            <svg className="w-6 h-6 text-slate-400 group-hover:text-pink-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                        </div>
                        <span className="text-[8px] uppercase font-bold text-slate-500 group-hover:text-pink-400 tracking-widest">{t.instagram}</span>
                    </a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
