import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/translations';
import { Language, KundaliResponse } from '../types';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse, Chat } from '@google/genai';
import RichText from './RichText';

interface ChatWidgetProps {
  language: Language;
  context?: KundaliResponse | null;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ language, context }) => {
  const t = useTranslation(language);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session whenever language or context changes
  useEffect(() => {
    let contextString = "";
    if (context) {
        contextString = `
        User Name: ${context.basicDetails.name || 'User'}
        Ascendant: ${context.basicDetails.ascendant}
        Moon Sign: ${context.basicDetails.moonSign}
        Nakshatra: ${context.basicDetails.nakshatra}
        
        Planetary Positions (D1):
        ${context.charts.planetaryPositions.map(p => `- ${p.planet} in ${p.sign} (${p.house}th House)${p.isRetrograde ? ' [R]' : ''}`).join('\n')}
        
        Current Mahadasha: ${context.dasha.currentMahadasha}
        Antardasha: ${context.dasha.antardasha}
        `;
    }

    chatSessionRef.current = createChatSession(language, contextString);
    
    // If context is present, add a system welcome message acknowledging the chart
    const initialMessage = context 
       ? (language === 'hi' ? `नमस्ते। मैंने आपकी कुंडली (${context.basicDetails.ascendant} लग्न) का विश्लेषण कर लिया है। आप मुझसे इसके बारे में कुछ भी पूछ सकते हैं।` : `Namaste. I have analyzed your chart (Ascendant: ${context.basicDetails.ascendant}). You can ask me anything about it.`)
       : t.chatWelcome;

    setMessages([{ role: 'model', text: initialMessage }]);
  }, [language, t, context]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || !chatSessionRef.current) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
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
      setMessages(prev => [...prev, { role: 'model', text: t.errorGeneric }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
      // Re-initialize with same context
      let contextString = "";
      if (context) {
           contextString = `User Name: ${context.basicDetails.name || 'User'} ... (reloaded)`; // simplified for reset
      }
      chatSessionRef.current = createChatSession(language, contextString);
      setMessages([{ role: 'model', text: t.chatWelcome }]);
  };

  return (
    <>
      {/* Trigger Button - Floating fixed bottom right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-24 right-6 z-[60] p-3 md:p-4 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] transition-all duration-300 hover:scale-105 flex items-center justify-center group ${
          isOpen ? 'bg-slate-800 border border-slate-600 rotate-90' : 'bg-gradient-to-br from-indigo-600 to-purple-600 text-white'
        }`}
        title="Ask Rishi AI"
      >
        {isOpen ? (
           <svg className="w-6 h-6 md:w-8 md:h-8 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
           <div className="flex items-center gap-2 px-1">
              <span className="text-2xl md:text-3xl filter drop-shadow-md">🧙‍♂️</span>
              <span className="font-serif font-bold text-sm md:text-base whitespace-nowrap pr-1">Ask Rishi</span>
              {context && <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
           </div>
        )}
      </button>

      {/* Chat Window - Fixed Popover with Smooth Transition */}
      <div 
        className={`fixed bottom-40 right-4 md:right-6 z-[60] w-[90vw] md:w-[400px] h-[500px] max-h-[60vh] bg-slate-900/95 backdrop-blur-xl border border-purple-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden origin-bottom-right transition-all duration-300 ease-in-out ${
            isOpen 
            ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' 
            : 'opacity-0 scale-95 translate-y-10 pointer-events-none'
        }`}
      >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900/90 to-purple-900/90 p-4 border-b border-purple-500/30 flex items-center justify-between shadow-md relative z-10">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-400/40 flex items-center justify-center text-xl shadow-inner">
                   🧙‍♂️
                </div>
                <div>
                   <h3 className="font-serif font-bold text-white text-base leading-tight">{t.chatTitle}</h3>
                   <span className="text-[10px] text-purple-200 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span> {context ? (language === 'hi' ? 'कुंडली सक्रिय' : 'Chart Active') : 'Online'}
                   </span>
                </div>
             </div>
             <button 
                onClick={handleReset} 
                className="text-purple-300 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors" 
                title="Reset Chat"
             >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
             </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-950/50 custom-scrollbar scroll-smooth">
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`max-w-[85%] p-3 md:p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-purple-600 text-white rounded-br-none' 
                        : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-none'
                   }`}>
                      <RichText text={msg.text} />
                   </div>
                </div>
             ))}
             {isLoading && messages[messages.length-1]?.role !== 'model' && (
                <div className="flex justify-start">
                   <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none flex gap-1.5 border border-slate-700">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                   </div>
                </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2 relative z-10">
             <input 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               placeholder={t.chatPlaceholder}
               className="flex-1 bg-slate-800 border border-slate-700 rounded-full px-4 py-2.5 text-xs md:text-sm text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all placeholder-slate-500"
             />
             <button 
               type="submit" 
               disabled={!input.trim() || isLoading}
               className="bg-purple-600 hover:bg-purple-500 text-white p-2.5 rounded-full disabled:opacity-50 transition-all shadow-lg hover:shadow-purple-500/30"
             >
               <svg className="w-5 h-5 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
             </button>
          </form>
      </div>
    </>
  );
};

export default ChatWidget;