
import React, { useState } from 'react';
import { Language } from '../types';
import { searchOccultVault } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';

const VAULT_CATEGORIES = [
    { id: 'chakra', name: 'Chakras', hindi: 'चक्र', icon: '🌀', desc: 'Energy centers of the human soul' },
    { id: 'crystals', name: 'Crystals', hindi: 'क्रिस्टल', icon: '💎', desc: 'Vibrational stones of Gaia' },
    { id: 'geometry', name: 'Sacred Geometry', hindi: 'पवित्र ज्यामिति', icon: '📐', desc: 'The blueprint of creation' },
    { id: 'aura', name: 'Aura Colors', hindi: 'आभामंडल', icon: '🌈', desc: 'The subtle light of your field' },
    { id: 'yantras', name: 'Yantras', hindi: 'यंत्र', icon: '☸', desc: 'Power portals in visual form' }
];

const OccultVault: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [activeCat, setActiveCat] = useState(VAULT_CATEGORIES[0]);
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
        const data = await searchOccultVault(query, activeCat.name, language);
        setResult(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up">
      <div className="bg-slate-800/80 border border-yellow-500/30 rounded-3xl p-8 shadow-2xl min-h-[600px] flex flex-col md:flex-row gap-8">
        
        <div className="w-full md:w-1/3 space-y-4">
            <h2 className="text-2xl font-serif text-yellow-200 mb-6">{t.occultVaultTitle}</h2>
            <div className="space-y-2">
                {VAULT_CATEGORIES.map(cat => (
                    <button 
                        key={cat.id} 
                        onClick={() => { setActiveCat(cat); setResult(null); }}
                        className={`w-full p-4 rounded-xl border flex items-center gap-4 transition-all text-left ${activeCat.id === cat.id ? 'bg-yellow-600 border-yellow-400 shadow-lg' : 'bg-slate-900/50 border-slate-700 hover:border-yellow-500/30'}`}
                    >
                        <span className="text-2xl">{cat.icon}</span>
                        <div>
                            <p className={`font-bold text-sm ${activeCat.id === cat.id ? 'text-white' : 'text-slate-200'}`}>{language === 'hi' ? cat.hindi : cat.name}</p>
                            <p className="text-[10px] text-slate-400 group-hover:text-slate-300">{cat.desc}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>

        <div className="flex-1 flex flex-col">
            <div className="bg-slate-900/60 p-8 rounded-3xl border border-slate-700 flex-1 flex flex-col">
                <div className="flex flex-col items-center justify-center text-center mb-10 flex-1">
                    <span className="text-6xl mb-4">{activeCat.icon}</span>
                    <h3 className="text-2xl font-serif text-white mb-2">{(language === 'hi' ? activeCat.hindi : activeCat.name)} {t.occultExplorer}</h3>
                    <p className="text-slate-400 text-sm italic max-w-xs">{t.askDeepQuestion}</p>
                </div>

                <div className="relative group">
                    <input 
                        type="text" 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={language === 'hi' ? `${activeCat.hindi} के बारे में पूछें...` : `Ask about ${activeCat.name}...`}
                        className="w-full bg-slate-800 border-2 border-slate-700 rounded-2xl px-6 py-4 text-white outline-none focus:border-yellow-500 transition-all shadow-xl"
                    />
                    <button 
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-yellow-600 rounded-xl text-white font-bold hover:bg-yellow-500 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {loading ? t.loadingButton : t.revealVault}
                    </button>
                </div>
            </div>

            {result && (
                <div className="mt-8 bg-slate-900/90 p-8 rounded-3xl border border-yellow-500/30 animate-fade-in-up">
                    <RichText text={result} />
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default OccultVault;
