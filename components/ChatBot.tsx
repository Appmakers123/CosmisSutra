import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from '../utils/translations';
import { Language } from '../types';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse, Chat } from '@google/genai';
import AdBanner from './AdBanner';

interface ChatBotProps {
  language: Language;
}

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatBot: React.FC<ChatBotProps> = ({ language }) => {
  const t = useTranslation(language);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Chat Session
  useEffect(() => {
    chatSessionRef.current = createChatSession(language);
    // Add initial greeting locally
    setMessages([{ role: 'model', text: t.chatWelcome }]);
  }, [language, t]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
      
      // Add a placeholder message for the bot response
      setMessages(prev => [...prev, { role: 'model', text: "" }]);

      for await (const chunk of resultStream) {
        const chunkText = (chunk as GenerateContentResponse).text;
        if (chunkText) {
          fullResponse += chunkText;
          // Update the last message (bot's response) with new chunk
          setMessages(prev => {
            const newMsgs = [...prev];
            newMsgs[newMsgs.length - 1] = { role: 'model', text: fullResponse };
            return newMsgs;
          });
        }
      }
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: t.errorGeneric }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-12 animate-fade-in-up h-[80vh] flex flex-col">
      <div className="bg-slate-800/80 backdrop-blur-md border border-purple-500/30 rounded-2xl shadow-2xl overflow-hidden flex-1 flex flex-col relative">
        
        {/* Header */}
        <div className="bg-slate-900/90 p-4 border-b border-purple-500/30 flex items-center justify-between z-10">
           <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-900/50 border border-purple-500/50 flex items-center justify-center text-xl">
                 🧙‍♂️
              </div>
              <div>
                 <h2 className="text-lg font-serif text-purple-200">{t.chatTitle}</h2>
                 <p className="text-xs text-slate-400">{t.chatSubtitle}</p>
              </div>
           </div>
           <button 
             onClick={() => {
                chatSessionRef.current = createChatSession(language);
                setMessages([{ role: 'model', text: t.chatWelcome }]);
             }}
             className="text-slate-400 hover:text-white p-2 rounded-full hover:bg-slate-800 transition-colors"
             title="Reset Chat"
           >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
           </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/30">
           {messages.map((msg, idx) => (
             <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[80%] md:max-w-[70%] p-4 rounded-2xl text-sm md:text-base leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-none' 
                      : 'bg-slate-700/80 text-slate-200 border border-slate-600 rounded-bl-none'
                  }`}
                >
                   {msg.text ? msg.text : <span className="animate-pulse">...</span>}
                </div>
             </div>
           ))}
           {isLoading && messages[messages.length-1]?.role !== 'model' && (
              <div className="flex justify-start">
                 <div className="bg-slate-700/50 p-3 rounded-2xl rounded-bl-none flex gap-2 items-center">
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                    <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                 </div>
              </div>
           )}
           <div ref={messagesEndRef} />
        </div>

        {/* Ad Banner inside chat flow */}
        <div className="bg-slate-900/90 border-t border-purple-500/20 px-2 py-1">
             <AdBanner variant="leaderboard" className="!my-2 scale-90 origin-center" /> 
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="bg-slate-900 p-4 border-t border-slate-700 flex gap-2 relative z-20">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             placeholder={t.chatPlaceholder}
             disabled={isLoading}
             className="flex-1 bg-slate-800 border border-slate-600 rounded-full px-6 py-3 text-slate-200 focus:outline-none focus:border-purple-500 transition-colors disabled:opacity-50"
           />
           <button 
             type="submit" 
             disabled={!input.trim() || isLoading}
             className="bg-purple-600 hover:bg-purple-500 text-white p-3 rounded-full shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             <svg className="w-6 h-6 transform rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
           </button>
        </form>

      </div>
    </div>
  );
};

export default ChatBot;