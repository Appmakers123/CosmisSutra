
import React, { useState, useEffect } from 'react';
import { MuhuratItem, Language } from '../types';
import { generateMuhuratPlanner } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';

const MuhuratPlanner: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [muhurats, setMuhurats] = useState<MuhuratItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await generateMuhuratPlanner("New Delhi, India", language);
        setMuhurats(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetch();
  }, [language]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Excellent': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'Good': return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'Average': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'Avoid': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-800 text-slate-400';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-fade-in-up">
      <div className="bg-slate-800/60 border border-green-500/30 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-green-200 mb-2">{t.muhuratPlannerTitle}</h2>
          <p className="text-slate-400 text-sm">{t.muhuratSubtitle}</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin"></div>
            <p className="mt-4 text-green-300 animate-pulse">{t.scanningTithis}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {muhurats.map((m, i) => (
              <div key={i} className="bg-slate-900/60 border border-slate-700 rounded-xl p-6 hover:border-green-500/20 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-serif text-white">{m.activity}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(m.status)}`}>
                    {m.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-3 text-green-400/80">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <span className="text-sm font-mono">{m.timeRange}</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed italic">"{m.reason}"</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MuhuratPlanner;
