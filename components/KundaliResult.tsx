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
  const [activeChart, setActiveChart] = useState<'d1' | 'd9'>('d1'); // Toggle between D1 (Lagna) and D9 (Navamsha)
  const [chartStyle, setChartStyle] = useState<'north' | 'south'>('north');

  // Find max strength to normalize bars
  const maxStrength = data.charts.shadbala && data.charts.shadbala.length > 0 ? Math.max(...data.charts.shadbala.map(s => s.strength)) : 10;

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

        <div className="flex items-center gap-4">
             {/* Save Button */}
             {onSave && (
                <button 
                    onClick={onSave}
                    className="flex items-center gap-2 px-3 py-1 bg-teal-600/30 text-teal-300 border border-teal-500/50 rounded hover:bg-teal-600/50 transition-colors text-xs uppercase font-bold tracking-wider"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    {language === 'hi' ? "सहेजें" : "Save Chart"}
                </button>
             )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-slate-900/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent opacity-60"></div>
          <h2 className="text-3xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-orange-100 to-amber-200 mb-2">
            {t.janamKundali}
          </h2>
          <p className="text-amber-500/80 font-mono tracking-widest text-xs uppercase">{t.vedicHoroscopeFor} {name}</p>
        </div>

        {/* Top Section: Chart & Basic Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Visual Chart Section */}
          <div className="flex flex-col items-center">
            {/* Chart Type Tabs (D1 vs D9) */}
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
            
            {/* Chart Style Toggle */}
            <div className="flex gap-2 mb-4 bg-slate-800 rounded-lg p-1">
                <button 
                  onClick={() => setChartStyle('north')}
                  className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors ${chartStyle === 'north' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                   {t.northIndianChart || "North Indian"}
                </button>
                <button 
                    onClick={() => setChartStyle('south')}
                    className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-colors ${chartStyle === 'south' ? 'bg-slate-600 text-white' : 'text-slate-400 hover:text-white'}`}
                >
                    {t.southIndianChart || "South Indian"}
                </button>
            </div>

            <h3 className="text-amber-200 font-serif mb-4 text-lg">
                {activeChart === 'd1' ? t.janamKundali : t.navamshaChart}
            </h3>
            
            <div className="w-full max-w-[400px] mx-auto p-2 animate-fade-in">
                 {/* Logic based rendering using Components instead of static SVG */}
                 {activeChart === 'd1' ? (
                     chartStyle === 'north' ? (
                        <NorthIndianChart 
                            planets={data.charts.planetaryPositions} 
                            ascendantSignId={data.basicDetails.ascendantSignId} 
                            language={language} 
                        />
                     ) : (
                        <SouthIndianChart 
                            planets={data.charts.planetaryPositions} 
                            ascendantSignId={data.basicDetails.ascendantSignId} 
                            language={language} 
                        />
                     )
                 ) : (
                     chartStyle === 'north' ? (
                        <NorthIndianChart 
                            planets={data.charts.navamshaPositions} 
                            ascendantSignId={data.charts.navamshaAscendantSignId} 
                            language={language} 
                        />
                     ) : (
                        <SouthIndianChart 
                            planets={data.charts.navamshaPositions} 
                            ascendantSignId={data.charts.navamshaAscendantSignId} 
                            language={language} 
                        />
                     )
                 )}
            </div>
            
            <div className="mt-8 w-full">
               <AdBanner variant="box" className="mx-auto" />
            </div>

          </div>

          {/* Details & Dasha */}
          <div className="space-y-6">
             {/* Basic Details (Lagna/Rashi) */}
             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
               <h3 className="text-amber-400 font-serif mb-4 text-lg border-b border-slate-700 pb-2">
                  {language === 'hi' ? "कुंडली विवरण" : "Kundali Details"}
               </h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.lagna}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails.ascendant, language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.rashi}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails.moonSign, language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.sunSign}</span>
                   <span className="text-slate-200 font-medium">{translateSign(data.basicDetails.sunSign, language)}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.nakshatra}</span>
                   <span className="text-slate-200 font-medium">{data.basicDetails.nakshatra}</span>
                 </div>
               </div>
             </div>

            {/* Panchang Details */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
               <h3 className="text-amber-400 font-serif mb-4 text-lg border-b border-slate-700 pb-2">{t.panchangDetails}</h3>
               <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.tithi}</span>
                   <span className="text-slate-200 font-medium">{data.panchang.tithi}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.vara}</span>
                   <span className="text-slate-200 font-medium">{data.panchang.vara}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.nakshatra}</span>
                   <span className="text-slate-200 font-medium">{data.panchang.nakshatra}</span>
                 </div>
                 <div>
                   <span className="text-xs text-slate-500 uppercase block">{t.yoga}</span>
                   <span className="text-slate-200 font-medium">{data.panchang.yoga}</span>
                 </div>
                  <div className="col-span-2">
                   <span className="text-xs text-slate-500 uppercase block">{t.karana}</span>
                   <span className="text-slate-200 font-medium">{data.panchang.karana}</span>
                 </div>
               </div>
             </div>

             <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-slate-600 transition-colors">
                <h3 className="text-amber-400 font-serif mb-4 text-lg border-b border-slate-700 pb-2">{t.vimshottariDasha}</h3>
                <div className="flex justify-between items-center">
                   <div>
                     <span className="text-xs text-slate-500 uppercase block">{t.currentMahadasha}</span>
                     <span className="text-xl text-amber-100 font-serif">{translatePlanet(data.dasha.currentMahadasha, language)}</span>
                   </div>
                   <div className="text-right">
                     <span className="text-xs text-slate-500 uppercase block">{t.antardasha}</span>
                     <span className="text-lg text-slate-200">{translatePlanet(data.dasha.antardasha, language)}</span>
                   </div>
                </div>
                <div className="mt-2 text-xs text-slate-500 text-center bg-slate-900/50 py-1 rounded">
                  {t.endsApprox}: {data.dasha.endsAt}
                </div>
             </div>
          </div>
        </div>

        {/* DETAILED PLANETARY ANALYSIS (New Section) */}
        {data.planetAnalysis && data.planetAnalysis.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6">
                <h3 className="text-amber-400 font-serif mb-6 text-xl flex items-center gap-2">
                    <span className="text-2xl">🪐</span> {language === 'hi' ? "विस्तृत ग्रह विश्लेषण" : "Detailed Planetary Analysis"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {data.planetAnalysis.map((item, idx) => (
                        <div key={idx} className="bg-slate-900/40 border border-slate-700/30 rounded-xl p-4 hover:bg-slate-900/60 transition-colors">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-serif text-lg text-amber-100">{item.planet}</h4>
                                <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 uppercase tracking-wide">
                                    {item.position}
                                </span>
                            </div>
                            <RichText text={item.analysis} className="text-sm text-slate-300 leading-relaxed font-light" />
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* Dasha Analysis Section */}
        {data.dasha.analysis && (
            <div className="w-full bg-slate-800/80 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-shadow">
                {/* Decorative Elements */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-purple-600"></div>

                <div className="relative z-10">
                    <h3 className="text-2xl font-serif text-indigo-200 mb-4 flex items-center gap-3">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-900/50 border border-indigo-500/50 text-sm">⚡</span>
                        {t.dashaAnalysis || "Vimshottari Dasha Analysis"}
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                         <div className="p-4 bg-indigo-900/20 border border-indigo-500/20 rounded-xl">
                            <span className="text-xs text-indigo-400 uppercase tracking-widest font-bold block mb-1">Mahadasha Lord</span>
                            <span className="text-xl text-white font-serif">{translatePlanet(data.dasha.currentMahadasha, language)}</span>
                         </div>
                         <div className="p-4 bg-purple-900/20 border border-purple-500/20 rounded-xl">
                            <span className="text-xs text-purple-400 uppercase tracking-widest font-bold block mb-1">Antardasha Lord</span>
                            <span className="text-xl text-white font-serif">{translatePlanet(data.dasha.antardasha, language)}</span>
                         </div>
                         <div className="p-4 bg-slate-800/50 border border-slate-600/30 rounded-xl">
                            <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block mb-1">Period Ends</span>
                            <span className="text-lg text-slate-200 font-mono">{data.dasha.endsAt}</span>
                         </div>
                    </div>

                    <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-700/50">
                        <h4 className="text-amber-400 font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
                           <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                           {t.dashaImpact || "Current Period Impact"}
                        </h4>
                        <RichText text={data.dasha.analysis} className="text-slate-300 leading-relaxed text-lg font-light" />
                    </div>
                </div>
            </div>
        )}

        <AdBanner variant="leaderboard" />

        {/* Favorable Points Section */}
        {data.details.favorablePoints && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
                <h3 className="text-amber-400 font-serif mb-4 text-lg flex items-center gap-2">
                    <span className="text-xl">🍀</span> {language === 'hi' ? "शुभ बिंदु" : "Favorable Points"}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                        <span className="text-xs text-slate-500 uppercase block mb-1">{language === 'hi' ? "शुभ अंक" : "Lucky Number"}</span>
                        <span className="text-xl text-amber-100 font-bold">{data.details.favorablePoints.lucky_number}</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                         <span className="text-xs text-slate-500 uppercase block mb-1">{language === 'hi' ? "शुभ दिन" : "Lucky Day"}</span>
                        <span className="text-lg text-emerald-100">{data.details.favorablePoints.lucky_day}</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                         <span className="text-xs text-slate-500 uppercase block mb-1">{language === 'hi' ? "शुभ धातु" : "Lucky Metal"}</span>
                        <span className="text-lg text-slate-200">{data.details.favorablePoints.lucky_metal}</span>
                    </div>
                    <div className="p-3 bg-slate-900/50 rounded-lg">
                         <span className="text-xs text-slate-500 uppercase block mb-1">{language === 'hi' ? "शुभ रत्न" : "Lucky Stone"}</span>
                        <span className="text-lg text-purple-200">{data.details.favorablePoints.lucky_stone}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Advanced Dosha Check */}
        {data.details && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Mangal Dosha */}
                <div className={`p-4 rounded-xl border transition-all hover:scale-105 ${data.details.mangalDosha?.present ? 'bg-red-900/20 border-red-500/50' : 'bg-emerald-900/20 border-emerald-500/50'}`}>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
                        {data.details.mangalDosha?.present 
                            ? <span className="text-red-400">⚠ {language === 'hi' ? "उपस्थित" : "Present"}</span> 
                            : <span className="text-emerald-400">✓ {language === 'hi' ? "अनुपस्थित" : "Absent"}</span>}
                        <span className="text-slate-300">{language === 'hi' ? "मंगल दोष" : "Mangal Dosha"}</span>
                    </h4>
                    <p className="text-xs text-slate-400">{data.details.mangalDosha?.one_line_description}</p>
                </div>

                {/* Kalsarpa Dosha */}
                <div className={`p-4 rounded-xl border transition-all hover:scale-105 ${data.details.kalsarpaDosha?.present ? 'bg-orange-900/20 border-orange-500/50' : 'bg-emerald-900/20 border-emerald-500/50'}`}>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
                        {data.details.kalsarpaDosha?.present 
                             ? <span className="text-orange-400">⚠ {language === 'hi' ? "उपस्थित" : "Present"}</span> 
                             : <span className="text-emerald-400">✓ {language === 'hi' ? "अनुपस्थित" : "Absent"}</span>}
                        <span className="text-slate-300">{language === 'hi' ? "कालसर्प दोष" : "Kalsarpa Dosha"}</span>
                    </h4>
                    <p className="text-xs text-slate-400">{data.details.kalsarpaDosha?.one_line_description}</p>
                </div>

                {/* Sade Sati */}
                 <div className={`p-4 rounded-xl border transition-all hover:scale-105 ${data.details.sadeSati?.is_undergoing ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-800/50 border-slate-700'}`}>
                    <h4 className="text-sm font-bold uppercase tracking-wide mb-1 flex items-center gap-2">
                        {data.details.sadeSati?.is_undergoing 
                             ? <span className="text-purple-400">⚠ {language === 'hi' ? "सक्रिय" : "Active"}</span> 
                             : <span className="text-slate-400">{language === 'hi' ? "निष्क्रिय" : "Inactive"}</span>}
                        <span className="text-slate-300">{language === 'hi' ? "साढ़े साती" : "Sade Sati"}</span>
                    </h4>
                    <p className="text-xs text-slate-400">{data.details.sadeSati?.description} {data.details.sadeSati?.phase && `(${data.details.sadeSati.phase})`}</p>
                </div>
            </div>
        )}

        {/* Major Yogas Section */}
        {data.details.yogas && data.details.yogas.length > 0 && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
                <h3 className="text-amber-400 font-serif mb-4 text-lg flex items-center gap-2">
                   <span className="text-2xl">🕉</span> {language === 'hi' ? "मुख्य योग" : "Major Yogas"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.details.yogas.map((yoga, idx) => (
                        <div key={idx} className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-amber-600">
                            <h4 className="text-md font-bold text-amber-100">{yoga.name}</h4>
                            <RichText text={yoga.description} className="text-sm text-slate-300 mt-1 leading-relaxed" />
                        </div>
                    ))}
                </div>
            </div>
        )}
        
        {/* PRACTICAL REMEDIES SECTION */}
        {data.details.remedies && data.details.remedies.length > 0 && (
            <div className="bg-slate-800/60 border border-teal-500/30 rounded-xl p-6">
                <h3 className="text-teal-400 font-serif mb-4 text-lg flex items-center gap-2">
                   <span className="text-2xl">🪔</span> {language === 'hi' ? "वैदिक उपाय" : "Vedic Remedies"}
                </h3>
                <div className="space-y-4">
                    {data.details.remedies.map((remedy, idx) => (
                        <div key={idx} className="flex gap-4 p-4 bg-teal-900/10 rounded-lg border border-teal-500/20">
                            <div className="shrink-0 w-8 h-8 rounded-full bg-teal-900/50 flex items-center justify-center text-teal-200 border border-teal-500/30">
                                {idx + 1}
                            </div>
                            <div>
                                <h4 className="text-md font-bold text-teal-100 mb-1">{remedy.title}</h4>
                                <RichText text={remedy.description} className="text-sm text-slate-300 leading-relaxed" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Gemstone Recommendations (Enhanced with safety checks) */}
        {data.details?.gemstones && (
             <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 relative overflow-hidden">
                 {/* Background decoration */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <h3 className="text-amber-400 font-serif mb-6 text-xl flex items-center gap-2 relative z-10">
                    <span className="text-2xl">💎</span> {language === 'hi' ? "रत्न सुझाव" : "Gemstone Recommendations"}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                    {/* Life Stone */}
                    {data.details.gemstones.life && (
                        <div className="flex flex-col p-5 bg-slate-900/50 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-colors group">
                            <span className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">{language === 'hi' ? "जीवन रत्न" : "Life Stone"}</span>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-red-900/30 flex items-center justify-center border border-red-500/30 text-xl">
                                    🔴
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-amber-100 block group-hover:text-white transition-colors">{data.details.gemstones.life.gem}</span>
                                    <span className="text-xs text-slate-400">{data.details.gemstones.life.name}</span>
                                </div>
                            </div>
                            <div className="space-y-1 mb-3">
                                <div className="text-xs text-slate-400 flex justify-between">
                                    <span>Finger:</span> <span className="text-slate-300">{data.details.gemstones.life.wear_finger}</span>
                                </div>
                                <div className="text-xs text-slate-400 flex justify-between">
                                    <span>Metal:</span> <span className="text-slate-300">{data.details.gemstones.life.wear_metal}</span>
                                </div>
                            </div>
                            {data.details.gemstones.life.reason && (
                                <p className="mt-auto pt-3 border-t border-slate-700/50 text-xs text-slate-400 italic">
                                    "{data.details.gemstones.life.reason}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Lucky Stone */}
                    {data.details.gemstones.lucky && (
                        <div className="flex flex-col p-5 bg-slate-900/50 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-colors group">
                            <span className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">{language === 'hi' ? "भाग्य रत्न" : "Lucky Stone"}</span>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-900/30 flex items-center justify-center border border-emerald-500/30 text-xl">
                                    🟢
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-emerald-100 block group-hover:text-white transition-colors">{data.details.gemstones.lucky.gem}</span>
                                    <span className="text-xs text-slate-400">{data.details.gemstones.lucky.name}</span>
                                </div>
                            </div>
                             <div className="space-y-1 mb-3">
                                <div className="text-xs text-slate-400 flex justify-between">
                                    <span>Finger:</span> <span className="text-slate-300">{data.details.gemstones.lucky.wear_finger}</span>
                                </div>
                                <div className="text-xs text-slate-400 flex justify-between">
                                    <span>Metal:</span> <span className="text-slate-300">{data.details.gemstones.lucky.wear_metal}</span>
                                </div>
                            </div>
                            {data.details.gemstones.lucky.reason && (
                                <p className="mt-auto pt-3 border-t border-slate-700/50 text-xs text-slate-400 italic">
                                    "{data.details.gemstones.lucky.reason}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Benefic Stone */}
                    {data.details.gemstones.benefic && (
                        <div className="flex flex-col p-5 bg-slate-900/50 rounded-xl border border-blue-500/20 hover:border-blue-500/40 transition-colors group">
                            <span className="text-xs text-slate-500 uppercase tracking-widest mb-2 font-bold">{language === 'hi' ? "लाभकारी रत्न" : "Benefic Stone"}</span>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-500/30 text-xl">
                                    🔵
                                </div>
                                <div>
                                    <span className="text-lg font-bold text-blue-100 block group-hover:text-white transition-colors">{data.details.gemstones.benefic.gem}</span>
                                    <span className="text-xs text-slate-400">{data.details.gemstones.benefic.name}</span>
                                </div>
                            </div>
                             <div className="space-y-1 mb-3">
                                <div className="text-xs text-slate-400 flex justify-between">
                                    <span>Finger:</span> <span className="text-slate-300">{data.details.gemstones.benefic.wear_finger}</span>
                                </div>
                                <div className="text-xs text-slate-400 flex justify-between">
                                    <span>Metal:</span> <span className="text-slate-300">{data.details.gemstones.benefic.wear_metal}</span>
                                </div>
                            </div>
                            {data.details.gemstones.benefic.reason && (
                                <p className="mt-auto pt-3 border-t border-slate-700/50 text-xs text-slate-400 italic">
                                    "{data.details.gemstones.benefic.reason}"
                                </p>
                            )}
                        </div>
                    )}
                </div>
             </div>
        )}

        {/* Shadbala Strength Graph */}
        {data.charts.shadbala && data.charts.shadbala.length > 0 && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
              <h3 className="text-amber-400 font-serif mb-6 text-lg">{language === 'hi' ? "षड्बल (ग्रह बल)" : "Shadbala (Planetary Strength)"}</h3>
              <div className="grid grid-cols-7 gap-4">
                  {data.charts.shadbala.map((planet) => (
                      <div key={planet.planet} className="flex flex-col items-center gap-2 group">
                          <div className="w-full h-32 bg-slate-900/50 rounded-lg relative overflow-hidden flex items-end">
                              <div 
                                style={{ height: `${(planet.strength / maxStrength) * 100}%` }}
                                className={`w-full transition-all duration-1000 ${planet.isStrong ? 'bg-gradient-to-t from-emerald-600 to-emerald-400' : 'bg-gradient-to-t from-red-600 to-red-400'} opacity-80 group-hover:opacity-100`}
                              ></div>
                          </div>
                          <span className="text-xs font-bold text-slate-300 uppercase">
                              {/* Display first 2 chars of translated planet name */}
                              {translatePlanet(planet.planet, language).substring(0, 2)}
                          </span>
                          <span className="text-[10px] text-slate-500 group-hover:text-white transition-colors">{planet.strength.toFixed(1)}</span>
                      </div>
                  ))}
              </div>
          </div>
        )}
        
        <AdBanner variant="leaderboard" />

        {/* Predictions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-colors">
              <h3 className="flex items-center text-xl font-serif text-teal-200 mb-3">
                <span className="mr-2 text-2xl">☸</span> {t.personality}
              </h3>
              <RichText text={data.predictions.general} className="text-slate-300 leading-relaxed font-light text-sm md:text-base" />
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-colors">
              <h3 className="flex items-center text-xl font-serif text-amber-200 mb-3">
                <span className="mr-2 text-2xl">₹</span> {t.careerWealth}
              </h3>
              <RichText text={data.predictions.career} className="text-slate-300 leading-relaxed font-light text-sm md:text-base" />
            </div>

            <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-colors">
              <h3 className="flex items-center text-xl font-serif text-pink-200 mb-3">
                <span className="mr-2 text-2xl">❤</span> {t.loveMarriage}
              </h3>
              <RichText text={data.predictions.love} className="text-slate-300 leading-relaxed font-light text-sm md:text-base" />
            </div>
             
             <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800/80 transition-colors">
              <h3 className="flex items-center text-xl font-serif text-emerald-200 mb-3">
                <span className="mr-2 text-2xl">⚕</span> {t.health}
              </h3>
              <RichText text={data.predictions.health} className="text-slate-300 leading-relaxed font-light text-sm md:text-base" />
            </div>
        </div>
      </div>
    </div>
  );
};

export default KundaliResult;