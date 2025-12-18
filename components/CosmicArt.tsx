
import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, User } from '../types';
import { generateCosmicArt } from '../services/geminiService';
import AdBanner from './AdBanner';

interface CosmicArtProps {
  language: Language;
  user: User | null;
  onUseKarma: (amount: number) => boolean;
  onOpenStore: () => void;
}

const CosmicArt: React.FC<CosmicArtProps> = ({ language }) => {
  const t = useTranslation(language);
  const [loading, setLoading] = useState(false);
  const [artUrl, setArtUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    try {
        const url = await generateCosmicArt("Celestial Vedic Soul Portrait", language);
        setArtUrl(url);
    } catch (e: any) {
        setError(t.errorGeneric);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-20 animate-fade-in-up">
       <div className="bg-slate-800/80 border border-amber-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center">
          <h2 className="text-3xl font-serif text-amber-200 mb-2">{t.artTitle}</h2>
          <p className="text-slate-400 text-sm mb-10">{t.artSubtitle}</p>

          {!artUrl ? (
             <div className="flex flex-col items-center">
                <div className="w-64 h-64 border-2 border-slate-700 border-dashed rounded-2xl flex items-center justify-center mb-8 bg-slate-900/40">
                   <span className="text-4xl">🎨</span>
                </div>
                <button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full max-w-xs py-4 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl text-white font-bold font-serif transition-all disabled:opacity-50 shadow-xl hover:shadow-amber-500/20"
                >
                    {loading ? "Generating Your Soul Vision..." : t.generateArt}
                </button>
             </div>
          ) : (
            <div className="space-y-8 animate-fade-in">
               <img src={artUrl} alt="Cosmic Art" className="rounded-2xl mx-auto max-w-lg shadow-2xl border-4 border-amber-900/20" />
               <div className="flex justify-center gap-4">
                    <button onClick={() => setArtUrl(null)} className="px-8 py-2 border border-slate-700 text-slate-400 rounded-full text-xs uppercase font-bold tracking-widest hover:text-white">Back</button>
                    <a href={artUrl} download="cosmic-art.png" className="px-8 py-2 bg-amber-600 text-white rounded-full text-xs uppercase font-bold tracking-widest hover:bg-amber-500">Download</a>
               </div>
            </div>
          )}
          <AdBanner variant="leaderboard" className="mt-12" />
       </div>
    </div>
  );
};

export default CosmicArt;
