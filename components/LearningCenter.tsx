import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { PLANETS_INFO, HOUSES_INFO, ZODIAC_SIGNS } from '../constants';
import { generateConjunctionAnalysis, generatePlacementAnalysis } from '../services/geminiService';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface LearningCenterProps {
  language: Language;
}

const LearningCenter: React.FC<LearningCenterProps> = ({ language }) => {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<'planets' | 'houses' | 'placements' | 'conjunctions'>('planets');
  
  // Conjunction State
  const [p1, setP1] = useState(PLANETS_INFO[0].name);
  const [p2, setP2] = useState(PLANETS_INFO[1].name);
  const [p3, setP3] = useState<string>(""); // Optional 3rd planet
  const [house, setHouse] = useState(1);
  const [conjunctionSign, setConjunctionSign] = useState(ZODIAC_SIGNS[0].name);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Placement State
  const [placementPlanet, setPlacementPlanet] = useState(PLANETS_INFO[0].name);
  const [placementHouse, setPlacementHouse] = useState(1);
  const [placementSign, setPlacementSign] = useState(ZODIAC_SIGNS[0].name);
  const [placementAnalysis, setPlacementAnalysis] = useState<string | null>(null);
  const [placementLoading, setPlacementLoading] = useState(false);

  const handleAnalyze = async () => {
    setAnalysis(null);

    const selected = [p1, p2, p3].filter(p => p !== "");
    
    // 1. Validation: Need at least 2 planets
    if (selected.length < 2) {
        setAnalysis(language === 'hi' ? "कृपया कम से कम दो ग्रह चुनें।" : "Please select at least two planets.");
        return;
    }

    // 2. Validation: Unique planets check
    const unique = new Set(selected);
    if (unique.size !== selected.length) {
        setAnalysis(t.errorDuplicate || "Please select different planets.");
        return;
    }

    // 3. Validation: Rahu + Ketu check
    const hasRahu = selected.includes('Rahu');
    const hasKetu = selected.includes('Ketu');
    if (hasRahu && hasKetu) {
        setAnalysis(t.errorRahuKetu || "Rahu and Ketu cannot be in conjunction.");
        return;
    }

    setLoading(true);
    try {
        const result = await generateConjunctionAnalysis(selected, house, conjunctionSign, language);
        setAnalysis(result);
    } catch (e) {
        setAnalysis(language === 'hi' ? "विश्लेषण करने में विफल।" : "Failed to analyze. The stars are silent.");
    } finally {
        setLoading(false);
    }
  };

  const handlePlacementAnalyze = async () => {
      setPlacementLoading(true);
      setPlacementAnalysis(null);
      try {
          const result = await generatePlacementAnalysis(placementPlanet, placementHouse, placementSign, language);
          setPlacementAnalysis(result);
      } catch (e) {
          setPlacementAnalysis(language === 'hi' ? "विश्लेषण करने में विफल।" : "Failed to analyze. The stars are silent.");
      } finally {
          setPlacementLoading(false);
      }
  };

  const TabButton = ({ id, label }: { id: typeof activeTab, label: string }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`px-4 py-2 rounded-full font-serif text-xs md:text-sm transition-all duration-300 ${
        activeTab === id 
          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25' 
          : 'bg-slate-800 text-slate-400 hover:text-white'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-6xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-200 mb-2 py-4">
          {t.learningTitle || "Cosmic Classroom"}
        </h2>
        <p className="text-slate-400 text-sm">{language === 'hi' ? "सितारों की भाषा सीखें" : "Master the language of the stars"}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-8">
        <TabButton id="planets" label={t.planets || "Planets"} />
        <TabButton id="houses" label={t.houses || "Houses"} />
        <TabButton id="placements" label={t.placements || "Placements"} />
        <TabButton id="conjunctions" label={t.conjunctions || "Conjunctions"} />
      </div>

      <div className="bg-slate-800/60 backdrop-blur-md border border-slate-700/50 rounded-2xl p-6 min-h-[400px]">
        
        {/* PLANETS TAB */}
        {activeTab === 'planets' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                {PLANETS_INFO.map((planet) => (
                    <div key={planet.name} className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-amber-500/50 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                            <h3 className={`text-xl font-serif font-bold ${planet.color}`}>
                                {language === 'hi' ? planet.hindi : planet.name}
                            </h3>
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                                {language === 'hi' ? planet.name : planet.hindi}
                            </span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {language === 'hi' ? planet.descriptionHi : planet.description}
                        </p>
                        <div className="mt-3 h-1 w-0 bg-gradient-to-r from-transparent via-amber-500 to-transparent group-hover:w-full transition-all duration-700"></div>
                    </div>
                ))}
            </div>
        )}

        {/* HOUSES TAB */}
        {activeTab === 'houses' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
                 {HOUSES_INFO.map((h) => (
                    <div key={h.id} className="bg-slate-900/50 border border-slate-700 rounded-xl p-5 hover:border-purple-500/50 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-3 opacity-5 text-6xl font-serif font-bold pointer-events-none">
                            {h.id}
                        </div>
                        <h3 className="text-lg font-serif text-purple-200 mb-1">
                            {h.id}. {language === 'hi' ? h.nameHi : h.name}
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed pl-2 border-l-2 border-purple-500/30">
                            {language === 'hi' ? h.descHi : h.desc}
                        </p>
                    </div>
                 ))}
            </div>
        )}

        {/* PLACEMENTS TAB */}
        {activeTab === 'placements' && (
            <div className="animate-fade-in max-w-3xl mx-auto">
                <div className="text-center mb-6">
                    <p className="text-slate-300 text-sm mb-4">
                        {language === 'hi' 
                         ? "किसी भी भाव और राशि में किसी भी ग्रह के प्रभाव को जानें।"
                         : "Discover the effects of any planet in any house and sign."} 
                        <br/>
                        <span className="text-xs text-slate-500">
                           {language === 'hi' ? "उदा: मेष राशि के प्रथम भाव में सूर्य..." : "e.g. Sun in 1st House in Aries..."}
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 max-w-lg mx-auto">
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{t.selectPlanet || "Planet"}</label>
                        <select 
                            value={placementPlanet} 
                            onChange={(e) => setPlacementPlanet(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "राशि" : "Sign"}</label>
                        <select 
                            value={placementSign} 
                            onChange={(e) => setPlacementSign(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {ZODIAC_SIGNS.map(z => (
                                <option key={z.name} value={z.name}>{language === 'hi' ? z.hindiName : z.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "भाव (1-12)" : "House (1-12)"}</label>
                        <select 
                            value={placementHouse} 
                            onChange={(e) => setPlacementHouse(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                                <option key={h} value={h}>{h} {language === 'hi' ? "भाव" : "House"}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handlePlacementAnalyze}
                    disabled={placementLoading}
                    className="w-full max-w-lg mx-auto block bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-serif font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                    {placementLoading 
                        ? (language === 'hi' ? "सितारों से पूछ रहे हैं..." : "Consulting the Sages...") 
                        : (language === 'hi' ? "प्रभाव जानें" : "Reveal Effects")}
                </button>

                {placementAnalysis && (
                    <div className="mt-8 bg-slate-900/80 border border-teal-500/30 p-6 rounded-xl animate-fade-in-up">
                        <h3 className="text-lg font-serif text-teal-100 mb-3 border-b border-slate-700 pb-2">
                             {language === 'hi' 
                                ? `${placementHouse} भाव (${placementSign}) में ${PLANETS_INFO.find(p => p.name === placementPlanet)?.hindi}`
                                : `${placementPlanet} in ${placementHouse}th House (${placementSign})`}
                        </h3>
                        <RichText text={placementAnalysis} />
                    </div>
                )}

                 <div className="mt-8">
                  <AdBanner variant="leaderboard" />
                </div>
            </div>
        )}

        {/* CONJUNCTION LAB TAB */}
        {activeTab === 'conjunctions' && (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <div className="text-center mb-6">
                    <p className="text-slate-300 text-sm mb-4">
                        {language === 'hi' 
                            ? "D1 चार्ट में दो या तीन ग्रहों की संयुक्त ऊर्जा कैसे प्रकट होती है, यह जानने के लिए चयन करें।" 
                            : "Select two or three planets, a sign, and a house to discover how their combined energy manifests in the D1 Chart."}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "ग्रह 1" : "Planet 1"}</label>
                        <select 
                            value={p1} 
                            onChange={(e) => setP1(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "ग्रह 2" : "Planet 2"}</label>
                        <select 
                            value={p2} 
                            onChange={(e) => setP2(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "ग्रह 3 (वैकल्पिक)" : "Planet 3 (Optional)"}</label>
                        <select 
                            value={p3} 
                            onChange={(e) => setP3(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                             <option value="">{t.none || "None"}</option>
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{language === 'hi' ? p.hindi : p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "राशि" : "Sign"}</label>
                        <select 
                            value={conjunctionSign} 
                            onChange={(e) => setConjunctionSign(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {ZODIAC_SIGNS.map(z => (
                                <option key={z.name} value={z.name}>{language === 'hi' ? z.hindiName : z.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs text-amber-500 font-bold uppercase">{language === 'hi' ? "भाव" : "House"}</label>
                        <select 
                            value={house} 
                            onChange={(e) => setHouse(Number(e.target.value))}
                            className="w-full bg-slate-900 border border-slate-600 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                        >
                            {Array.from({length: 12}, (_, i) => i + 1).map(h => (
                                <option key={h} value={h}>{h} {language === 'hi' ? "भाव" : "House"}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold py-3 rounded-xl shadow-lg transition-all"
                >
                    {loading 
                        ? (language === 'hi' ? "विश्लेषण हो रहा है..." : "Reading the Stars...") 
                        : (language === 'hi' ? "युति विश्लेषण" : "Analyze Conjunction")}
                </button>

                {analysis && (
                    <div className="mt-8 bg-slate-900/80 border border-amber-500/30 p-6 rounded-xl animate-fade-in-up">
                        <h3 className="text-lg font-serif text-amber-100 mb-3 border-b border-slate-700 pb-2">
                             {language === 'hi' ? "विश्लेषण परिणाम" : "Analysis Result"}
                        </h3>
                        <RichText text={analysis} />
                    </div>
                )}
                
                <div className="mt-8">
                  <AdBanner variant="leaderboard" />
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default LearningCenter;