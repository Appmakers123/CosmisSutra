import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { ZODIAC_SIGNS } from '../constants';

const Logo: React.FC<{ className?: string }> = ({ className = "w-16 h-16" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className} group`}>
      {/* Glow Effect */}
      <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full group-hover:bg-amber-400/40 transition-all duration-1000"></div>
      
      {/* Background Ring Border */}
      <div className="absolute inset-0 rounded-full border border-amber-500/30"></div>

      {/* Rotating Zodiac Wheel (Outer Layer) */}
      <div className="absolute inset-0 animate-[spin_60s_linear_infinite]">
        {/* Inner dashed ring for aesthetics */}
        <div className="absolute inset-[15%] rounded-full border border-amber-500/10 border-dashed"></div>

        {ZODIAC_SIGNS.map((sign, i) => {
          const angle = (i * 360) / 12;
          return (
            <div
              key={sign.id}
              className="absolute inset-0"
              style={{ transform: `rotate(${angle}deg)` }}
            >
               {/* 
                 Icon placed at the top edge (outer ring).
               */}
               <div className="absolute top-[2%] left-1/2 -translate-x-1/2 w-[12%] h-[12%] text-amber-500">
                  {sign.symbol}
               </div>
            </div>
          );
        })}
      </div>

      {/* Central Static Sun */}
      <div className="relative z-10 w-[45%] h-[45%] text-amber-300 drop-shadow-[0_0_10px_rgba(251,191,36,0.8)]">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
            <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.061-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
        </svg>
      </div>
    </div>
  );
};

export const downloadLogo = () => {
  const size = 512;
  const center = size / 2;
  const sunSize = size * 0.45;
  const zodiacRadius = size * 0.42; // Distance from center to zodiac icon center
  const zodiacIconSize = size * 0.08;

  // Helper to render React Node to static SVG string
  const renderIcon = (node: React.ReactNode) => {
    // Basic stripping of React specific props if needed, but renderToStaticMarkup handles most
    const str = ReactDOMServer.renderToStaticMarkup(node as React.ReactElement);
    // Extract inner content of SVG if wrapper exists, or use as is
    // Our constants have IconWrapper which is an SVG. We need the path data mostly.
    // Hack: remove <svg...> wrapper and keep content, or just nest svgs. Nesting is safer.
    return str.replace(/^<svg[^>]*>|<\/svg>$/g, '');
  };

  const zodiacsSvg = ZODIAC_SIGNS.map((sign, i) => {
    const angleDeg = (i * 360) / 12;
    // We rotate the group around the center
    return `
      <g transform="rotate(${angleDeg}, ${center}, ${center})">
        <g transform="translate(${center - zodiacIconSize/2}, ${center - zodiacRadius - zodiacIconSize/2})">
           <svg width="${zodiacIconSize}" height="${zodiacIconSize}" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
             ${renderIcon(sign.symbol)}
           </svg>
        </g>
      </g>
    `;
  }).join('');

  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <style>
      .spin { animation: spin 60s linear infinite; transform-origin: center; }
      @keyframes spin { 100% { transform: rotate(360deg); } }
    </style>
  </defs>
  
  <!-- Background (Optional, dark slate) -->
  <rect width="${size}" height="${size}" fill="#0f172a" rx="64" />
  
  <!-- Outer Glow -->
  <circle cx="${center}" cy="${center}" r="${size*0.48}" fill="#f59e0b" fill-opacity="0.1" />

  <!-- Rotating Zodiac Ring -->
  <g class="spin">
    <!-- Ring Border -->
    <circle cx="${center}" cy="${center}" r="${size*0.48}" fill="none" stroke="#f59e0b" stroke-opacity="0.3" stroke-width="2" />
    <circle cx="${center}" cy="${center}" r="${size*0.35}" fill="none" stroke="#f59e0b" stroke-opacity="0.1" stroke-width="1" stroke-dasharray="10 10" />
    ${zodiacsSvg}
  </g>

  <!-- Central Sun -->
  <g transform="translate(${center - sunSize/2}, ${center - sunSize/2})">
    <svg width="${sunSize}" height="${sunSize}" viewBox="0 0 24 24" fill="#fcd34d">
      <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.166a.75.75 0 00-1.06-1.06l-1.591 1.59a.75.75 0 101.06 1.061l1.591-1.59zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.834 18.894a.75.75 0 001.061-1.06l-1.59-1.591a.75.75 0 10-1.061 1.06l1.59 1.591zM12 18a.75.75 0 01.75.75V21a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM7.758 17.303a.75.75 0 00-1.061-1.06l-1.591 1.59a.75.75 0 001.06 1.061l1.591-1.59zM6 12a.75.75 0 01-.75.75H3a.75.75 0 010-1.5h2.25A.75.75 0 016 12zM6.697 7.757a.75.75 0 001.06-1.06l-1.59-1.591a.75.75 0 00-1.061 1.06l1.59 1.591z" />
    </svg>
  </g>
</svg>
  `.trim();

  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'cosmic-sutra-logo.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export default Logo;