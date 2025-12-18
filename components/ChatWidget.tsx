
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, KundaliResponse } from '../types';
import { createChatSession, askRishiWithFallback } from '../services/geminiService';
import { GenerateContentResponse, Chat } from '@google/genai';
import RichText from './RichText';

interface ChatWidgetProps {
  language: Language;
  context?: KundaliResponse | null;
  onUseKarma: () => boolean;
  hasKarma: boolean;
  onOpenStore: () => void;
}

interface Message {
  role: 'user' | 'model';
  text: string;
  sources?: { title: string, uri: string }[];
  isFallback?: boolean;
}

const QUICK_CHIPS = {
  en: ["How is my career?", "Relationship advice", "Remedies for stress", "My spiritual path"],
  hi: ["मेरा करियर कैसा है?", "प्रेम और संबंध सलाह", "तनाव दूर करने के उपाय", "मेरा आध्यात्मिक पथ"]
};

const ChatWidget: React.FC<ChatWidgetProps> = ({ language, context }) => {
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fallbackMode, setFallbackMode] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const contextStringRef = useRef("");

  useEffect(() => {
    let contextStr = "";
    if (context) {
        contextStr = `User: ${context.basicDetails.name}, Asc: ${context.basicDetails.ascendant}, Rashi: ${context.basicDetails.moonSign}. Current Dasha: ${context.dasha.currentMahadasha}.`;
    }
    contextStringRef.current = contextStr;
    chatSessionRef.current = createChatSession(language, contextStr);
    
    const initialMessage = context 
       ? (language === 'hi' ? `नमस्ते। मैंने आपकी कुंडली देख ली है। आप मुझसे अपने जीवन के बारे में कुछ भी पूछ सकते हैं।` : `Namaste. I have analyzed your birth chart. Ask me anything about your destiny or current path.`)
       : t.chatWelcome;

    setMessages([{ role: 'model', text: initialMessage }]);
  }, [language, t, context]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (msgOverride?: string) => {
    const userMsg = msgOverride || input.trim();
    if (!userMsg) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
        if (!chatSessionRef.current) throw new Error("No session");
        const resultStream = await chatSessionRef.current.sendMessageStream({ message: userMsg });
        let fullResponse = "";
        setMessages(prev => [...prev, { role: 'model', text: "" }]);

        for await (const chunk of resultStream) {
            const chunkText = (chunk as GenerateContentResponse).text;
            if (chunkText) {
                fullResponse += chunkText;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[newMsgs.length - 1] = { role: 'model', text: fullResponse };
                    return newMsgs;
                });
            }
        }
    } catch (error) {
        setFallbackMode(true);
        try {
            const fallbackResult = await askRishiWithFallback(userMsg, language, contextStringRef.current);
            setMessages(prev => [...prev, { role: 'model', text: fallbackResult.text, isFallback: true }]);
        } catch (tier3Error) {
            setMessages(prev => [...prev, { role: 'model', text: "The cosmic channel is currently busy. Please try again soon." }]);
        }
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-[60]">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`group relative flex items-center justify-center rounded-full transition-all duration-500 shadow-2xl ${
              isOpen ? 'bg-slate-800 w-12 h-12 rotate-90' : 'bg-amber-600 w-16 h-16 hover:scale-110'
            }`}
          >
            {isOpen ? (
              <span className="text-white">✕</span>
            ) : (
              <>
                <span className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-25"></span>
                <span className="text-3xl relative z-10">🧙‍♂️</span>
              </>
            )}
          </button>
      </div>

      <div className={`fixed bottom-24 right-6 z-[60] w-[90vw] md:w-[420px] h-[600px] max-h-[80vh] bg-slate-900 border border-slate-700/50 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.6)] flex flex-col transition-all duration-500 origin-bottom-right ${isOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-10 pointer-events-none'}`}>
          
          {/* Header */}
          <div className="p-5 bg-slate-800/80 backdrop-blur-md rounded-t-[2rem] border-b border-white/5 flex justify-between items-center">
             <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-amber-900/30 border border-amber-500/30 flex items-center justify-center text-xl shadow-inner">
                    ✨
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-800 rounded-full"></div>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-amber-100 leading-none mb-1">Astro Rishi</h3>
                  <div className="flex items-center gap-1.5">
                    {context ? (
                      <span className="text-[8px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-tighter flex items-center gap-1">
                        <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 20 20"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13zM7 13a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h.01a1 1 0 100-2H10zm3 0a1 1 0 000 2h.01a1 1 0 100-2H13z" clipRule="evenodd" /></svg>
                        Chart Loaded
                      </span>
                    ) : (
                      <span className="text-[8px] text-slate-500 uppercase font-bold tracking-widest">Divine Guide</span>
                    )}
                  </div>
                </div>
             </div>
             <button 
                onClick={() => setMessages([{ role: 'model', text: context ? (language === 'hi' ? `नमस्ते। मैंने आपकी कुंडली देख ली है। आप मुझसे अपने जीवन के बारे में कुछ भी पूछ सकते हैं।` : `Namaste. I have your chart. What else can I guide you with?`) : t.chatWelcome }])}
                className="p-2 text-slate-500 hover:text-amber-400 transition-colors" title="Reset Chat"
             >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-950/20 custom-scrollbar">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in-up`}>
                   <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-lg ${
                     msg.role === 'user' 
                       ? 'bg-gradient-to-br from-amber-600 to-orange-700 text-white rounded-br-none' 
                       : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-none'
                   }`}>
                      {msg.text === "" && isLoading ? (
                        <div className="flex items-center gap-2 text-amber-500/60 font-serif italic text-xs">
                          <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          Consulting Akasha...
                        </div>
                      ) : (
                        <RichText text={msg.text} />
                      )}
                   </div>
                </div>
             ))}

             {/* Suggestion Chips - Only show when chat is essentially starting */}
             {messages.length <= 1 && !isLoading && (
                <div className="pt-4 flex flex-wrap gap-2 animate-fade-in">
                  {QUICK_CHIPS[language].map(chip => (
                    <button 
                      key={chip}
                      onClick={() => handleSend(chip)}
                      className="px-4 py-2 bg-slate-800/40 border border-slate-700 hover:border-amber-500/50 hover:bg-slate-800 rounded-full text-xs text-slate-400 hover:text-amber-200 transition-all shadow-sm"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
             )}

             {isLoading && messages[messages.length-1]?.role === 'user' && (
                <div className="flex justify-start animate-fade-in">
                   <div className="bg-slate-800/50 p-4 rounded-2xl rounded-bl-none border border-white/5 flex flex-col gap-3">
                      <div className="flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                      </div>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Rishi is Meditating</p>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }} 
            className="p-5 bg-slate-900 border-t border-white/5 flex gap-3 relative z-10"
          >
             <div className="flex-1 relative">
                <input 
                  value={input} 
                  onChange={e => setInput(e.target.value)} 
                  placeholder={language === 'hi' ? 'अपना प्रश्न पूछें...' : 'Ask your question...'}
                  className="w-full bg-slate-950 border border-slate-700/50 rounded-full px-5 py-3 text-sm focus:border-amber-500/50 outline-none transition-all pr-12 text-slate-200 placeholder-slate-600" 
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-slate-700 font-bold uppercase tracking-tighter pointer-events-none">
                  AI
                </div>
             </div>
             <button 
               type="submit" 
               disabled={!input.trim() || isLoading} 
               className="bg-amber-600 hover:bg-amber-500 disabled:bg-slate-800 text-white p-3 rounded-full shadow-lg transition-all active:scale-95 group"
             >
                <svg className="w-5 h-5 transition-transform group-hover:translate-x-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             </button>
          </form>
      </div>
    </>
  );
};

export default ChatWidget;
