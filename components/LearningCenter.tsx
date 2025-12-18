
import React, { useState } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { PLANETS_INFO, HOUSES_INFO, ZODIAC_SIGNS, NAKSHATRAS_INFO } from '../constants';
import { generateConjunctionAnalysis, askRishiWithFallback } from '../services/geminiService';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface LearningCenterProps {
  language: Language;
}

type Category = 'vedic' | 'nakshatra' | 'palmistry' | 'numerology' | 'esoteric' | 'lab';

const LearningCenter: React.FC<LearningCenterProps> = ({ language }) => {
  const t = useTranslation(language);
  const [activeTab, setActiveTab] = useState<Category>('vedic');
  
  // Foundations state
  const [view, setView] = useState<'planets' | 'houses'>('planets');
  
  // Interactive states
  const [selectedNakshatra, setSelectedNakshatra] = useState<any>(NAKSHATRAS_INFO[0]);
  const [p1, setP1] = useState(PLANETS_INFO[0].name);
  const [p2, setP2] = useState(PLANETS_INFO[1].name);
  const [house, setHouse] = useState(1);
  const [conjunctionSign, setConjunctionSign] = useState(ZODIAC_SIGNS[0].name);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // AI Scholar state
  const [scholarQuery, setScholarQuery] = useState("");
  const [scholarAnswer, setScholarAnswer] = useState<string | null>(null);
  const [scholarLoading, setScholarLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
        const result = await generateConjunctionAnalysis([p1, p2], house, conjunctionSign, language);
        setAnalysis(result);
    } catch (e) {
        setAnalysis("The celestial archives are obscured. Try again.");
    } finally {
        setLoading(false);
    }
  };

  const handleAskScholar = async () => {
    if (!scholarQuery.trim()) return;
    setScholarLoading(true);
    setScholarAnswer(null);
    try {
        const result = await askRishiWithFallback(`As a professor of occult sciences, explain this in detail: ${scholarQuery}`, language);
        setScholarAnswer(result.text);
    } catch (e) {
        setScholarAnswer("The Great Librarian is realigning the scrolls. Please retry.");
    } finally {
        setScholarLoading(false);
    }
  };

  const TabButton = ({ id, label, icon }: { id: Category, label: string, icon: string }) => (
    <button
      onClick={() => { setActiveTab(id); setScholarAnswer(null); }}
      className={`flex flex-col items-center gap-2 px-4 py-4 rounded-[2rem] font-serif text-[10px] transition-all duration-500 border uppercase tracking-tighter ${
        activeTab === id 
          ? 'bg-amber-600 border-amber-400 text-white shadow-2xl scale-110' 
          : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'
      }`}
    >
      <span className="text-2xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="text-center mb-16">
        <span className="text-[10px] uppercase font-bold tracking-[1em] text-amber-500 mb-2 block">Vishwa Vidya</span>
        <h2 className="text-5xl md:text-7xl font-serif text-amber-100 drop-shadow-lg">Cosmic Academy</h2>
        <p className="text-slate-500 text-sm italic tracking-[0.2em] mt-4 uppercase">Mastering the Science of the Unseen</p>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-16">
        <TabButton id="vedic" label="Vedic" icon="🧭" />
        <TabButton id="nakshatra" label="Stars" icon="✨" />
        <TabButton id="palmistry" label="Palmistry" icon="✋" />
        <TabButton id="numerology" label="Numbers" icon="🔢" />
        <TabButton id="esoteric" label="Esoteric" icon="🔮" />
        <TabButton id="lab" label="Yoga Lab" icon="🧪" />
      </div>

      <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[4rem] p-6 md:p-16 min-h-[700px] shadow-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* --- VEDIC FOUNDATIONS --- */}
        {activeTab === 'vedic' && (
            <div className="animate-fade-in space-y-12">
                <div className="flex justify-center gap-4 mb-12">
                    <button onClick={() => setView('planets')} className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${view === 'planets' ? 'bg-amber-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}>The 9 Navagrahas</button>
                    <button onClick={() => setView('houses')} className={`px-10 py-3 rounded-full text-xs font-bold transition-all ${view === 'houses' ? 'bg-amber-600 text-white' : 'bg-slate-950 border border-slate-800 text-slate-500'}`}>The 12 Bhavas</button>
                </div>

                {view === 'planets' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {PLANETS_INFO.map((p) => (
                            <div key={p.name} className="bg-slate-950/60 p-8 rounded-[2.5rem] border border-slate-800 group hover:border-amber-500/40 transition-all">
                                <div className={`w-16 h-16 rounded-3xl bg-slate-900 flex items-center justify-center text-2xl mb-6 shadow-inner border border-slate-800 ${p.color}`}>●</div>
                                <h4 className={`text-2xl font-serif font-bold ${p.color} mb-3`}>{language === 'hi' ? p.hindi : p.name}</h4>
                                <p className="text-slate-400 text-sm leading-relaxed">{language === 'hi' ? p.descriptionHi : p.description}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HOUSES_INFO.map((h) => (
                            <div key={h.id} className="bg-slate-950/40 p-8 rounded-3xl border border-slate-800 hover:bg-slate-950 transition-all group">
                                <div className="text-5xl font-bold text-slate-800 mb-6 group-hover:text-amber-500/20 transition-colors">{h.id}</div>
                                <h5 className="text-amber-100 font-serif text-lg mb-2">{language === 'hi' ? h.nameHi : h.name}</h5>
                                <p className="text-slate-500 text-xs leading-relaxed">{language === 'hi' ? h.descHi : h.desc}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* --- NAKSHATRA LIBRARY --- */}
        {activeTab === 'nakshatra' && (
            <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-12 gap-12">
                <div className="lg:col-span-4 space-y-6">
                    <h3 className="text-3xl font-serif text-amber-200">Star Library</h3>
                    <p className="text-slate-500 text-sm italic">The 27 Lunar Mansions of the Zodiac</p>
                    <div className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-auto pr-3 custom-scrollbar">
                        {NAKSHATRAS_INFO.map(n => (
                            <button 
                                key={n.name} 
                                onClick={() => setSelectedNakshatra(n)}
                                className={`p-3 text-[10px] font-bold rounded-xl border transition-all ${selectedNakshatra?.name === n.name ? 'bg-amber-600 border-amber-400 text-white shadow-lg' : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white'}`}
                            >
                                {n.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="lg:col-span-8 bg-slate-950/60 p-12 rounded-[3rem] border border-slate-800 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10"></div>
                    <div className="relative z-10 animate-fade-in-up">
                        <span className="text-7xl mb-8 block drop-shadow-[0_0_20px_rgba(245,158,11,0.4)]">✨</span>
                        <h4 className="text-5xl font-serif text-amber-400 mb-6">{selectedNakshatra.name}</h4>
                        <div className="flex justify-center gap-12 mb-10">
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Ruler Planet</p>
                                <p className="text-xl text-white font-serif">{selectedNakshatra.ruler}</p>
                            </div>
                            <div className="w-px h-12 bg-slate-800"></div>
                            <div className="text-center">
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Nature/Trait</p>
                                <p className="text-xl text-white font-serif">{selectedNakshatra.trait}</p>
                            </div>
                        </div>
                        <div className="p-10 bg-slate-900/50 rounded-[2.5rem] text-slate-300 text-lg leading-relaxed max-w-xl border border-slate-800 shadow-inner">
                            Those born under <strong>{selectedNakshatra.name}</strong> Nakshatra are gifted with the cosmic power of <em>{selectedNakshatra.trait}</em>. Under the guidance of <strong>{selectedNakshatra.ruler}</strong>, they evolve into masters of their chosen path.
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ADVANCED PALMISTRY --- */}
        {activeTab === 'palmistry' && (
            <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-slate-800 shadow-xl">
                    <h3 className="text-3xl font-serif text-rose-300 mb-10 flex items-center gap-4">
                        <span className="p-3 bg-rose-900/20 rounded-2xl border border-rose-500/20 text-3xl">✋</span> 
                        The Big Four Lines
                    </h3>
                    <div className="space-y-10">
                        {[
                            { name: 'Heart Line', icon: '❤️', body: 'Emotional maturity and relationship style. A line with many branches suggests a rich social life; a deep single line indicates profound focus on one partner.' },
                            { name: 'Head Line', icon: '🧠', body: 'Psychological power and intellectual stamina. A line reaching the "Moon mount" suggests intense imagination and intuition.' },
                            { name: 'Life Line', icon: '🌱', body: 'Physical vitality and major lifestyle shifts. A break in the line often signifies a change of city, career, or fundamental belief system.' },
                            { name: 'Fate Line', icon: '⚓', body: 'The career path. A line starting from the wrist indicates a self-made path; starting from the middle suggests help from family or society.' }
                        ].map(l => (
                            <div key={l.name} className="flex gap-6 group">
                                <span className="text-3xl group-hover:scale-125 transition-transform duration-500">{l.icon}</span>
                                <div>
                                    <h4 className="text-white font-bold text-sm uppercase tracking-[0.2em] mb-2">{l.name}</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed">{l.body}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-slate-800 shadow-xl">
                        <h3 className="text-2xl font-serif text-amber-200 mb-8">The Mounts (Planetary)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { name: 'Jupiter', loc: 'Index', trait: 'Leadership & Ambition' },
                                { name: 'Saturn', loc: 'Middle', trait: 'Discipline & Karma' },
                                { name: 'Sun', loc: 'Ring', trait: 'Fame & Artistry' },
                                { name: 'Mercury', loc: 'Pinky', trait: 'Commerce & Speech' }
                            ].map(m => (
                                <div key={m.name} className="p-6 bg-slate-900/50 rounded-3xl border border-slate-800 group hover:border-amber-500/30 transition-all">
                                    <h5 className="text-amber-400 text-xs font-bold uppercase tracking-widest mb-1">{m.name}</h5>
                                    <p className="text-slate-400 text-[10px] mb-2">Finger: {m.loc}</p>
                                    <p className="text-white text-xs font-serif leading-snug">{m.trait}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="bg-slate-950/60 p-8 rounded-[2.5rem] border border-slate-800">
                        <h4 className="text-indigo-300 font-serif text-sm mb-4 uppercase tracking-[0.3em]">Special Markings</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-500"><strong>The Mystic Cross:</strong> Found between Head & Heart lines. Indicates intense interest in astrology and spirits.</div>
                            <div className="p-4 bg-slate-900 rounded-xl text-xs text-slate-500"><strong>The Fish Mark:</strong> Found at the base of life line. Signifies great wealth and spiritual growth in old age.</div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- NUMEROLOGY SECRETS --- */}
        {activeTab === 'numerology' && (
            <div className="animate-fade-in space-y-12">
                <div className="grid grid-cols-3 sm:grid-cols-9 gap-4">
                    {[
                        { n: 1, p: 'Sun', t: 'The Original' }, { n: 2, p: 'Moon', t: 'The Mirror' }, { n: 3, p: 'Jupiter', t: 'The Artist' },
                        { n: 4, p: 'Rahu', t: 'The Rebel' }, { n: 5, p: 'Mercury', t: 'The Traveler' }, { n: 6, p: 'Venus', t: 'The Lover' },
                        { n: 7, p: 'Ketu', t: 'The Mystic' }, { n: 8, p: 'Saturn', t: 'The Judge' }, { n: 9, p: 'Mars', t: 'The Finisher' }
                    ].map(x => (
                        <div key={x.n} className="bg-slate-950 border border-slate-800 p-6 rounded-[2rem] text-center hover:border-teal-500 hover:shadow-[0_0_30px_rgba(20,184,166,0.1)] transition-all group">
                            <div className="text-4xl font-bold text-white mb-2 group-hover:scale-125 transition-transform">{x.n}</div>
                            <div className="text-[9px] text-teal-400 font-bold uppercase mb-2 tracking-tighter">{x.p}</div>
                            <div className="text-[10px] text-slate-600 italic leading-tight">{x.t}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-7 bg-teal-900/10 border border-teal-500/20 p-12 rounded-[3.5rem] shadow-xl">
                        <h4 className="text-teal-200 font-serif text-3xl mb-8 flex items-center gap-4">
                            <span className="text-4xl">🔱</span> Master Numbers
                        </h4>
                        <div className="space-y-8">
                            <div className="p-6 bg-slate-950/40 rounded-3xl border border-slate-800">
                                <h5 className="text-white font-bold text-lg mb-2">11: The Visionary Messenger</h5>
                                <p className="text-slate-400 text-sm leading-relaxed">The high-frequency channel. People with an 11 Life Path are here to bridge the gap between spiritual truth and physical reality.</p>
                            </div>
                            <div className="p-6 bg-slate-950/40 rounded-3xl border border-slate-800">
                                <h5 className="text-white font-bold text-lg mb-2">22: The Master Builder</h5>
                                <p className="text-slate-400 text-sm leading-relaxed">The most powerful number in existence. Capable of turning grand abstract dreams into massive physical systems (cities, corporations, philosophies).</p>
                            </div>
                            <div className="p-6 bg-slate-950/40 rounded-3xl border border-slate-800">
                                <h5 className="text-white font-bold text-lg mb-2">33: The Master Teacher</h5>
                                <p className="text-slate-400 text-sm leading-relaxed">The Avatar frequency. Represents selfless devotion and the spiritual upliftment of humanity through unconditional love.</p>
                            </div>
                        </div>
                    </div>
                    <div className="lg:col-span-5 space-y-6">
                        <div className="bg-slate-950/60 p-10 rounded-[3rem] border border-slate-800 h-full flex flex-col justify-center">
                            <h4 className="text-white font-serif text-2xl mb-6">Calculation Engine</h4>
                            <p className="text-slate-500 text-sm leading-relaxed mb-8 italic">Vedic Numerology uses the "Chaldean" system, prioritizing the vibration of sounds over the order of the alphabet.</p>
                            <ul className="space-y-4 text-xs text-slate-400">
                                <li className="flex gap-4"><strong>Birth Num:</strong> Inherent talent.</li>
                                <li className="flex gap-4"><strong>Path Num:</strong> Worldly mission.</li>
                                <li className="flex gap-4"><strong>Soul Num:</strong> Inner desire.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* --- ESOTERIC ARTS --- */}
        {activeTab === 'esoteric' && (
            <div className="animate-fade-in space-y-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        { title: 'The 7 Chakras', icon: '🌀', body: 'Energy hubs that spin along your spine. From Muladhara to Sahasrara, they govern every organ and thought pattern.' },
                        { title: 'The Human Aura', icon: '🌈', body: 'A multilayered bio-field. The "Causal" layer holds your past-life memories, while the "Etheric" holds physical health.' },
                        { title: 'Sacred Yantras', icon: '☸', body: 'Geometrical circuit diagrams. A Sri Yantra is the visual equivalent of the sound of "Om".' },
                        { title: 'Pancha Tattva', icon: '🔥', body: 'Ether, Air, Fire, Water, Earth. Every planet and sign belongs to one of these elemental frequencies.' },
                        { title: 'Crystal Resonance', icon: '💎', body: 'Stones are frozen light. Amethyst helps the Crown Chakra, while Citrine activates the Solar Plexus (Wealth).' },
                        { title: 'Merkaba Science', icon: '✡', body: 'The light body of human consciousness. A rotating geometry used for astral travel and ascension.' }
                    ].map((item, i) => (
                        <div key={i} className="bg-slate-950/60 p-10 rounded-[3rem] border border-slate-800 hover:border-indigo-500/30 transition-all flex flex-col items-center text-center group">
                            <div className="text-5xl mb-6 group-hover:animate-pulse">{item.icon}</div>
                            <h4 className="text-white font-serif text-xl mb-4 tracking-wider">{item.title}</h4>
                            <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
                        </div>
                    ))}
                </div>

                <div className="bg-slate-950/90 border border-purple-500/20 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
                     <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[80px]"></div>
                     <h3 className="text-3xl font-serif text-purple-200 mb-8 text-center">AI Scholar Consultation</h3>
                     <div className="relative group max-w-3xl mx-auto">
                        <input 
                            type="text" 
                            value={scholarQuery}
                            onChange={(e) => setScholarQuery(e.target.value)}
                            placeholder="e.g. Compare the effects of Shani and Rahu on the 10th house..."
                            className="w-full bg-slate-900 border-2 border-slate-800 rounded-[2rem] px-10 py-6 text-slate-200 outline-none focus:border-purple-500 transition-all pr-40 text-lg shadow-inner"
                        />
                        <button 
                            onClick={handleAskScholar}
                            disabled={scholarLoading || !scholarQuery.trim()}
                            className="absolute right-3 top-3 bottom-3 px-8 bg-purple-600 rounded-[1.5rem] text-white font-bold hover:bg-purple-500 transition-all disabled:opacity-50"
                        >
                            {scholarLoading ? "Consulting..." : "Retrieve Insight"}
                        </button>
                     </div>
                     {scholarAnswer && (
                        <div className="mt-12 animate-fade-in-up bg-slate-900/50 p-10 rounded-[3rem] border border-purple-500/10 shadow-inner">
                            <RichText text={scholarAnswer} />
                        </div>
                     )}
                </div>
            </div>
        )}

        {/* --- YOGA LABORATORY --- */}
        {activeTab === 'lab' && (
            <div className="animate-fade-in max-w-5xl mx-auto">
                <div className="text-center mb-12">
                    <h3 className="text-4xl font-serif text-amber-200">The Yoga Lab</h3>
                    <p className="text-slate-500 text-sm mt-4 italic">A 'Yoga' is a conjunction. Experiment to see how energies synthesize.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                    <div className="space-y-2">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">Celestial Body A</label>
                        <select value={p1} onChange={(e) => setP1(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500">
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">Celestial Body B</label>
                        <select value={p2} onChange={(e) => setP2(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500">
                            {PLANETS_INFO.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">Bhava (House)</label>
                        <select value={house} onChange={(e) => setHouse(Number(e.target.value))} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500">
                            {HOUSES_INFO.map(h => <option key={h.id} value={h.id}>House {h.id} ({h.name})</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] text-amber-500 font-bold uppercase tracking-widest ml-4">Rashi (Environment)</label>
                        <select value={conjunctionSign} onChange={(e) => setConjunctionSign(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-3xl p-5 text-sm text-white outline-none focus:border-amber-500">
                            {ZODIAC_SIGNS.map(z => <option key={z.name} value={z.name}>{z.name}</option>)}
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white font-serif font-bold py-6 rounded-[2rem] shadow-2xl transition-all active:scale-95 disabled:opacity-50 text-xl"
                >
                    {loading ? "Synthesizing Alchemical Data..." : "Reveal Yoga Impact"}
                </button>

                {analysis && (
                    <div className="mt-12 bg-slate-950/80 border border-amber-500/20 p-12 rounded-[3.5rem] shadow-3xl animate-fade-in-up">
                        <RichText text={analysis} />
                    </div>
                )}
            </div>
        )}
      </div>
      
      <AdBanner variant="leaderboard" className="mt-20" />
    </div>
  );
};

export default LearningCenter;
