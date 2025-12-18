
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
import AuthModal from './components/AuthModal';
import Logo from './components/Logo';
import { ZodiacSignData, HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, ViewMode, User } from './types';
import { generateHoroscope, generateKundali, generateDailyPanchang } from './services/geminiService';
import { useTranslation } from './utils/translations';

type AppViewMode = ViewMode | 'hub' | 'vastu' | 'gemstones' | 'dreams' | 'muhurat' | 'transits' | 'mantra' | 'rudraksh' | 'occult-vault';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppViewMode>('hub');
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);

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
          setMode('panchang');
      } catch (err) { setError(t.errorGeneric); }
      finally { setLoading(false); }
  }, [language, t]);

  const switchMode = (newMode: AppViewMode) => {
    if (newMode === 'panchang') fetchPanchang();
    else setMode(newMode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setError(null);
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
      {showAuth && (
        <AuthModal 
          language={language} 
          onLogin={setUser} 
          onClose={() => setShowAuth(false)} 
        />
      )}
      <ChatWidget language={language} context={kundaliData} onUseKarma={() => true} hasKarma={true} onOpenStore={() => {}} />

      <header className="fixed top-0 left-0 w-full z-[60] px-6 py-4 flex justify-between items-center bg-slate-900/60 border-b border-white/5 backdrop-blur-md">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {setMode('hub'); setKundaliData(null); setSelectedSign(null);}}>
           <Logo className="w-10 h-10" /><span className="text-xl font-serif font-bold text-amber-100 hidden md:block tracking-widest uppercase">CosmicSutra</span>
        </div>
        <div className="flex items-center gap-3">
          <a 
            href="https://appmakers123.github.io/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-slate-800/80 border border-slate-700 rounded-full hover:border-amber-500/50 transition-all text-[10px] font-bold uppercase tracking-widest text-amber-200"
          >
            Explore More Apps
          </a>
          <NotificationToggle language={language} />
          <button onClick={() => setLanguage(l => l === 'en' ? 'hi' : 'en')} className="text-[10px] font-bold bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700 hover:border-amber-500/50 transition-all uppercase tracking-widest">{language === 'en' ? 'हिन्दी' : 'English'}</button>
          {!user ? (
            <button onClick={() => setShowAuth(true)} className="px-5 py-2 bg-amber-600 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-amber-500 transition-colors shadow-lg">Login</button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 border border-amber-500/30 rounded-full">
              <div className="w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center text-[10px] font-bold text-slate-900">{user.name[0]}</div>
              <span className="text-[9px] uppercase font-bold text-amber-400">{user.karma} Karma</span>
            </div>
          )}
        </div>
      </header>

      <main className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-28 pb-32">
        {loading && (
          <div className="flex flex-col items-center justify-center py-32">
            <Logo className="w-24 h-24 animate-spin-slow" />
            <p className="text-amber-200 font-serif uppercase tracking-[0.3em] mt-6 animate-pulse">{t.loadingButton}</p>
          </div>
        )}
        
        {error && !loading && (
            <div className="max-w-md mx-auto mb-10 bg-red-900/20 border border-red-500/30 rounded-2xl p-6 text-center animate-fade-in">
                <p className="text-red-300 text-sm mb-4">{error}</p>
                <button onClick={() => setError(null)} className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white underline">Dismiss</button>
            </div>
        )}

        {mode === 'hub' && !loading && (
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
                
                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-xs font-serif font-bold text-pink-500 uppercase tracking-widest">IV. {language === 'en' ? 'Mystical Portals' : 'रहस्यमयी पोर्टल'}</span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard target="tarot" label={t.tarot} icon="🃏" desc="Whispers of fate" category="Divination" color="from-purple-700 to-transparent" />
                        <FeatureCard target="numerology" label={t.numerology} icon="🔢" desc="Number vibrations" category="Analysis" color="from-teal-500 to-transparent" />
                        <FeatureCard target="compatibility" label={t.compatibility} icon="❤️" desc="Harmony check" category="Social" color="from-pink-500 to-transparent" />
                        <FeatureCard target="story-hub" label={t.storyHub} icon="📖" desc="Star legends" category="Educational" color="from-yellow-500 to-transparent" />
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-4 mb-8">
                        <span className="text-xs font-serif font-bold text-indigo-500 uppercase tracking-widest">V. {language === 'en' ? 'Arcane Fun' : 'दिव्य मनोरंजन'}</span>
                        <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <FeatureCard target="games" label={t.games} icon="🎲" desc="Astro Trivia & Riddles" category="Gaming" color="from-indigo-700 to-transparent" />
                        <FeatureCard target="cosmic-art" label={t.cosmicArt} icon="🖼️" desc="Your Aura Vision" category="Creative" color="from-pink-700 to-transparent" />
                    </div>
                </section>
            </div>
          </div>
        )}

        {mode === 'daily' && (!selectedSign ? <ZodiacGrid onSelect={handleSelectSign} language={language} /> : horoscopeData && <HoroscopeCard data={horoscopeData} sign={selectedSign} language={language} onBack={() => {setSelectedSign(null); setMode('hub');}} />)}
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
        {mode === 'cosmic-art' && <CosmicArt language={language} user={user} onUseKarma={() => true} onOpenStore={() => {}} />}
        {mode === 'games' && <AstroGames language={language} />}
        
        {mode !== 'hub' && !loading && (
          <button onClick={() => {setMode('hub'); setError(null);}} className="mt-12 mx-auto flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-amber-400 uppercase tracking-[0.4em] bg-slate-900/50 px-10 py-3 rounded-full border border-slate-800 transition-all shadow-lg">
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
                <div className="flex flex-wrap gap-4 mb-4 justify-center md:justify-start">
                    <a href="https://appmakers123.github.io/" target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 font-bold text-xs uppercase tracking-widest border-b border-amber-500/30 pb-1">Discover More Creators</a>
                </div>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest">© 2025 CosmicSutra Academy Team</p>
            </div>
            <div className="flex flex-col items-center md:items-end gap-6">
                <div className="flex gap-6">
                    <a href="https://www.linkedin.com/in/nikeshmaurya/" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-400 transition-colors">LinkedIn</a>
                    <a href="https://www.youtube.com/@NikeshMaurya" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-500 transition-colors">YouTube</a>
                    <a href="https://www.instagram.com/palm_reading/?hl=en" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-pink-400 transition-colors">Instagram</a>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 text-[10px] text-slate-500 font-mono">
                    Visit: <a href="https://appmakers123.github.io/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">appmakers123.github.io</a>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
