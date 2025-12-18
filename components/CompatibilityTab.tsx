import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, MatchMakingInput } from '../types';
import { calculateLifePath } from '../utils/numerologyUtils';
import { generateTripleCompatibility, getAstroDetails, generateMatchMaking } from '../services/geminiService';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface CompatibilityTabProps {
  language: Language;
}

const CompatibilityTab: React.FC<CompatibilityTabProps> = ({ language }) => {
  const t = useTranslation(language);
  const [personA, setPersonA] = useState<MatchMakingInput>({ name: '', date: '', time: '12:00', location: 'New Delhi, India' });
  const [personB, setPersonB] = useState<MatchMakingInput>({ name: '', date: '', time: '12:00', location: 'New Delhi, India' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!personA.date || !personB.date) return;

    setLoading(true);
    try {
      // 1. Fetch accurate Nakshatra and Moon Sign for both people
      const [astroA, astroB, gunaMatch] = await Promise.all([
          getAstroDetails(personA),
          getAstroDetails(personB),
          generateMatchMaking(personA, personB, language)
      ]);

      const ashtakootScore = gunaMatch?.ashtakoot_score?.total?.obtained_points || 0;

      // 2. Perform AI Analysis with the identified Vedic details and score
      const data = await generateTripleCompatibility(
        { 
            name: personA.name, 
            lp: calculateLifePath(personA.date), 
            sign: astroA.sign, 
            nakshatra: astroA.nakshatra,
            ashtakootScore: ashtakootScore
        },
        { 
            name: personB.name, 
            lp: calculateLifePath(personB.date), 
            sign: astroB.sign, 
            nakshatra: astroB.nakshatra 
        },
        language
      );
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const ScoreBar = ({ label, score, color }: { label: string, score: number, color: string }) => (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">{label}</span>
        <span className={`text-xl font-serif font-bold ${color}`}>{score}%</span>
      </div>
      <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color.replace('text-', 'bg-')} transition-all duration-1000`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in-up">
      {!result ? (
        <div className="bg-slate-800/80 backdrop-blur-md border border-pink-500/30 rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-pink-200 via-white to-pink-200 mb-2">
              {t.compTitle}
            </h2>
            <p className="text-slate-400 text-sm">{t.compSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative">
               <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-slate-700"></div>
               
               {/* Person A Details */}
               <div className="space-y-4">
                 <h3 className="text-center text-pink-300 font-serif uppercase tracking-widest">{t.personA}</h3>
                 <input 
                   type="text" 
                   placeholder={t.fullName}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                   value={personA.name}
                   onChange={e => setPersonA({...personA, name: e.target.value})}
                   required
                 />
                 <div className="grid grid-cols-2 gap-4">
                     <input 
                       type="date" 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personA.date}
                       onChange={e => setPersonA({...personA, date: e.target.value})}
                       required
                     />
                     <input 
                       type="time" 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personA.time}
                       onChange={e => setPersonA({...personA, time: e.target.value})}
                       required
                     />
                 </div>
                 <input 
                   type="text" 
                   placeholder={t.pobPlaceholder}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-pink-500 outline-none"
                   value={personA.location}
                   onChange={e => setPersonA({...personA, location: e.target.value})}
                   required
                 />
               </div>

               {/* Person B Details */}
               <div className="space-y-4">
                 <h3 className="text-center text-indigo-300 font-serif uppercase tracking-widest">{t.personB}</h3>
                 <input 
                   type="text" 
                   placeholder={t.fullName}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                   value={personB.name}
                   onChange={e => setPersonB({...personB, name: e.target.value})}
                   required
                 />
                 <div className="grid grid-cols-2 gap-4">
                     <input 
                       type="date" 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personB.date}
                       onChange={e => setPersonB({...personB, date: e.target.value})}
                       required
                     />
                     <input 
                       type="time" 
                       className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white [color-scheme:dark]"
                       value={personB.time}
                       onChange={e => setPersonB({...personB, time: e.target.value})}
                       required
                     />
                 </div>
                 <input 
                   type="text" 
                   placeholder={t.pobPlaceholder}
                   className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none"
                   value={personB.location}
                   onChange={e => setPersonB({...personB, location: e.target.value})}
                   required
                 />
               </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full max-w-md mx-auto block bg-gradient-to-r from-pink-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50"
            >
              {loading ? t.loadingCompatibility : t.checkBond}
            </button>
          </form>
          <div className="mt-8">
            <AdBanner variant="box" />
          </div>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="flex justify-between items-center">
              <button onClick={() => setResult(null)} className="text-pink-400 hover:text-white transition-colors text-sm font-bold uppercase flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                {t.return}
              </button>
              <h2 className="text-xl font-serif text-white">{personA.name} + {personB.name}</h2>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-slate-800/80 border border-pink-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl font-serif">❤️</div>
                 <h3 className="text-slate-400 uppercase tracking-widest text-xs mb-4">{t.overallScore}</h3>
                 <div className="w-32 h-32 rounded-full border-4 border-pink-500 flex items-center justify-center mb-4">
                    <span className="text-5xl font-serif font-bold text-white">{result.overallScore}%</span>
                 </div>
              </div>

              <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700 p-8 rounded-2xl space-y-8">
                 <ScoreBar label={t.numerologyMatch} score={result.numerologyScore} color="text-amber-400" />
                 <ScoreBar label={t.nakshatraMatch} score={result.nakshatraScore} color="text-teal-400" />
                 <ScoreBar label={t.signMatch} score={result.signScore} color="text-indigo-400" />
              </div>
           </div>

           <div className="bg-slate-900/80 border border-purple-500/20 p-8 rounded-2xl shadow-inner">
              <h3 className="text-xl font-serif text-pink-300 mb-4">{t.aiAnalysis}</h3>
              <RichText text={result.report} className="text-slate-300 leading-relaxed text-lg font-light" />
           </div>
           
           <AdBanner variant="leaderboard" />
        </div>
      )}
    </div>
  );
};

export default CompatibilityTab;