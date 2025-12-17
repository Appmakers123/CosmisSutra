import React, { useEffect, useRef, useState } from 'react';

interface AdBannerProps {
  variant?: 'leaderboard' | 'box' | 'sticky-footer';
  className?: string;
  slotId?: string; 
}

const AdBanner: React.FC<AdBannerProps> = ({ variant = 'leaderboard', className = '', slotId = '4090023827' }) => {
  const adRef = useRef<HTMLModElement>(null);
  const clientId = "ca-pub-3559865379099936";
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Prevent multiple pushes for the same component instance
    if (isLoaded) return;

    let intervalId: any = null;

    const tryPushAd = () => {
        if (adRef.current) {
             // Check if element is visible and has width to prevent "No slot size for availableWidth=0"
             // This happens often in SPAs when tabs are switched or content loads dynamically
             const { offsetWidth } = adRef.current;
             
             // We generally need a non-zero width.
             if (offsetWidth > 0) {
                 try {
                    // @ts-ignore
                    const adsbygoogle = window.adsbygoogle || [];
                    adsbygoogle.push({});
                    setIsLoaded(true); // Mark as loaded
                    return true;
                 } catch (e) {
                    console.error("AdSense push failed:", e);
                 }
             }
        }
        return false;
    };

    // Try immediately
    if (!tryPushAd()) {
        // If not ready (width=0), poll every 300ms for up to 5 seconds
        intervalId = setInterval(() => {
            if (tryPushAd()) {
                clearInterval(intervalId);
            }
        }, 300);

        // Safety timeout to clear interval
        setTimeout(() => {
            if (intervalId) clearInterval(intervalId);
        }, 5000);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [slotId, isLoaded]); 

  if (!isVisible) return null;

  if (variant === 'sticky-footer') {
    return (
      <div 
        className="fixed bottom-0 left-0 w-full z-50 bg-slate-900/95 border-t border-slate-700 flex justify-center animate-fade-in-up shadow-[0_-5px_20px_rgba(0,0,0,0.5)]"
        style={{ maxHeight: '20vh', minHeight: '60px' }}
      >
           <div className="w-full max-w-[728px] relative flex items-center justify-center">
             {/* Close Button */}
             <button 
                onClick={() => setIsVisible(false)}
                className="absolute -top-3 right-2 bg-slate-800 text-slate-400 hover:text-white rounded-full p-1 border border-slate-600 shadow-lg z-[60] hover:scale-110 transition-transform"
                title="Close Ad"
             >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>

             <div className="w-full h-full overflow-hidden flex items-center justify-center">
                <ins 
                  ref={adRef}
                  className="adsbygoogle"
                  style={{ display: 'block', width: '100%', height: 'auto', maxHeight: '20vh' }}
                  data-ad-client={clientId}
                  data-ad-slot={slotId}
                  data-ad-format="horizontal"
                  data-full-width-responsive="true"
                ></ins>
             </div>
           </div>
      </div>
    );
  }

  // Standard Responsive Unit (CosmicSutra Ad 1)
  return (
    <div className={`flex justify-center my-6 ${className}`}>
      {/* Container helps with CLS by reserving minimum space */}
      <div className="w-full max-w-[1200px] bg-slate-800/20 rounded-lg min-h-[100px] flex items-center justify-center text-center relative overflow-hidden">
           <span className="absolute top-1 right-2 text-[10px] text-slate-600 uppercase tracking-wider">Advertisement</span>
           <ins 
             ref={adRef}
             className="adsbygoogle"
             style={{ display: 'block', width: '100%' }}
             data-ad-client={clientId}
             data-ad-slot={slotId}
             data-ad-format="auto"
             data-full-width-responsive="true"
           ></ins>
      </div>
    </div>
  );
};

export default AdBanner;