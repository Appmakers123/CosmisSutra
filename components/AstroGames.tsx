
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { generateAstroQuiz } from '../services/geminiService';

interface AstroGamesProps {
  language: Language;
}

const AstroGames: React.FC<AstroGamesProps> = ({ language }) => {
  const t = useTranslation(language);
  const [gameState, setGameState] = useState<'lobby' | 'playing' | 'result'>('lobby');
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const startQuiz = async () => {
    setLoading(true);
    try {
        const q = await generateAstroQuiz(language);
        setQuestions(Array.isArray(q) ? q : []);
        setGameState('playing');
        setCurrentIdx(0);
        setScore(0);
        setSelectedOption(null);
        setShowExplanation(false);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(idx);
    if (idx === questions[currentIdx]?.correctIndex) {
        setScore(s => s + 1);
    }
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentIdx < questions.length - 1) {
        setCurrentIdx(c => c + 1);
        setSelectedOption(null);
        setShowExplanation(false);
    } else {
        setGameState('result');
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up min-h-[50vh]">
      <div className="bg-slate-800/80 backdrop-blur-md border border-indigo-500/30 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 text-9xl">🎲</div>
        
        <div className="text-center mb-8 relative z-10">
          <h2 className="text-3xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-indigo-200 mb-2">
            {t.games}
          </h2>
          <p className="text-slate-400 text-sm">Test your celestial wisdom and earn karma points.</p>
        </div>

        {gameState === 'lobby' && (
            <div className="flex flex-col items-center py-10 space-y-8 relative z-10">
                <div className="w-24 h-24 bg-indigo-900/50 rounded-2xl flex items-center justify-center text-5xl shadow-inner border border-indigo-500/30">🧠</div>
                <button 
                    onClick={startQuiz}
                    disabled={loading}
                    className="px-10 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-serif font-bold rounded-xl shadow-xl transition-all flex items-center gap-3 disabled:opacity-50"
                >
                    {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "Start Challenge"}
                </button>
            </div>
        )}

        {gameState === 'playing' && questions.length > 0 && (
            <div className="space-y-8 animate-fade-in relative z-10">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-500">
                    <span>Question {currentIdx + 1}/{questions.length}</span>
                    <span className="text-indigo-400">Score: {score}</span>
                </div>
                
                <h3 className="text-xl md:text-2xl text-white font-serif leading-tight">{questions[currentIdx]?.question}</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(questions[currentIdx]?.options || []).map((opt: string, i: number) => {
                        let btnClass = "bg-slate-900/50 border-slate-700 text-slate-300 hover:border-indigo-500/50";
                        if (selectedOption !== null) {
                            if (i === questions[currentIdx].correctIndex) btnClass = "bg-green-900/30 border-green-500 text-green-300";
                            else if (i === selectedOption) btnClass = "bg-red-900/30 border-red-500 text-red-300";
                            else btnClass = "bg-slate-900/30 border-slate-800 text-slate-600";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleAnswer(i)}
                                disabled={selectedOption !== null}
                                className={`p-4 border rounded-xl text-left transition-all ${btnClass} font-medium`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-[10px] font-bold">{String.fromCharCode(65 + i)}</span>
                                    {opt}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {showExplanation && (
                    <div className="animate-fade-in-up bg-indigo-900/20 border border-indigo-500/30 p-4 rounded-xl">
                        <p className="text-xs text-indigo-300 leading-relaxed"><span className="font-bold uppercase mr-2">Did you know?</span> {questions[currentIdx]?.explanation}</p>
                        <button 
                            onClick={nextQuestion}
                            className="mt-4 w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-bold transition-all shadow-lg"
                        >
                            {currentIdx < questions.length - 1 ? "Next Question" : "See Results"}
                        </button>
                    </div>
                )}
            </div>
        )}

        {gameState === 'result' && (
            <div className="flex flex-col items-center py-10 space-y-6 animate-fade-in relative z-10">
                <div className="text-6xl mb-2">🎊</div>
                <h3 className="text-3xl font-serif text-white">Challenge Complete!</h3>
                <div className="bg-slate-900/80 px-10 py-6 rounded-2xl border border-indigo-500/30 text-center">
                    <p className="text-slate-400 text-sm uppercase tracking-widest mb-1">Your Wisdom Level</p>
                    <div className="text-5xl font-bold text-white mb-2">{score}/{questions.length}</div>
                </div>
                <button onClick={startQuiz} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-bold">Try Again</button>
            </div>
        )}
      </div>
    </div>
  );
};

export default AstroGames;
