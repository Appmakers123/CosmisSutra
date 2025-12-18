
import React, { useState, useRef, useEffect } from 'react';
import { Language } from '../types';
import { useTranslation } from '../utils/translations';
import { generateMantraAudio } from '../services/geminiService';

interface Mantra {
  id: string;
  name: string;
  nameHi: string;
  sanskrit: string;
  transliteration: string;
  meaning: string;
  meaningHi: string;
  benefit: string;
  benefitHi: string;
  category: "Obstacles" | "Planetary" | "Wealth" | "Health" | "Universal";
  color: string;
  bgGlow: string;
}

const MANTRA_LIBRARY: Mantra[] = [
    {
        id: "ganesh-mool",
        name: "Ganesh Mool",
        nameHi: "गणेश मूल मंत्र",
        category: "Obstacles",
        sanskrit: "ॐ गम गणपतये नमः",
        transliteration: "Om Gam Ganapataye Namaha",
        meaning: "Salutations to the Remover of Obstacles.",
        meaningHi: "विघ्नहर्ता को नमस्कार।",
        benefit: "Removes all mental and physical hurdles.",
        benefitHi: "सभी मानसिक और शारीरिक बाधाओं को दूर करता है।",
        color: "text-orange-400",
        bgGlow: "from-orange-600/20"
    },
    {
        id: "sun-beej",
        name: "Surya Beej",
        nameHi: "सूर्य बीज मंत्र",
        category: "Planetary",
        sanskrit: "ॐ ह्रां ह्रीं ह्रौं सः सूर्याय नमः",
        transliteration: "Om Hram Hreem Hroum Sah Suryaya Namaha",
        meaning: "Seed sound of the Sun Deity.",
        meaningHi: "सूर्य देव की बीज ध्वनि।",
        benefit: "For health, vitality, and soul-power.",
        benefitHi: "स्वास्थ्य, जीवन शक्ति और आत्म-शक्ति के लिए।",
        color: "text-yellow-400",
        bgGlow: "from-yellow-600/20"
    },
    {
        id: "lakshmi-shreem",
        name: "Lakshmi Beej",
        nameHi: "लक्ष्मी बीज मंत्र",
        category: "Wealth",
        sanskrit: "ॐ श्रीं महालक्ष्म्यै नमः",
        transliteration: "Om Shreem Mahalakshmaye Namaha",
        meaning: "Salutations to the Goddess of Abundance.",
        meaningHi: "प्रचुरता की देवी को नमस्कार।",
        benefit: "Attracts prosperity and comfort.",
        benefitHi: "समृद्धि और सुख को आकर्षित करता है।",
        color: "text-pink-500",
        bgGlow: "from-pink-600/20"
    },
    {
        id: "mrit-full",
        name: "Maha Mrityunjaya",
        nameHi: "महा मृत्युंजय मंत्र",
        category: "Health",
        sanskrit: "ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् । उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय माऽमृतात् ॥",
        transliteration: "Om Tryambakam Yajamahe Sugandhim Pushti-Vardhanam...",
        meaning: "We worship the Three-Eyed Lord who nourishes all.",
        meaningHi: "हम तीन आंखों वाले भगवान की पूजा करते हैं जो सभी का पोषण करते हैं।",
        benefit: "Ultimate healing and fearlessness.",
        benefitHi: "परम उपचार और निर्भयता।",
        color: "text-emerald-500",
        bgGlow: "from-emerald-600/20"
    },
    {
        id: "gayatri",
        name: "Gayatri Mantra",
        nameHi: "गायत्री मंत्र",
        category: "Universal",
        sanskrit: "ॐ भूर् भुवः स्वः तत्सवितुर्वरेण्यं भर्गो देवस्य धीमहि धियो यो नः प्रचोदयात् ॥",
        transliteration: "Om Bhur Bhuvah Svah Tat-Savitur-Varenyam...",
        meaning: "We meditate on the glory of the divine Creator.",
        meaningHi: "हम दिव्य निर्माता की महिमा पर ध्यान करते हैं।",
        benefit: "For wisdom and spiritual enlightenment.",
        benefitHi: "ज्ञान और आध्यात्मिक ज्ञान के लिए।",
        color: "text-amber-500",
        bgGlow: "from-amber-600/20"
    }
];

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const CATEGORIES = ["Obstacles", "Planetary", "Wealth", "Health", "Universal"] as const;

const MantraLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [activeCategory, setActiveCategory] = useState<typeof CATEGORIES[number]>("Obstacles");
  const [selected, setSelected] = useState<Mantra>(MANTRA_LIBRARY[0]);
  const [count, setCount] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioCacheRef = useRef<Map<string, AudioBuffer>>(new Map());

  useEffect(() => {
    const firstInCategory = MANTRA_LIBRARY.find(m => m.category === activeCategory);
    if (firstInCategory) {
        setSelected(firstInCategory);
        setCount(0);
        stopAudio();
        setErrorMsg(null);
    }
  }, [activeCategory]);

  const stopAudio = () => {
    if (sourceNodeRef.current) {
        try { sourceNodeRef.current.stop(); } catch(e) {}
        sourceNodeRef.current = null;
    }
    setIsPlaying(false);
  };

  const handleChant = () => {
    if (count < 108) {
        setCount(prev => prev + 1);
        if (navigator.vibrate) navigator.vibrate([15]);
    } else {
        setCount(0);
        if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
    }
  };

  const playMeditation = async () => {
    if (isPlaying) {
        stopAudio();
        return;
    }

    setIsLoadingAudio(true);
    setErrorMsg(null);

    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') await ctx.resume();

        let audioBuffer = audioCacheRef.current.get(selected.id);

        if (!audioBuffer) {
            // Re-fetch and hardened decoding
            const base64 = await generateMantraAudio(selected.sanskrit);
            const pcmData = decode(base64);
            audioBuffer = await decodeAudioData(pcmData, ctx, 24000, 1);
            audioCacheRef.current.set(selected.id, audioBuffer);
        }

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.loop = true;
        source.connect(ctx.destination);
        source.onended = () => setIsPlaying(false);
        
        source.start(0);
        sourceNodeRef.current = source;
        setIsPlaying(true);
    } catch (e: any) {
        console.error("Audio Playback Error:", e);
        if (e.message?.includes('500') || e.message?.includes('INTERNAL')) {
            setErrorMsg(language === 'hi' ? "सर्वर त्रुटि (500)। कृपया पुनः प्रयास करें।" : "Celestial Server Error (500). The oracle is busy, please retry.");
        } else {
            setErrorMsg(language === 'hi' ? "ध्वनि लोड करने में विफल।" : "Resonance failure. Try again.");
        }
    } finally {
        setIsLoadingAudio(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 pb-24 animate-fade-in-up">
      <div className="bg-slate-900/80 backdrop-blur-3xl border border-white/10 rounded-[4rem] p-8 md:p-16 shadow-3xl flex flex-col items-center relative overflow-hidden">
        
        <div className={`absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-br ${selected.bgGlow} via-transparent to-transparent blur-[150px] transition-all duration-1000 opacity-40`}></div>
        <div className={`absolute bottom-0 left-0 w-[500px] h-[500px] bg-gradient-to-tr ${selected.bgGlow} via-transparent to-transparent blur-[120px] transition-all duration-1000 opacity-20`}></div>

        <div className="text-center mb-12 relative z-10">
            <span className="text-[10px] uppercase font-bold tracking-[1.5em] text-orange-400 mb-4 block">{t.dhvaniSanctuary}</span>
            <h2 className="text-5xl md:text-8xl font-serif text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-500 drop-shadow-sm">{t.mantraLabTitle}</h2>
            <p className="text-slate-400 text-xs italic mt-6 tracking-[0.5em] uppercase">{t.mantraSubtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16 relative z-10 w-full">
            {CATEGORIES.map(cat => (
                <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-8 py-4 rounded-[2rem] text-[10px] font-bold uppercase tracking-widest border transition-all duration-700 ${activeCategory === cat ? 'bg-orange-500 text-white border-orange-400 shadow-[0_15px_40px_rgba(249,115,22,0.3)] scale-105' : 'bg-slate-950/40 border-slate-800 text-slate-500 hover:text-white hover:border-slate-600'}`}
                >
                    {language === 'hi' ? (cat === "Obstacles" ? "बाधाएं" : cat === "Planetary" ? "ग्रह" : cat === "Wealth" ? "धन" : cat === "Health" ? "स्वास्थ्य" : "ब्रह्मांड") : cat}
                </button>
            ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 w-full relative z-10">
            
            <div className="lg:col-span-4 space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
                {MANTRA_LIBRARY.filter(m => m.category === activeCategory).map(m => (
                    <button 
                        key={m.id} 
                        onClick={() => { setSelected(m); setCount(0); stopAudio(); setErrorMsg(null); }} 
                        className={`w-full p-10 rounded-[3rem] border transition-all duration-700 text-left relative group overflow-hidden ${selected.id === m.id ? 'bg-white border-white shadow-[0_20px_50px_rgba(255,255,255,0.1)]' : 'bg-slate-950/20 border-white/5 hover:border-white/20'}`}
                    >
                        <div className={`text-2xl font-serif mb-2 transition-colors ${selected.id === m.id ? 'text-slate-950' : 'text-slate-300'}`}>{language === 'hi' ? m.nameHi : m.name}</div>
                        <div className={`text-[10px] uppercase tracking-wider transition-colors ${selected.id === m.id ? 'text-slate-500' : 'text-slate-600'}`}>{m.transliteration.substring(0, 30)}...</div>
                        {selected.id === m.id && <div className="absolute right-6 top-1/2 -translate-y-1/2 text-orange-500/20 text-4xl">🕉️</div>}
                    </button>
                ))}
            </div>

            <div className="lg:col-span-8 flex flex-col md:flex-row gap-12 items-center justify-between">
                
                <div className="flex-1 space-y-10">
                    <div className="space-y-6 text-center md:text-left">
                        <div className="inline-block px-5 py-1.5 bg-orange-900/20 border border-orange-500/20 rounded-full text-[10px] uppercase font-bold text-orange-400 tracking-widest">{language === 'hi' ? 'मंत्र शक्ति' : selected.category + ' Ritual'}</div>
                        <h3 className={`text-5xl md:text-7xl font-serif ${selected.color} drop-shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all`}>{language === 'hi' ? selected.nameHi : selected.name}</h3>
                        
                        <div className="bg-black/40 backdrop-blur-md p-14 rounded-[4.5rem] border border-white/10 relative group shadow-2xl overflow-hidden">
                             <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none"></div>
                             <div className="text-4xl md:text-6xl text-white font-serif leading-relaxed mb-10 tracking-widest text-center drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">{selected.sanskrit}</div>
                             <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-10 w-2/3 mx-auto"></div>
                             <div className="text-xl text-slate-500 italic leading-relaxed text-center font-light tracking-wide">{selected.transliteration}</div>
                        </div>

                        {errorMsg && (
                            <div className="p-5 bg-red-950/20 border border-red-500/20 rounded-3xl text-red-400 text-xs text-center animate-pulse tracking-wide flex flex-col gap-2">
                                <span>{errorMsg}</span>
                                <button onClick={playMeditation} className="text-[10px] uppercase font-bold underline hover:text-white">Retry Call</button>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-colors">
                                <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-[0.3em]">{t.spiritualFocus}</h4>
                                <p className="text-base text-slate-300 leading-relaxed italic">"{language === 'hi' ? selected.meaningHi : selected.meaning}"</p>
                             </div>
                             <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 group hover:border-white/10 transition-colors">
                                <h4 className="text-[10px] text-slate-500 uppercase font-bold mb-3 tracking-[0.3em]">{t.karmicAlchemy}</h4>
                                <p className="text-base text-slate-300 leading-relaxed">{language === 'hi' ? selected.benefitHi : selected.benefit}</p>
                             </div>
                        </div>
                    </div>

                    <button 
                        onClick={playMeditation}
                        disabled={isLoadingAudio}
                        className={`w-full flex items-center justify-center gap-6 px-12 py-8 rounded-[3rem] border-2 transition-all duration-700 font-serif font-bold text-2xl ${isPlaying ? 'bg-orange-600 border-orange-400 text-white shadow-[0_20px_80px_rgba(249,115,22,0.3)]' : 'bg-slate-950 border-white/10 text-white hover:border-white hover:shadow-3xl'} group disabled:opacity-50`}
                    >
                        {isLoadingAudio ? (
                            <><div className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> {language === 'hi' ? 'मंत्र का आह्वान...' : 'INVOKING MANTRA...'}</>
                        ) : isPlaying ? (
                            <><span className="text-3xl animate-pulse">⏸</span> {t.ceaseResonance}</>
                        ) : (
                            <><span className="text-3xl group-hover:scale-125 transition-transform">🔊</span> {t.invokeSacredVoice}</>
                        )}
                    </button>
                </div>

                <div className="flex flex-col items-center gap-14">
                    <div className="relative w-80 h-80 flex items-center justify-center">
                        <div className={`absolute inset-[-20px] rounded-full border border-white/5 transition-all duration-[3000ms] ${isPlaying ? 'rotate-180 scale-110 opacity-100' : 'opacity-0'}`}></div>
                        <div className={`absolute inset-0 rounded-full border border-white/5 ${isPlaying ? 'animate-spin-slow' : ''}`}></div>
                        
                        <svg className="absolute inset-0 w-full h-full -rotate-90">
                            <circle cx="50%" cy="50%" r="48%" className="fill-none stroke-slate-950 stroke-[6]" />
                            <circle 
                                cx="50%" cy="50%" r="48%" 
                                className="fill-none stroke-orange-500 stroke-[6] transition-all duration-700 ease-out"
                                strokeDasharray="301.5"
                                style={{ strokeDashoffset: `${301.5 - (count / 108) * 301.5}` }}
                            />
                        </svg>

                        <button 
                            onClick={handleChant}
                            className="relative z-10 w-64 h-64 bg-slate-950 rounded-full border border-white/10 flex flex-col items-center justify-center hover:scale-105 active:scale-95 transition-all duration-500 shadow-4xl shadow-white/5 group overflow-hidden"
                        >
                            <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-50'}`}></div>
                            
                            {isPlaying && <div className="absolute inset-0 bg-orange-500/5 animate-ping rounded-full pointer-events-none"></div>}

                            <span className="text-7xl mb-6 group-hover:rotate-[25deg] transition-transform duration-1000">📿</span>
                            <div className="flex flex-col items-center relative z-10">
                                <span className="text-7xl font-serif font-bold text-white tracking-tighter">{count}</span>
                                <span className="text-[10px] text-slate-500 uppercase tracking-[0.5em] font-bold mt-3">{t.malaCycle}</span>
                            </div>
                            <span className="absolute bottom-12 text-[8px] text-white/40 font-bold uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-opacity">{t.touchBead}</span>
                        </button>
                    </div>
                    
                    {isPlaying && (
                        <div className="flex items-end gap-2 h-20 px-8 py-4 bg-white/5 rounded-full border border-white/10 backdrop-blur-md">
                            {[...Array(18)].map((_, i) => (
                                <div 
                                    key={i} 
                                    className="w-1.5 bg-gradient-to-t from-orange-400 via-orange-500 to-amber-600 rounded-full animate-bounce" 
                                    style={{ 
                                        height: `${10 + Math.random() * 50}px`, 
                                        animationDuration: `${0.3 + Math.random() * 0.7}s`,
                                        animationDelay: `${i * 0.04}s` 
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="mt-20 pt-10 border-t border-white/5 w-full text-center">
            <p className="text-[10px] text-slate-700 uppercase tracking-[1em] leading-relaxed">
                Celestial Bio-Geometry • Waveform Alchemy
            </p>
        </div>
      </div>
    </div>
  );
};

export default MantraLab;
