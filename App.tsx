import React, { useState, useCallback, useEffect } from 'react';
import StarBackground from './components/StarBackground';
import ZodiacGrid from './components/ZodiacGrid';
import HoroscopeCard from './components/HoroscopeCard';
import KundaliForm from './components/KundaliForm';
import KundaliResult from './components/KundaliResult';
import DailyPanchang from './components/DailyPanchang';
import PalmReading from './components/PalmReading';
import Numerology from './components/Numerology'; 
import LearningCenter from './components/LearningCenter'; 
import MatchMaking from './components/MatchMaking'; 
import TarotReading from './components/TarotReading'; 
import ChatWidget from './components/ChatWidget'; 
import AdBanner from './components/AdBanner'; 
import AuthModal from './components/AuthModal';
import NotificationToggle from './components/NotificationToggle';
import Logo from './components/Logo';
import { ZodiacSignData, HoroscopeResponse, KundaliFormData, KundaliResponse, Language, DailyPanchangResponse, User } from './types';
import { generateHoroscope, generateKundali, generateDailyPanchang, generatePersonalizedDailyHoroscope } from './services/geminiService';
import { useTranslation } from './utils/translations';

type ViewMode = 'daily' | 'kundali' | 'panchang' | 'palm' | 'numerology' | 'learning' | 'matchmaking' | 'tarot';

const App: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('daily');
  const [language, setLanguage] = useState<Language>('en');
  const t = useTranslation(language);
  
  // Auth State
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Saved Charts State
  const [savedCharts, setSavedCharts] = useState<KundaliFormData[]>([]);

  // Daily Horoscope State
  const [selectedSign, setSelectedSign] = useState<ZodiacSignData | null>(null);
  const [horoscopeData, setHoroscopeData] = useState<HoroscopeResponse | null>(null);
  
  // Kundali State
  const [kundaliData, setKundaliData] = useState<KundaliResponse | null>(null);
  const [kundaliName, setKundaliName] = useState<string>('');
  const [currentFormData, setCurrentFormData] = useState<KundaliFormData | null>(null);

  // Personalized Prediction State
  const [personalPrediction, setPersonalPrediction] = useState<HoroscopeResponse | null>(null);
  const [personalProfile, setPersonalProfile] = useState<KundaliFormData | null>(null);

  // Panchang State
  const [panchangData, setPanchangData] = useState<DailyPanchangResponse | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load saved charts on mount
  useEffect(() => {
    const saved = localStorage.getItem('savedCharts');
    if (saved) {
      try {
        setSavedCharts(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse saved charts", e);
      }
    }
  }, []);

  // Handlers for Auth
  const handleLogin = (userData: User) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    setMode('daily');
    setPersonalPrediction(null);
  };

  // Handler to Save Chart
  const handleSaveChart = useCallback(() => {
      if (!currentFormData) return;
      
      const newChart: KundaliFormData = {
          ...currentFormData,
          id: Date.now().toString()
      };
      
      const updated = [...savedCharts, newChart];
      setSavedCharts(updated);
      localStorage.setItem('savedCharts', JSON.stringify(updated));
      alert("Chart saved to profile!");
  }, [currentFormData, savedCharts]);

  const handleDeleteChart = (id: string) => {
      const updated = savedCharts.filter(c => c.id !== id);
      setSavedCharts(updated);
      localStorage.setItem('savedCharts', JSON.stringify(updated));
  }

  // Handlers for Daily Horoscope
  const handleSelectSign = useCallback(async (sign: ZodiacSignData) => {
    setSelectedSign(sign);
    setLoading(true);
    setError(null);
    setHoroscopeData(null);

    try {
      const data = await generateHoroscope(sign.name, language);
      setHoroscopeData(data);
    } catch (err) {
      setError(t.errorGeneric);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [language, t]);

  const handleDailyBack = useCallback(() => {
    setSelectedSign(null);
    setHoroscopeData(null);
    setError(null);
    setPersonalPrediction(null);
    setPersonalProfile(null);
  }, []);

  // Handlers for Kundali Generation
  const handleGenerateKundali = useCallback(async (formData: KundaliFormData) => {
    if (!user) {
       setShowAuthModal(true);
       return;
    }

    setLoading(true);
    setError(null);
    setKundaliData(null);
    setKundaliName(formData.name);
    setCurrentFormData(formData);

    try {
      const data = await generateKundali(formData, language);
      setKundaliData(data);
    } catch (err) {
      setError(t.errorKundali);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [language, t, user]);

  const handleKundaliBack = useCallback(() => {
    setKundaliData(null);
    setCurrentFormData(null);
    setError(null);
  }, []);

  // Handler for Personalized Daily Prediction
  const handleGetPersonalDaily = useCallback(async (chart: KundaliFormData) => {
      setLoading(true);
      setError(null);
      setPersonalProfile(chart);
      setPersonalPrediction(null);
      setMode('daily'); 

      try {
          const data = await generatePersonalizedDailyHoroscope(chart, language);
          setPersonalPrediction(data);
      } catch (err) {
          setError(t.errorGeneric);
          console.error(err);
      } finally {
          setLoading(false);
      }
  }, [language, t]);

  // Handlers for Panchang
  const fetchPanchang = useCallback(async () => {
      setLoading(true);
      setError(null);
      setPanchangData(null);
      try {
          const data = await generateDailyPanchang("New Delhi, India", language);
          setPanchangData(data);
      } catch (err) {
          setError(t.errorGeneric);
      } finally {
          setLoading(false);
      }
  }, [language, t]);

  const switchMode = (newMode: ViewMode) => {
    if (newMode === 'panchang') {
        fetchPanchang();
    }
    setMode(newMode);
    setError(null);
    if (newMode !== 'daily') {
        setPersonalPrediction(null);
        setPersonalProfile(null);
    }
  };

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'hi' : 'en';
    setLanguage(newLang);
  };

  // Effect to re-fetch data when language changes
  useEffect(() => {
    const refreshData = async () => {
        if (loading) return;

        if (mode === 'daily' && selectedSign) {
            handleSelectSign(selectedSign);
        } else if (mode === 'daily' && personalProfile) {
            handleGetPersonalDaily(personalProfile);
        } else if (mode === 'panchang') {
            fetchPanchang();
        } else if (mode === 'kundali' && currentFormData && kundaliData) {
            handleGenerateKundali(currentFormData);
        }
    };
    
    refreshData();
  }, [language]); 

  const NavButton = ({ targetMode, label, colorClass }: { targetMode: ViewMode, label: string, colorClass: string }) => (
    <button 
      onClick={() => switchMode(targetMode)}
      className={`relative px-4 py-2 rounded-full font-serif text-xs md:text-sm tracking-wider transition-all duration-300 border overflow-hidden group ${
        mode === targetMode 
          ? `${colorClass} text-white shadow-[0_0_15px_rgba(255,255,255,0.2)]` 
          : 'bg-slate-800/50 border-slate-600 text-slate-400 hover:bg-slate-700/50 hover:text-white'
      }`}
    >
      <span className="relative z-10">{label}</span>
      {mode === targetMode && <div className="absolute inset-0 bg-white/10 animate-pulse-slow"></div>}
    </button>
  );

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden text-slate-200 font-sans pb-20">
      <StarBackground />
      <ChatWidget language={language} context={kundaliData} />
      
      {showAuthModal && (
          <AuthModal 
            onLogin={handleLogin} 
            onClose={() => setShowAuthModal(false)} 
            language={language}
          />
      )}

      {/* Header */}
      <header className="relative z-10 pt-8 pb-6 text-center px-4 flex flex-col items-center">
        {/* Top Bar: Notification, Login & Language */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 flex flex-col md:flex-row items-end md:items-center gap-2 md:gap-4 z-50">
          
          {/* Notification Toggle */}
          <NotificationToggle language={language} />

          {/* Auth Button */}
          {user ? (
             <div className="flex items-center gap-3 bg-slate-800/60 border border-slate-600 rounded-full pl-4 pr-1 py-1">
                <span className="text-xs font-bold text-amber-100 truncate max-w-[100px]">{user.name}</span>
                <button 
                    onClick={handleLogout}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-700 hover:bg-slate-600 text-slate-300"
                    title={t.logout}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                </button>
             </div>
          ) : (
            <button 
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-1.5 rounded-full bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-bold tracking-wide transition-colors"
            >
              {t.login}
            </button>
          )}

          {/* Language Toggle */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center space-x-2 bg-slate-800/60 hover:bg-slate-700 border border-slate-600 rounded-full px-3 py-1 transition-all"
          >
            <span className={`text-xs font-bold ${language === 'en' ? 'text-amber-400' : 'text-slate-400'}`}>EN</span>
            <div className="w-px h-3 bg-slate-600"></div>
            <span className={`text-xs font-bold ${language === 'hi' ? 'text-amber-400' : 'text-slate-400'}`}>HI</span>
          </button>
        </div>

        <div className="mb-4 mt-2 hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => switchMode('daily')}>
          <Logo className="w-16 h-16 md:w-20 md:h-20" />
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-amber-200 mb-2 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] py-4 px-8 leading-relaxed">
          {t.appTitle}
        </h1>
        <p className="text-base md:text-lg text-indigo-200 font-light tracking-wide max-w-lg mx-auto mb-8">
          {t.subtitle}
        </p>
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8 max-w-4xl">
          <NavButton targetMode="daily" label={t.dailyHoroscope} colorClass="bg-purple-600 border-purple-400" />
          <NavButton targetMode="tarot" label={t.tarot} colorClass="bg-indigo-600 border-indigo-400" />
          <NavButton targetMode="panchang" label={t.dailyPanchang} colorClass="bg-orange-600 border-orange-400" />
          <NavButton targetMode="kundali" label={t.vedicKundali} colorClass="bg-amber-600 border-amber-400" />
          <NavButton targetMode="matchmaking" label={t.matchmaking} colorClass="bg-pink-600 border-pink-400" />
          <NavButton targetMode="palm" label={t.palmReading} colorClass="bg-rose-600 border-rose-400" />
          <NavButton targetMode="numerology" label={t.numerology} colorClass="bg-teal-600 border-teal-400" />
          <NavButton targetMode="learning" label={t.learning} colorClass="bg-cyan-600 border-cyan-400" />
        </div>
      </header>

      <main className="relative z-10 w-full flex flex-col items-center justify-start min-h-[50vh]">
        
        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="relative w-24 h-24 mb-6">
               <Logo className="w-full h-full animate-spin-slow" />
            </div>
            <p className="text-xl font-serif text-amber-100">
              {mode === 'daily' && !personalPrediction ? t.loadingDaily : null}
              {mode === 'daily' && personalPrediction ? "Consulting your personal chart..." : null}
              {mode === 'kundali' && t.loadingKundali}
              {mode === 'panchang' && t.loadingPanchang}
              {mode === 'palm' && t.loadingPalm}
              {mode === 'numerology' && t.loadingNumerology}
              {mode === 'matchmaking' && t.loadingMatchmaking}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
           <div className="max-w-md mx-auto p-6 bg-red-900/30 border border-red-500/50 rounded-lg text-center backdrop-blur-sm mb-8">
             <p className="text-red-200 mb-4">{error}</p>
             <button 
               onClick={mode === 'daily' ? handleDailyBack : mode === 'kundali' ? handleKundaliBack : fetchPanchang}
               className="px-6 py-2 bg-red-800/50 hover:bg-red-700/50 text-white rounded transition-colors"
             >
               {mode === 'panchang' ? 'Retry' : t.return}
             </button>
           </div>
        )}

        {/* Daily Horoscope View */}
        {mode === 'daily' && !loading && !error && (
          <>
            {!selectedSign && !horoscopeData && !personalPrediction && (
              <div className="animate-fade-in w-full">
                 <div className="text-center mb-8">
                    <h2 className="text-2xl font-serif text-slate-300">{t.selectZodiac}</h2>
                 </div>
                <ZodiacGrid onSelect={handleSelectSign} language={language} />
                
                <AdBanner variant="leaderboard" />

                {user && savedCharts.length > 0 && (
                     <div className="mt-8 w-full max-w-5xl mx-auto px-4">
                        <h3 className="text-xl font-serif text-amber-200 mb-6 border-b border-slate-700 pb-2">Your Saved Profiles</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {savedCharts.map(chart => (
                             <div key={chart.id} className="bg-slate-800/40 border border-slate-700 p-4 rounded-xl flex items-center justify-between hover:bg-slate-800 transition-colors">
                                <div>
                                    <p className="font-bold text-amber-100">{chart.name}</p>
                                    <p className="text-xs text-slate-500">{chart.date} • {chart.location}</p>
                                </div>
                                <button 
                                    onClick={() => handleGetPersonalDaily(chart)}
                                    className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded-full transition-colors"
                                >
                                    Daily Forecast
                                </button>
                             </div>
                           ))}
                        </div>
                     </div>
                )}
              </div>
            )}

            {horoscopeData && selectedSign && (
              <HoroscopeCard 
                data={horoscopeData} 
                sign={selectedSign} 
                language={language}
                onBack={handleDailyBack} 
              />
            )}

            {personalPrediction && personalProfile && (
              <div className="w-full">
                  <HoroscopeCard 
                    data={personalPrediction}
                    sign={{
                        id: 'personal',
                        name: personalProfile.name,
                        hindiName: personalProfile.name,
                        dateRange: personalProfile.date,
                        element: 'Air', 
                        description: 'Personal Reading',
                        symbol: <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full"><path d="M12 2L2 7l10 5 10-5-10-5zm0 9l2.5-1.25L12 8.5l-2.5 1.25L12 11zm0 2.5l-5-2.5-5 2.5L12 22l10-8.5-5-2.5-5 2.5z"/></svg>
                    }}
                    language={language}
                    onBack={handleDailyBack}
                  />
                  <div className="text-center mt-4 text-xs text-amber-400/70 uppercase tracking-widest">
                      Personalized reading based on birth chart & Vimshottari Dasha
                  </div>
              </div>
            )}
          </>
        )}

        {/* Tarot View */}
        {mode === 'tarot' && !loading && !error && (
            <TarotReading language={language} />
        )}

        {/* Panchang View */}
        {mode === 'panchang' && !loading && !error && panchangData && (
            <DailyPanchang data={panchangData} language={language} />
        )}

        {/* Kundali View */}
        {mode === 'kundali' && !loading && !error && (
          <>
            {!kundaliData && (
              <KundaliForm 
                onSubmit={handleGenerateKundali} 
                isLoading={loading} 
                language={language}
                savedCharts={savedCharts}
                onLoadChart={(chart) => handleGenerateKundali(chart)}
                onDeleteChart={handleDeleteChart}
                onGetDaily={(chart) => handleGetPersonalDaily(chart)}
              />
            )}
            {kundaliData && (
              <KundaliResult 
                data={kundaliData} 
                name={kundaliName}
                language={language}
                onBack={handleKundaliBack}
                onSave={handleSaveChart}
              />
            )}
          </>
        )}

        {/* Matchmaking View */}
        {mode === 'matchmaking' && !loading && !error && (
            <MatchMaking language={language} />
        )}
        
        {/* Palm Reading View */}
        {mode === 'palm' && !loading && !error && (
             <PalmReading language={language} />
        )}

        {/* Numerology View */}
        {mode === 'numerology' && !loading && !error && (
             <Numerology language={language} />
        )}

        {/* Learning View */}
        {mode === 'learning' && !loading && !error && (
             <LearningCenter language={language} />
        )}

      </main>

      <footer className="relative z-10 py-12 text-center text-slate-500 text-sm flex flex-col gap-4 mb-12">
        <p>&copy; {new Date().getFullYear()} {t.appTitle}. {t.footer}</p>
        
        <div className="flex justify-center gap-6">
           <a 
            href="https://www.instagram.com/palm_reading/?hl=en" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-pink-400 hover:text-pink-300 transition-colors group"
           >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            {t.followInstagram}
           </a>
        </div>
      </footer>

      <AdBanner variant="sticky-footer" />
    </div>
  );
};

export default App;