
import React, { useState, useEffect } from 'react';
import { HoroscopeResponse, ZodiacSignData, Language } from '../types';
import { useTranslation } from '../utils/translations';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface HoroscopeCardProps {
  data: HoroscopeResponse;
  sign: ZodiacSignData;
  language: Language;
  onBack: () => void;
}

const HoroscopeCard: React.FC<HoroscopeCardProps> = ({ data, sign, language, onBack }) => {
  const t = useTranslation(language);
  const today = new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    const pref = localStorage.getItem('cosmic_notifications');
    if (pref === 'true' && Notification.permission === 'granted') {
        setNotifEnabled(true);
    }
  }, []);

  const handleNotifySub = async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        localStorage.setItem('cosmic_notifications', 'true');
        setNotifEnabled(true);
        new Notification(language === 'hi' ? 'पुष्टि हो गई!' : 'Subscription Confirmed!', {
            body: language === 'hi' ? `अब आप ${sign.hindiName} के लिए दैनिक अपडेट प्राप्त करेंगे।` : `You will now receive daily cosmic updates for ${sign.name}.`,
            icon: '/favicon.ico'
        });
    } else {
        alert(language === 'hi' ? 'सूचनाएं चालू करने के लिए अनुमति आवश्यक है।' : 'Permission is required to enable notifications.');
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 animate-fade-in-up pb-12">
      <div className="bg-[#1e293b] border border-amber-500/30 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Mystical Background Layers */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-amber-500/10 to-transparent"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Content */}
        <div className="relative z-10 p-8 md:p-12">
          
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12 border-b border-slate-700/50 pb-8">
            <div className="w-32 h-32 text-amber-500 p-6 bg-slate-900/80 rounded-full border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.15)] flex-shrink-0">
              {sign.symbol}
            </div>
            <div className="text-center md:text-left space-y-1">
              <h2 className="text-4xl md:text-5xl font-serif text-amber-100">
                {language === 'hi' ? sign.hindiName : sign.name}
              </h2>
              <p className="text-amber-500 font-bold tracking-[0.3em] uppercase text-xs">{today}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
                 <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700">Element: {sign.element}</span>
                 <span className="px-3 py-1 bg-slate-800 rounded-full text-[10px] text-slate-400 font-bold uppercase tracking-widest border border-slate-700">Mood: {data.mood}</span>
              </div>
            </div>
          </div>

          <div className="space-y-10">
            <div className="relative">
               <span className="absolute -top-6 -left-2 text-6xl text-amber-500/10 font-serif">"</span>
               <RichText text={data.horoscope} className="text-lg md:text-xl leading-relaxed text-slate-200 font-light italic" />
            </div>
            
            {!notifEnabled && (
                <div className="bg-amber-900/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <span className="text-3xl animate-bounce">🔔</span>
                        <div>
                            <h4 className="text-amber-200 font-bold text-sm uppercase tracking-wider">{language === 'hi' ? 'दैनिक अलर्ट' : 'Daily Alerts'}</h4>
                            <p className="text-slate-500 text-xs">{language === 'hi' ? 'अपने सितारों से जुड़े रहने के लिए सूचनाएं चालू करें।' : 'Never miss a cosmic message from the stars.'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={handleNotifySub}
                        className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-full text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg"
                    >
                        {language === 'hi' ? 'सब्सक्राइब करें' : 'Subscribe Now'}
                    </button>
                </div>
            )}

            <AdBanner variant="leaderboard" className="py-4" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center hover:border-amber-500/40 transition-colors group">
                <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">{t.luckyNumber}</span>
                <span className="text-4xl font-serif text-amber-300 group-hover:scale-110 transition-transform">{data.luckyNumber}</span>
              </div>
              
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center hover:border-amber-500/40 transition-colors group">
                 <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">{language === 'hi' ? 'शुभ रंग' : 'Power Color'}</span>
                 <div className="flex items-center gap-2">
                   <div className="w-5 h-5 rounded-full border border-white/20 shadow-glow" style={{ backgroundColor: data.luckyColor.toLowerCase() || 'gold' }} />
                   <span className="text-sm font-bold text-slate-200 uppercase tracking-tighter">{data.luckyColor}</span>
                 </div>
              </div>

              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 flex flex-col items-center hover:border-amber-500/40 transition-colors group">
                 <span className="text-[10px] uppercase text-slate-500 tracking-widest font-bold mb-2">{t.compatibility}</span>
                 <span className="text-sm font-bold text-pink-300 group-hover:scale-105 transition-transform">{data.compatibility}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeCard;
