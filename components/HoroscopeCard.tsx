import React from 'react';
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

  return (
    <div className="w-full max-w-2xl mx-auto px-4 animate-fade-in-up">
      <button 
        onClick={onBack}
        className="mb-6 flex items-center text-purple-300 hover:text-white transition-colors text-sm font-bold tracking-wide uppercase"
      >
        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t.chooseAnother}
      </button>

      <div className="bg-slate-800/80 backdrop-blur-md border border-purple-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col items-center text-center mb-8 relative z-10">
          <div className="w-20 h-20 text-purple-400 mb-4 p-4 bg-slate-900/50 rounded-full border border-purple-500/20 shadow-inner">
            {sign.symbol}
          </div>
          <h2 className="text-4xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-white to-indigo-200 mb-2">
            {language === 'hi' ? sign.hindiName : sign.name}
          </h2>
          <p className="text-indigo-200 font-light tracking-widest uppercase text-sm">{today}</p>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="bg-slate-900/40 p-6 rounded-xl border border-slate-700/50">
             <RichText text={data.horoscope} className="text-lg leading-relaxed text-slate-200 font-light italic" />
          </div>
          
          <AdBanner variant="leaderboard" className="my-4" />

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center hover:bg-slate-800/60 transition-colors">
              <span className="text-xs uppercase text-slate-400 tracking-wider mb-1 text-center">{t.luckyNumber}</span>
              <span className="text-3xl font-serif text-amber-300">{data.luckyNumber}</span>
            </div>
            
            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center hover:bg-slate-800/60 transition-colors">
               <span className="text-xs uppercase text-slate-400 tracking-wider mb-1 text-center">{t.mood}</span>
               <span className="text-xl font-medium text-pink-300">{data.mood}</span>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center hover:bg-slate-800/60 transition-colors">
               <span className="text-xs uppercase text-slate-400 tracking-wider mb-1 text-center">{t.color}</span>
               <div className="flex items-center gap-2">
                 <div className="w-4 h-4 rounded-full border border-white/20 shadow-sm" style={{ backgroundColor: 'currentColor' }} />
                 <span className="text-lg font-medium text-teal-200">{data.luckyColor}</span>
               </div>
            </div>

            <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/50 flex flex-col items-center hover:bg-slate-800/60 transition-colors">
               <span className="text-xs uppercase text-slate-400 tracking-wider mb-1 text-center">{t.compatibility}</span>
               <span className="text-lg font-medium text-purple-300">{data.compatibility}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HoroscopeCard;