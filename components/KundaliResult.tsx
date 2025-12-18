
import React, { useState } from 'react';
import { KundaliResponse, Language } from '../types';
import { useTranslation } from '../utils/translations';
import { translatePlanet, translateSign } from '../constants';
import AdBanner from './AdBanner';
import RichText from './RichText';
import SouthIndianChart from './SouthIndianChart';
import NorthIndianChart from './NorthIndianChart';

interface KundaliResultProps {
  data: KundaliResponse;
  name: string;
  language: Language;
  onBack: () => void;
  onSave?: () => void;
}

const KundaliResult: React.FC<KundaliResultProps> = ({ data, name, language, onBack, onSave }) => {
  const t = useTranslation(language);
  const [activeChart, setActiveChart] = useState<'d1' | 'd9'>('d1'); 
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pb-12 animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <button 
          onClick={onBack}
          className="flex items-center text-amber-400 hover:text-amber-200 transition-colors text-sm font-bold tracking-wide uppercase"
        >
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {t.newKundali}
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
          <h2 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 mb-2">
            {t.janamKundali}
          </h2>
          <p className="text-amber-500/80 font-mono tracking-widest text-xs uppercase">{t.vedicHoroscopeFor} {name}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <div className="flex gap-4 mb-4">
                <button 
                  onClick={() => setActiveChart('d1')}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeChart === 'd1' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                   {t.janamKundali} (D1)
                </button>
                <button 
                    onClick={() => setActiveChart('d9')}
                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${activeChart === 'd9' ? 'bg-amber-500 text-slate-900' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                    {t.navamshaChart} (D9)
                </button>
            </div>
            
            <div className="flex gap-2 mb-4 bg-slate-800 rounded-lg p-1">
                <button 
                onClick={() => setChartStyle('north')}
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors ${chartStyle === 'north' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                North
                </button>
                <button 
                    onClick={() => setChartStyle('south')}
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors ${chartStyle === 'south' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    South
                </button>
            </div>

            <div className="w-full max-w-[450px] mx-auto p-2 animate-fade-in flex justify-center">
                 {activeChart === 'd1' ? (
                    chartStyle === 'north' ? (
                        <NorthIndianChart 
                            planets={data.charts?.planetaryPositions || []} 
                            ascendantSignId={data.basicDetails?.ascendantSignId || 1} 
                            language={language} 
                        />
                    ) : (
                        <SouthIndianChart 
                            planets={data.charts?.planetaryPositions || []} 
                            ascendantSignId={data.basicDetails?.ascendantSignId || 1} 
                            language={language} 
                        />
                    )
                 ) : (
                    chartStyle === 'north' ? (
                        <NorthIndianChart 
                            planets={data.charts?.navamshaPositions || []} 
                            ascendantSignId={data.charts?.navamshaAscendantSignId || 1} 
                            language={language} 
                        />
                    ) : (
                        <SouthIndianChart 
                            planets={data.charts?.navamshaPositions || []} 
                            ascendantSignId={data.charts?.navamshaAscendantSignId || 1} 
                            language={language} 
                        />
                    )
                 )}
            </div>
          </div>

          <div className="space-y-6">
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
               <h3 className="text-amber-400 font-serif mb-4 text-lg border-b border-slate-700 pb-2">Kundali Details</h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.lagna}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails?.ascendant || "Aries", language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.rashi}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails?.moonSign || "Aries", language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.sunSign}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails?.sunSign || "Aries", language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.nakshatra}</span>
                   <span className="text-slate-200 font-medium">{data.basicDetails?.nakshatra || "..."}</span>
                 </div>
               </div>
             </div>

             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
                <h3 className="text-amber-400 font-serif mb-4 text-lg border-b border-slate-700 pb-2">{t.vimshottariDasha}</h3>
                <div className="flex justify-between items-center">
                   <div>
                     <span className="text-xs text-slate-500 uppercase block">{t.currentMahadasha}</span>
                     <span className="text-xl text-amber-100 font-serif">{translatePlanet(data.dasha?.currentMahadasha || "Sun", language)}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-xs text-slate-500 uppercase block">{t.antardasha}</span>
                     <span className="text-lg text-slate-200">{translatePlanet(data.dasha?.antardasha || "Sun", language)}</span>
                   </div>
                </div>
             </div>
          </div>
        </div>

        {data.planetAnalysis && data.planetAnalysis.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-amber-400 font-serif mb-6 text-xl">Planetary Analysis</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(data.planetAnalysis || []).map((item, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4">
                            <h4 className="font-serif text-lg text-amber-100">{item.planet}</h4>
                            <RichText text={item.analysis} className="text-sm text-slate-300" />
                        </div>
                    ))}
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default KundaliResult;
