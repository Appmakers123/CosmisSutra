
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, PalmPrediction } from '../types';
import { generatePalmInterpretation } from '../services/geminiService';
import AdBanner from './AdBanner';
import RichText from './RichText';

interface PalmReadingProps {
  language: Language;
}

const PalmReading: React.FC<PalmReadingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setReading(null);
      setError(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    try {
      // Simulate detection for UI, then let Gemini analyze
      const detectedLines = ["Life Line", "Heart Line", "Head Line"];
      const interpretation = await generatePalmInterpretation(detectedLines, language);
      setReading(interpretation);
    } catch (err) {
      setError("Celestial analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up">
        <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl relative">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-amber-200 mb-2">{t.palmReading}</h2>
                <p className="text-slate-400 text-sm">Study the lines of fate upon your hand</p>
            </div>

            <div className="flex flex-col items-center gap-6">
                {!previewUrl ? (
                    <label className="w-full h-64 border-2 border-slate-700 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer bg-slate-900/40 hover:bg-slate-800/40 transition-colors">
                        <span className="text-4xl mb-2">✋</span>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Upload your palm photo</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="relative w-full max-w-sm rounded-xl overflow-hidden border border-slate-700 shadow-2xl">
                        <img ref={imgRef} src={previewUrl} alt="Palm" className="w-full h-auto" />
                        <button onClick={() => {setPreviewUrl(null); setReading(null);}} className="absolute top-2 right-2 bg-slate-900/80 p-2 rounded-full text-white">×</button>
                    </div>
                )}

                {previewUrl && !reading && (
                    <button onClick={handleAnalyze} disabled={loading} className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-800 text-white font-serif font-bold rounded-xl shadow-lg disabled:opacity-50">
                        {loading ? "Analyzing fate lines..." : "Interpret Palm"}
                    </button>
                )}
            </div>

            {reading && (
                <div className="mt-12 animate-fade-in space-y-6">
                     <AdBanner variant="leaderboard" />
                     <div className="bg-slate-900/60 p-8 rounded-2xl border border-amber-500/20 shadow-inner">
                        <h3 className="text-xl font-serif text-amber-100 mb-4">Vedic Interpretation</h3>
                        <RichText text={reading} />
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PalmReading;
