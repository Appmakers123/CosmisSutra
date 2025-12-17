import React, { useState } from 'react';
import { MatchMakingInput, MatchMakingResponse, Language } from '../types';
import { useTranslation } from '../utils/translations';
import { generateMatchMaking, generateCompatibilityReport } from '../services/geminiService';
import { calculateLifePath, getSunSign } from '../utils/numerologyUtils';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface MatchMakingProps {
  language: Language;
}

const MatchMaking: React.FC<MatchMakingProps> = ({ language }) => {
  const t = useTranslation(language);
  
  const initialFormState = {
    name: '',
    date: '',
    time: '',
    location: '',
    lat: undefined,
    lon: undefined,
    tzone: undefined
  };

  const [boy, setBoy] = useState<MatchMakingInput>(initialFormState);
  const [girl, setGirl] = useState<MatchMakingInput>(initialFormState);
  const [result, setResult] = useState<MatchMakingResponse | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fallbackMode, setFallbackMode] = useState(false);

  // Helper to handle input changes for nested objects
  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement>, 
      person: 'boy' | 'girl', 
      setPerson: React.Dispatch<React.SetStateAction<MatchMakingInput>>
  ) => {
      const { name, value } = e.target;
      setPerson(prev => ({ ...prev, [name]: value }));
      // Reset error when user types
      if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      // Added explicit check for date/time to prevent sending zeroes
      if (!boy.location || !girl.location || !boy.date || !boy.time || !girl.date || !girl.time) {
          setError("Please fill in all birth details for both profiles.");
          return;
      }
      
      setLoading(true);
      setError(null);
      setResult(null);
      setAiReport(null);
      setFallbackMode(false);

      try {
          // 1. Fetch Ashtakoot Score (Basic Vedic)
          const data = await generateMatchMaking(boy, girl, language);
          
          // Safety check: Service now returns fallback if API fails, so data should exist
          if (!data || !data.ashtakoot_score) {
              console.warn("Unexpected data structure, using fallback UI state");
          }
          
          setResult(data);

          // 2. Calculate Local Stats for AI
          const boySign = getSunSign(boy.date);
          const boyLP = calculateLifePath(boy.date);
          const girlSign = getSunSign(girl.date);
          const girlLP = calculateLifePath(girl.date);

          // 3. Generate Comprehensive Report using Gemini with Grounding
          try {
              const report = await generateCompatibilityReport(
                  { name: boy.name, sign: boySign, lifePath: boyLP },
                  { name: girl.name, sign: girlSign, lifePath: girlLP },
                  data.ashtakoot_score, // If API failed, this will be the mock score (0)
                  language
              );
              setAiReport(report);
          } catch (aiError) {
              console.warn("AI Report failed, enabling fallback mode", aiError);
              setFallbackMode(true);
          }

      } catch (err) {
          console.error("Matchmaking error:", err);
          let errorMessage = t.errorGeneric || "Unable to calculate compatibility.";
          if (err instanceof Error) {
              if (err.message.includes("Location Error")) {
                  errorMessage = "Could not find coordinates for the entered city. Please check spelling.";
              } else if (err.message.includes("API")) {
                  errorMessage = "Service is temporarily unavailable. Please try again later.";
              }
          }
          setError(errorMessage);
      } finally {
          setLoading(false);
      }
  };

  const GunaRow = ({ title, total_points, obtained_points, description }: { title: string, total_points: number, obtained_points: number, description: string }) => (
      <tr className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors">
          <td className="p-3 font-bold text-amber-500 capitalize">{title.replace('_', ' ')}</td>
          <td className="p-3 text-center text-slate-300">{total_points}</td>
          <td className="p-3 text-center font-bold text-emerald-300">{obtained_points}</td>
          <td className="p-3 text-sm text-slate-400 hidden sm:table-cell">{description}</td>
      </tr>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 animate-fade-in-up">
        {!result ? (
            <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-6 md:p-10 shadow-2xl relative overflow-hidden">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-pink-200 to-amber-200 mb-2">
                        {t.matchmaking || "Matchmaking"}
                    </h2>
                    <p className="text-slate-400 text-sm">Vedic Ashtakoot, Numerology & Sun Sign Analysis</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-center text-red-200 text-sm">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                        {/* Divider for Desktop */}
                        <div className="hidden md:block absolute top-0 bottom-0 left-1/2 w-px bg-gradient-to-b from-transparent via-slate-600 to-transparent"></div>

                        {/* Boy's Form */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif text-blue-300 text-center mb-4">{t.boyDetails}</h3>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">{t.fullName}</label>
                                <input type="text" name="name" value={boy.name} onChange={(e) => handleInputChange(e, 'boy', setBoy)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">{t.dob}</label>
                                    <input type="date" name="date" value={boy.date} onChange={(e) => handleInputChange(e, 'boy', setBoy)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white [color-scheme:dark]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">{t.tob}</label>
                                    <input type="time" name="time" value={boy.time} onChange={(e) => handleInputChange(e, 'boy', setBoy)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white [color-scheme:dark]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">{t.pob}</label>
                                <input type="text" name="location" value={boy.location} onChange={(e) => handleInputChange(e, 'boy', setBoy)} placeholder="City, Country" className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white" />
                            </div>
                        </div>

                        {/* Girl's Form */}
                        <div className="space-y-4">
                            <h3 className="text-xl font-serif text-pink-300 text-center mb-4">{t.girlDetails}</h3>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">{t.fullName}</label>
                                <input type="text" name="name" value={girl.name} onChange={(e) => handleInputChange(e, 'girl', setGirl)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">{t.dob}</label>
                                    <input type="date" name="date" value={girl.date} onChange={(e) => handleInputChange(e, 'girl', setGirl)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white [color-scheme:dark]" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">{t.tob}</label>
                                    <input type="time" name="time" value={girl.time} onChange={(e) => handleInputChange(e, 'girl', setGirl)} className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white [color-scheme:dark]" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-500 uppercase font-bold">{t.pob}</label>
                                <input type="text" name="location" value={girl.location} onChange={(e) => handleInputChange(e, 'girl', setGirl)} placeholder="City, Country" className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full max-w-md mx-auto block bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-serif font-bold py-4 rounded-xl shadow-lg transition-all disabled:opacity-50"
                        >
                             {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    {t.loadingMatchmaking || "Analyzing Compatibility..."}
                                </span>
                             ) : t.matchSubmit}
                        </button>
                    </div>
                </form>
            </div>
        ) : (
            <div className="space-y-8 animate-fade-in">
                 <div className="flex justify-between items-center">
                    <button 
                        onClick={() => setResult(null)}
                        className="flex items-center text-pink-400 hover:text-white transition-colors text-sm font-bold tracking-wide uppercase"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                        </svg>
                        {t.return}
                    </button>
                    <div className="text-right">
                         <h2 className="text-xl font-serif text-white">{boy.name} <span className="text-pink-500">❤</span> {girl.name}</h2>
                    </div>
                </div>

                {/* Score Card */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 bg-gradient-to-br from-slate-900 to-slate-800 border border-pink-500/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10 text-9xl">❤</div>
                         <h3 className="text-slate-400 uppercase tracking-widest text-sm mb-2">{t.matchScore}</h3>
                         <div className="relative">
                            <span className="text-6xl font-serif font-bold text-white relative z-10">{result.ashtakoot_score?.total?.obtained_points ?? 0}</span>
                            <span className="text-2xl text-slate-500 font-serif"> / 36</span>
                         </div>
                         <div className={`mt-4 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${result.conclusion.status ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/30 border-red-500/50 text-red-300'}`}>
                             {result.conclusion.status ? 'Compatible' : 'Low Compatibility'}
                         </div>
                     </div>

                     {/* AI Report / Fallback */}
                     <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/50 rounded-2xl p-8">
                         <h3 className="text-xl font-serif text-amber-200 mb-4">{t.matchConclusion}</h3>
                         
                         {aiReport ? (
                             <RichText text={aiReport} className="text-slate-300 leading-relaxed text-lg font-light" />
                         ) : fallbackMode ? (
                             <div className="space-y-4">
                                 <p className="text-slate-300 leading-relaxed text-lg font-light italic">
                                     {result.conclusion.report}
                                 </p>
                                 <div className="mt-6 p-4 bg-slate-900/50 rounded-xl border border-slate-700">
                                     <p className="text-amber-400 text-sm mb-3">
                                         Our AI Astrologer is currently taking a break. You can check detailed compatibility on Google:
                                     </p>
                                     <a 
                                         href={`https://www.google.com/search?q=${getSunSign(boy.date)}+and+${getSunSign(girl.date)}+compatibility`} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-full font-bold transition-colors"
                                     >
                                         <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/></svg>
                                         Search on Google
                                     </a>
                                 </div>
                             </div>
                         ) : (
                             <RichText text={result.conclusion.report} className="text-slate-300 leading-relaxed text-lg font-light" />
                         )}
                     </div>
                </div>
                
                <AdBanner variant="leaderboard" />

                {/* Ashtakoot Detailed Table */}
                <div className="bg-slate-900/40 border border-slate-700 rounded-xl overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                                <th className="p-4">{t.area || "Area (Koot)"}</th>
                                <th className="p-4 text-center">{t.total || "Total"}</th>
                                <th className="p-4 text-center">{t.obtained || "Obtained"}</th>
                                <th className="p-4 hidden sm:table-cell">{t.description || "Description"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {result.ashtakoot_score?.varna && <GunaRow title="varna" {...result.ashtakoot_score.varna} />}
                            {result.ashtakoot_score?.vashya && <GunaRow title="vashya" {...result.ashtakoot_score.vashya} />}
                            {result.ashtakoot_score?.tara && <GunaRow title="tara" {...result.ashtakoot_score.tara} />}
                            {result.ashtakoot_score?.yoni && <GunaRow title="yoni" {...result.ashtakoot_score.yoni} />}
                            {result.ashtakoot_score?.graha_maitri && <GunaRow title="graha_maitri" {...result.ashtakoot_score.graha_maitri} />}
                            {result.ashtakoot_score?.gana && <GunaRow title="gana" {...result.ashtakoot_score.gana} />}
                            {result.ashtakoot_score?.bhakoot && <GunaRow title="bhakoot" {...result.ashtakoot_score.bhakoot} />}
                            {result.ashtakoot_score?.nadi && <GunaRow title="nadi" {...result.ashtakoot_score.nadi} />}
                        </tbody>
                    </table>
                </div>

                <div className="mt-8">
                    <AdBanner variant="leaderboard" />
                </div>
            </div>
        )}
    </div>
  );
};

export default MatchMaking;