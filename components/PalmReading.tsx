import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, PalmPrediction } from '../types';
import { generatePalmInterpretation } from '../services/geminiService';
import AdBanner from './AdBanner';

interface PalmReadingProps {
  language: Language;
}

// Private API Key for Roboflow
const ROBOFLOW_API_KEY = "95BnuAELV8jZrBBqZu2C";
const MODEL_ENDPOINT = "https://detect.roboflow.com/palm-reading-b3tep/1";

const PalmReading: React.FC<PalmReadingProps> = ({ language }) => {
  const t = useTranslation(language);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PalmPrediction[]>([]);
  const [reading, setReading] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setPredictions([]);
      setReading(null);
      setError(null);
    }
  };

  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const drawPredictions = (preds: PalmPrediction[]) => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Match canvas size to image display size
    canvas.width = img.width;
    canvas.height = img.height;

    // Clear previous drawings
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate scaling factors (natural size vs displayed size)
    const scaleX = img.width / img.naturalWidth;
    const scaleY = img.height / img.naturalHeight;

    preds.forEach(pred => {
      const x = (pred.x - pred.width / 2) * scaleX;
      const y = (pred.y - pred.height / 2) * scaleY;
      const w = pred.width * scaleX;
      const h = pred.height * scaleY;

      // Draw Box
      ctx.strokeStyle = '#F59E0B'; // Amber-500
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, w, h);

      // Draw Label
      ctx.fillStyle = '#F59E0B';
      ctx.globalAlpha = 0.8;
      ctx.fillRect(x, y - 20, w, 20);
      ctx.globalAlpha = 1.0;
      ctx.fillStyle = '#000';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(pred.class, x + 4, y - 6);
    });
  };

  // Re-draw on window resize or when predictions change
  useEffect(() => {
    if (predictions.length > 0 && imgRef.current) {
        // Wait for image to load before drawing
        if (imgRef.current.complete) {
            drawPredictions(predictions);
        } else {
             imgRef.current.onload = () => drawPredictions(predictions);
        }
    }
  }, [predictions, previewUrl]);

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setLoading(true);
    setLoadingMessage(t.loadingPalm); // "Analyzing palm lines..."
    setError(null);
    setPredictions([]);
    setReading(null);

    try {
      const base64Data = await getBase64(imageFile);
      // Strip metadata prefix (data:image/jpeg;base64,) to send raw base64
      const rawBase64 = base64Data.split(',')[1];
      
      if (!rawBase64) {
          throw new Error("Failed to process image data.");
      }

      // 1. Send to Roboflow
      const roboflowUrl = `${MODEL_ENDPOINT}?api_key=${ROBOFLOW_API_KEY}&confidence=40&overlap=30&format=json`;
      
      const response = await fetch(roboflowUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: rawBase64
      });

      if (!response.ok) {
          const errorText = await response.text();
          console.error("Roboflow API Error:", errorText);
          throw new Error(`Roboflow analysis failed (${response.status}). Please try again.`);
      }

      const result = await response.json();
      const preds: PalmPrediction[] = result.predictions || [];
      setPredictions(preds);

      if (preds.length === 0) {
          setError("No distinct palm lines detected. Try a clearer photo with better lighting.");
          setLoading(false);
          return;
      }

      // 2. Interpret with Gemini
      setLoadingMessage(t.loadingButton); // "Consulting the Cosmos..."
      const detectedClasses = [...new Set(preds.map(p => p.class))]; // Unique classes
      const interpretation = await generatePalmInterpretation(detectedClasses, language);
      setReading(interpretation);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 animate-fade-in-up pb-12">
        <div className="bg-slate-800/80 backdrop-blur-md border border-amber-500/30 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200 mb-2">
                    {t.palmReading}
                </h2>
                <p className="text-slate-400 text-sm">{t.uploadPalmSubtitle}</p>
            </div>

            <div className="flex flex-col items-center gap-6">
                
                {/* Image Upload Area */}
                {!previewUrl && (
                    <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-600 border-dashed rounded-lg cursor-pointer bg-slate-900/50 hover:bg-slate-800/50 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <svg className="w-10 h-10 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                            <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                            <p className="text-xs text-slate-500">SVG, PNG, JPG or GIF</p>
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                )}

                {/* Image Preview & Analysis */}
                {previewUrl && (
                    <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden border border-slate-700 shadow-lg">
                        <img 
                            ref={imgRef}
                            src={previewUrl} 
                            alt="Palm Upload" 
                            className="w-full h-auto block"
                        />
                        <canvas 
                            ref={canvasRef}
                            className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        />
                         {/* Clear Button */}
                         <button 
                            onClick={() => { setPreviewUrl(null); setPredictions([]); setReading(null); setImageFile(null); }}
                            className="absolute top-2 right-2 bg-slate-900/70 hover:bg-red-900/80 text-white rounded-full p-2 transition-colors z-10"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}

                {/* Action Button */}
                {previewUrl && !reading && (
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-serif font-bold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                {loadingMessage || t.loadingPalm}
                            </>
                        ) : (
                            t.analyzePalm
                        )}
                    </button>
                )}

                {error && (
                    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-sm text-center">
                        <p className="font-bold mb-1">Analysis Failed</p>
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Results Section */}
            {reading && (
                <div className="mt-8 animate-fade-in space-y-6 border-t border-slate-700/50 pt-8">
                     
                     <AdBanner variant="leaderboard" />
                     
                     {/* Detected Lines List */}
                     <div className="flex flex-wrap gap-2 justify-center">
                        {[...new Set(predictions.map(p => p.class))].map(lineName => (
                            <span key={lineName} className="px-3 py-1 bg-amber-900/30 border border-amber-600/30 text-amber-200 text-xs rounded-full uppercase tracking-wider font-bold">
                                {lineName}
                            </span>
                        ))}
                     </div>

                     {/* Interpretation */}
                     <div className="bg-gradient-to-br from-slate-900/80 to-purple-900/20 p-6 rounded-xl border border-purple-500/30 relative overflow-hidden shadow-lg">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <svg className="w-24 h-24 text-purple-400" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-serif text-amber-100 mb-4 flex items-center gap-2 relative z-10">
                             <span className="text-2xl">🔮</span> {t.palmInterpretation}
                        </h3>
                        <p className="text-slate-200 leading-relaxed italic text-lg relative z-10 font-light tracking-wide whitespace-pre-wrap">
                            {reading}
                        </p>
                     </div>

                     {/* Technical Details Table */}
                     <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-700/50 mt-6">
                        <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
                            Detection Details
                        </h4>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-300">
                                <thead className="text-slate-500 uppercase bg-slate-800/50">
                                    <tr>
                                        <th className="px-3 py-2">Line</th>
                                        <th className="px-3 py-2">Confidence</th>
                                        <th className="px-3 py-2">Box (x, y, w, h)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {predictions.map((pred, idx) => (
                                        <tr key={idx} className="border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
                                            <td className="px-3 py-2 font-medium text-amber-500">{pred.class}</td>
                                            <td className="px-3 py-2">{(pred.confidence * 100).toFixed(1)}%</td>
                                            <td className="px-3 py-2 font-mono text-slate-500">
                                                {pred.x.toFixed(0)}, {pred.y.toFixed(0)}, {pred.width.toFixed(0)}, {pred.height.toFixed(0)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                     </div>
                </div>
            )}
        </div>
    </div>
  );
};

export default PalmReading;