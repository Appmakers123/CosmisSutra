import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, NumerologyInput, NumerologyResponse } from '../types';
import { calculateLifePath, calculateDestiny, calculateSoulUrge, calculatePersonality, calculateBirthday } from '../utils/numerologyUtils';
import { generateNumerologyReport } from '../services/geminiService';
import AdBanner from './AdBanner';

interface NumerologyProps {
  language: Language;
}

const Numerology: React.FC<NumerologyProps> = ({ language }) => {
  const t = useTranslation(language);
  const [formData, setFormData] = useState<NumerologyInput>({ name: '', dob: '' });
  const [report, setReport] = useState<NumerologyResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.dob) return;

    setLoading(true);
    setError(null);
    setReport(null);

    try {
      // 1. Calculate Numbers locally (Standard Numerology Logic)
      const lifePath = calculateLifePath(formData.dob);
      const destiny = calculateDestiny(formData.name);
      const soulUrge = calculateSoulUrge(formData.name);
      const personality = calculatePersonality(formData.name);
      const birthday = calculateBirthday(formData.dob);

      // 2. Interpret with Gemini acting as the expert
      const data = await generateNumerologyReport(
        formData.name,
        lifePath,
        destiny,
        soulUrge,
        personality,
        birthday,
        language
      );

      setReport(data);

    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const NumberCard = ({ title, num, desc }: { title: string, num: number, desc: string }) => (
    <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 relative overflow-hidden group hover:border-teal-500/50 transition-all duration-300 h-full flex flex-col">
      <div className="absolute top-0 right-0 p-4 opacity-5 text-6xl font-serif font-bold group-hover:scale-110 transition-transform">
        {num}
      </div>
      <h3 className="text-teal-400 font-serif text-lg mb-2 uppercase tracking-widest">{title}</h3>
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full border-2 border-teal-500/30 flex items-center justify-center text-3xl font-bold text-white bg-slate-900/50 shadow-[0_0_15px_rgba(20,184,166,0.2)] shrink-0">
          {num}
        </div>
        <div className="h-px bg-slate-700 flex-1"></div>
      </div>
      <p className="text-slate-300 text-sm leading-relaxed font-light">{desc}</p>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in-up">
      {!report ? (
        <div className="bg-slate-800/80 backdrop-blur-md border border-teal-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden max-w-xl mx-auto">
          {/* Decorative Elements */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-60"></div>
          
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-teal-200 via-emerald-200 to-teal-100 mb-2">
              {t.numerologyTitle}
            </h2>
            <p className="text-slate-400 text-sm">{t.numerologySubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-teal-500/80 font-bold ml-1">{t.fullName}</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-teal-500/80 font-bold ml-1">{t.dob}</label>
              <input
                type="date"
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full bg-slate-900/50 border border-slate-600 rounded-lg px-4 py-3 text-slate-100 focus:outline-none focus:border-teal-500 transition-all [color-scheme:dark]"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 disabled:opacity-50"
            >
              {loading ? (
                 <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    {t.loadingButton}
                 </span>
              ) : t.revealDestiny}
            </button>
          </form>
          
          <div className="mt-8">
            <AdBanner variant="box" />
          </div>

        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <button 
                onClick={() => setReport(null)}
                className="flex items-center text-teal-400 hover:text-white transition-colors text-sm font-bold tracking-wide uppercase"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t.return}
              </button>
              <h2 className="text-2xl font-serif text-teal-100">{formData.name}</h2>
           </div>

           <AdBanner variant="leaderboard" />

           {/* Top 3 Core Numbers */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <NumberCard title={t.lifePath} num={report.lifePath.number} desc={report.lifePath.description} />
              <NumberCard title={t.destinyNum} num={report.destiny.number} desc={report.destiny.description} />
              <NumberCard title={t.soulUrge} num={report.soulUrge.number} desc={report.soulUrge.description} />
           </div>

           {/* Secondary Numbers Row */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <NumberCard title={t.personalityNum} num={report.personality.number} desc={report.personality.description} />
              <NumberCard title={t.birthdayNum} num={report.birthday.number} desc={report.birthday.description} />
           </div>

           <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-8 mt-8">
              <h3 className="text-xl font-serif text-amber-200 mb-4 flex items-center gap-2">
                 <span className="text-2xl">✨</span> {t.dailyNumForecast}
              </h3>
              <p className="text-slate-300 leading-relaxed italic text-lg">{report.dailyForecast}</p>
           </div>
           
           <AdBanner variant="leaderboard" />
        </div>
      )}
    </div>
  );
};

export default Numerology;