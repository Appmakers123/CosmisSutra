
import React, { useState } from 'react';
import { User, Language } from '../types';
import { useTranslation } from '../utils/translations';
import Logo from './Logo';

interface AuthModalProps {
  onLogin: (user: User) => void;
  onClose: () => void;
  language: Language;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose, language }) => {
  const t = useTranslation(language);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    // Simulate generic Google Auth
    setTimeout(() => {
        const mockUser: User = {
          id: '12345',
          name: 'Cosmic Traveler',
          email: 'traveler@gmail.com',
          karma: 10,
        };
        onLogin(mockUser);
        onClose();
        setIsLoading(false);
    }, 1000);
  };

  const handleSimulatedLogin = () => {
    const mockUser: User = {
      id: '12345',
      name: email.split('@')[0] || 'Seeker',
      email: email,
      karma: 5,
    };
    onLogin(mockUser);
    onClose();
  };

  const handleGuestLogin = () => {
    const guestUser: User = {
      id: 'guest',
      name: 'Guest',
      email: '',
      isGuest: true,
      karma: 5,
    };
    onLogin(guestUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/95 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-800 border-2 border-amber-500/30 rounded-[2.5rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden">
        
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl"></div>

        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center mb-10">
           <div className="flex justify-center mb-6">
             <Logo className="w-20 h-20" />
           </div>
           <h2 className="text-3xl font-serif text-white mb-3">{t.loginTitle}</h2>
           <p className="text-slate-400 text-sm leading-relaxed px-4">{t.loginSubtitle}</p>
        </div>

        <div className="space-y-6">
          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 bg-white text-slate-900 font-bold py-4 rounded-2xl hover:bg-slate-100 transition-all shadow-xl active:scale-95 disabled:opacity-50"
          >
            {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent animate-spin rounded-full"></div>
            ) : (
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
            )}
            {t.continueWithGoogle}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-slate-700"></div>
            <span className="flex-shrink-0 mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Or Secure Login</span>
            <div className="flex-grow border-t border-slate-700"></div>
          </div>

          <div className="space-y-4">
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.emailPlaceholder}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-slate-200 focus:outline-none focus:border-amber-500 transition-all placeholder-slate-600"
            />
            <button 
              onClick={handleSimulatedLogin}
              disabled={!email || isLoading}
              className="w-full bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95"
            >
              {t.loginButton}
            </button>
          </div>
          
          <button onClick={handleGuestLogin} className="w-full text-center text-slate-500 hover:text-amber-500 text-xs font-bold uppercase tracking-widest transition-colors mt-4">
             {t.guestAccess}
          </button>
        </div>

        <p className="mt-8 text-[9px] text-center text-slate-600 uppercase tracking-widest leading-relaxed">
            By signing in, you agree to our terms of cosmic service and spiritual growth.
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
