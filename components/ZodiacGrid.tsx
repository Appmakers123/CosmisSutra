import React from 'react';
import { ZODIAC_SIGNS } from '../constants';
import { ZodiacSignData, Language } from '../types';

interface ZodiacGridProps {
  onSelect: (sign: ZodiacSignData) => void;
  language: Language;
}

const ZodiacGrid: React.FC<ZodiacGridProps> = ({ onSelect, language }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full max-w-5xl mx-auto px-4 pb-12">
      {ZODIAC_SIGNS.map((sign) => (
        <button
          key={sign.id}
          onClick={() => onSelect(sign)}
          className="group relative flex flex-col items-center justify-center p-6 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl hover:bg-slate-700/60 hover:border-purple-500 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition-all duration-300 ease-out"
        >
          <div className="w-12 h-12 mb-3 text-purple-400 group-hover:text-purple-300 transition-colors">
            {sign.symbol}
          </div>
          <h3 className="text-xl font-serif text-slate-100 group-hover:text-white mb-1">
            {language === 'hi' ? sign.hindiName : sign.name}
          </h3>
          <span className="text-xs text-slate-400 font-medium tracking-wider uppercase">
            {sign.dateRange}
          </span>
          <div className={`absolute top-3 right-3 w-2 h-2 rounded-full ${
            sign.element === 'Fire' ? 'bg-red-500' :
            sign.element === 'Water' ? 'bg-blue-500' :
            sign.element === 'Air' ? 'bg-yellow-200' : 'bg-green-500'
          } opacity-70`} />
        </button>
      ))}
    </div>
  );
};

export default ZodiacGrid;