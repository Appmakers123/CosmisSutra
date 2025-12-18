
import React, { useState } from 'react';
import { Language } from '../types';
import { generateRudrakshAdvice } from '../services/geminiService';
import { useTranslation } from '../utils/translations';
import RichText from './RichText';

const MUKHIS = [
    { num: "1", planet: "Sun", benefit: "Spiritual realization, leadership and ultimate consciousness.", beej: "Om Hreem Namah" },
    { num: "2", planet: "Moon", benefit: "Unity, emotional balance, and better relationships.", beej: "Om Namah" },
    { num: "3", planet: "Mars", benefit: "Removes past life sins, boosts confidence and self-esteem.", beej: "Om Kleem Namah" },
    { num: "4", planet: "Mercury", benefit: "Intelligence, communication skills, and creative wisdom.", beej: "Om Hreem Namah" },
    { num: "5", planet: "Jupiter", benefit: "General health, peace of mind, and academic excellence.", beej: "Om Hreem Namah" },
    { num: "6", planet: "Venus", benefit: "Success in business, creative power, and focus.", beej: "Om Hreem Hum Namah" },
    { num: "7", planet: "Saturn", benefit: "Attracts wealth, removes financial misery and bad luck.", beej: "Om Hum Namah" },
    { num: "8", planet: "Rahu", benefit: "Removes obstacles, victory in legal battles, and health.", beej: "Om Hum Namah" },
    { num: "9", planet: "Ketu", benefit: "Courage, removes fear of death, and brings spiritual power.", beej: "Om Hreem Hum Namah" },
    { num: "10", planet: "Vishnu", benefit: "Protection from black magic, evil eye, and planetary debt.", beej: "Om Hreem Namah Namah" },
    { num: "11", planet: "Hanuman", benefit: "Strong judgment, physical strength, and successful travel.", beej: "Om Hreem Hum Namah" },
    { num: "12", planet: "Sun", benefit: "Radiance, vitality, and high-level administrative power.", beej: "Om Kraum Sraum Raum Namah" },
    { num: "13", planet: "Kamdev", benefit: "Magnetism, charisma, and fulfilling worldly desires.", beej: "Om Hreem Namah" },
    { num: "14", planet: "Saturn", benefit: "Intuition, Third Eye opening, and victory over destiny.", beej: "Om Namah" },
    { num: "GS", planet: "Shiva-Parvati", benefit: "Gauri Shankar: Perfect for marriage and household harmony.", beej: "Om Gauri Shankaraye Namah" },
    { num: "G", planet: "Ganesh", benefit: "Ganesh: Success in all exams and removing career hurdles.", beej: "Om Gam Ganapataye Namah" }
];

const RudrakshLab: React.FC<{ language: Language }> = ({ language }) => {
  const t = useTranslation(language);
  const [activeMukhi, setActiveMukhi] = useState(MUKHIS[0]);
  const [problem, setProblem] = useState("");
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleConsult = async () => {
    if (!problem.trim()) return;
    setLoading(true);
    try {
        const result = await generateRudrakshAdvice(problem, language);
        setAdvice(result);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-fade-in-up pb-12">
      <div className="bg-slate-800/80 border border-orange-500/30 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 p-10 opacity-5 text-9xl">📿</div>
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-serif text-orange-200 mb-2">{t.rudrakshAlchemist}</h2>
          <p className="text-slate-400 text-sm italic">{t.shivaTears}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h3 className="text-lg font-serif text-amber-200 border-b border-slate-700 pb-2">{t.mukhiLibrary}</h3>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {MUKHIS.map(m => (
                        <button 
                            key={m.num} 
                            onClick={() => { setActiveMukhi(m); setAdvice(null); }}
                            className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center transition-all ${activeMukhi.num === m.num ? 'bg-orange-600 border-orange-400 text-white shadow-[0_0_15px_rgba(234,88,12,0.4)]' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-orange-500/50'}`}
                        >
                            <span className="text-xs font-bold leading-none">{m.num}</span>
                            <span className="text-[6px] uppercase tracking-tighter mt-0.5">{language === 'hi' ? 'मुखी' : 'Mukhi'}</span>
                        </button>
                    ))}
                </div>
                <div className="bg-slate-900/60 p-6 rounded-2xl border border-slate-700 animate-fade-in min-h-[220px] flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-2">
                            <h4 className="text-orange-400 font-serif text-xl">{activeMukhi.num === 'GS' ? 'Gauri Shankar' : activeMukhi.num === 'G' ? 'Ganesh' : activeMukhi.num + ' Mukhi'} Rudraksh</h4>
                            <span className="text-[9px] bg-orange-900/40 text-orange-200 px-2 py-1 rounded-full border border-orange-500/20 uppercase tracking-widest font-bold">{language === 'hi' ? 'ग्रह' : 'Planet'}: {activeMukhi.planet}</span>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4 italic">"{activeMukhi.benefit}"</p>
                    </div>
                    <div className="p-3 bg-slate-800/80 rounded-xl text-xs font-mono text-orange-200 text-center border border-slate-700">
                        <span className="text-slate-500 block text-[8px] uppercase tracking-widest mb-1 font-sans">{language === 'hi' ? 'पावर मंत्र' : 'Power Mantra'}</span>
                        {activeMukhi.beej}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-serif text-amber-200 border-b border-slate-700 pb-2">{t.vedicConsultation}</h3>
                <div className="space-y-4">
                    <p className="text-slate-400 text-xs leading-relaxed font-light">{language === 'hi' ? 'प्राचीन ग्रंथों के आधार पर सिफारिश के लिए अपनी चुनौतियों का वर्णन करें।' : 'Describe your life challenges for an AI-guided recommendation from the ancient texts.'}</p>
                    <textarea 
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        placeholder={language === 'hi' ? "उदाहरण: मैं काम पर बहुत तनाव महसूस कर रहा हूँ और आर्थिक भाग्य में सुधार चाहता हूँ..." : "e.g. I am facing high stress at work and want to improve my financial luck..."}
                        className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-2xl p-4 text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder-slate-600"
                    />
                    <button 
                        onClick={handleConsult}
                        disabled={loading || !problem.trim()}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-800 hover:from-orange-500 hover:to-orange-700 text-white font-serif font-bold rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                {language === 'hi' ? 'पुस्तकालय से परामर्श किया जा रहा है...' : 'Consulting Library...'}
                            </>
                        ) : t.seekRemedy}
                    </button>
                </div>
            </div>
        </div>

        {advice && (
            <div className="mt-12 bg-slate-900/90 p-8 rounded-[2.5rem] border border-orange-500/20 shadow-inner animate-fade-in-up">
                <h3 className="text-xl font-serif text-orange-200 mb-6 flex items-center gap-3">
                    <span className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-900/30 text-lg">✨</span>
                    {t.remedyAlignment}
                </h3>
                <RichText text={advice} className="text-slate-300 leading-relaxed font-light" />
            </div>
        )}
      </div>
    </div>
  );
};

export default RudrakshLab;
