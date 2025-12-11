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

  useEffect(() => {
    // Prevent multiple pushes for the same component instance
    if (isLoaded) return;

    let intervalId: any = null;

    const tryPushAd = () => {
        if (adRef.current) {
             // Check if element is visible and has width
             const { offsetWidth } = adRef.current;
             // We need a non-zero width for responsive ads to work
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

        // Safety timeout
        setTimeout(() => {
            if (intervalId) clearInterval(intervalId);
        }, 5000);
    }

    return () => {
        if (intervalId) clearInterval(intervalId);
    };
  }, [slotId, isLoaded]); 

  if (variant === 'sticky-footer') {
    return (
      <div className="fixed bottom-0 left-0 w-full z-50 bg-slate-900/95 border-t border-slate-700 p-2 flex justify-center animate-fade-in-up shadow-lg min-h-[60px]">
           <div className="w-full max-w-[728px] h-[50px] flex items-center justify-center relative overflow-hidden">
             <ins 
               ref={adRef}
               className="adsbygoogle"
               style={{ display: 'inline-block', width: '728px', height: '50px' }}
               data-ad-client={clientId}
               data-ad-slot={slotId}
             ></ins>
           </div>
      </div>
    );
  }

  // Standard Responsive Unit
  return (
    <div className={`flex justify-center my-6 ${className}`}>
      {/* 
         Constraint container: 
         - min-height ensures layout stability 
         - w-full ensures it takes available space 
      */}
      <div className="w-full max-w-[1200px] bg-slate-800/20 rounded-lg min-h-[100px] flex items-center justify-center text-center relative overflow-hidden">
           <span className="absolute top-1 right-2 text-[10px] text-slate-600 uppercase tracking-wider">Advertisement</span>
           <ins 
             ref={adRef}
             className="adsbygoogle"
             style={{ display: 'block', width: '100%', minHeight: '90px' }}
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