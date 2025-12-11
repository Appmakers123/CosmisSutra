import React from 'react';
import { PlanetaryPosition, Language } from '../types';
import { translatePlanet } from '../constants';

interface NorthIndianChartProps {
  planets: PlanetaryPosition[];
  ascendantSignId: number;
  language: Language;
}

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ planets, ascendantSignId, language }) => {
  // North Indian Chart uses fixed House positions.
  // House 1 is always Top Diamond.
  // The Number written in the house depends on the Ascendant.
  // If Ascendant is Aries (1), House 1 has '1'.
  // If Ascendant is Taurus (2), House 1 has '2'.

  // Helper to calculate Sign ID for a given House (1-12) based on Ascendant
  const getSignForHouse = (houseNum: number) => {
    // formula: (Asc + house - 1 - 1) % 12 + 1
    // The extra -1 is for zero-based index logic
    return ((ascendantSignId + houseNum - 2) % 12) + 1;
  };

  const getHouseContent = (houseNum: number) => {
    const signId = getSignForHouse(houseNum);
    
    // Find planets in this HOUSE
    // Note: In North Chart, planets are placed in the House they occupy. 
    // The Input `planets` array has `house` property. 
    const planetsInHouse = planets.filter(p => p.house === houseNum);

    return {
      signId,
      planets: planetsInHouse
    };
  };

  // SVG Coordinates for House Labels (Sign Number) and Planets
  // Using a 400x400 viewBox
  const houseConfig = [
    { id: 1,  x: 200, y: 80,  labelX: 200, labelY: 130 }, // Top Diamond (Center)
    { id: 2,  x: 100, y: 30,  labelX: 80,  labelY: 20 },  // Top Left
    { id: 3,  x: 30,  y: 100, labelX: 20,  labelY: 80 },  // Top Left Corner
    { id: 4,  x: 80,  y: 200, labelX: 130, labelY: 200 }, // Left Diamond (Center)
    { id: 5,  x: 30,  y: 300, labelX: 20,  labelY: 320 }, // Bottom Left Corner
    { id: 6,  x: 100, y: 370, labelX: 80,  labelY: 380 }, // Bottom Left
    { id: 7,  x: 200, y: 320, labelX: 200, labelY: 270 }, // Bottom Diamond (Center)
    { id: 8,  x: 300, y: 370, labelX: 320, labelY: 380 }, // Bottom Right
    { id: 9,  x: 370, y: 300, labelX: 380, labelY: 320 }, // Bottom Right Corner
    { id: 10, x: 320, y: 200, labelX: 270, labelY: 200 }, // Right Diamond (Center)
    { id: 11, x: 370, y: 100, labelX: 380, labelY: 80 },  // Top Right Corner
    { id: 12, x: 300, y: 30,  labelX: 320, labelY: 20 },  // Top Right
  ];

  return (
    <div className="w-full max-w-[400px] mx-auto aspect-square bg-slate-900 border-2 border-amber-600/50 rounded-lg shadow-2xl overflow-hidden relative">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-700/50" strokeWidth="2">
        {/* Outer Box */}
        <rect x="0" y="0" width="400" height="400" fill="none" />
        
        {/* Diagonals */}
        <line x1="0" y1="0" x2="400" y2="400" />
        <line x1="0" y1="400" x2="400" y2="0" />
        
        {/* Inner Diamond (Midpoints) */}
        <line x1="200" y1="0" x2="0" y2="200" />
        <line x1="0" y1="200" x2="200" y2="400" />
        <line x1="200" y1="400" x2="400" y2="200" />
        <line x1="400" y1="200" x2="200" y2="0" />

        {/* Render House Content */}
        {houseConfig.map((h) => {
          const content = getHouseContent(h.id);
          return (
            <g key={h.id}>
              {/* Sign Number */}
              <text 
                x={h.labelX} 
                y={h.labelY} 
                fill="#94a3b8" 
                fontSize="14" 
                fontWeight="bold" 
                textAnchor="middle" 
                alignmentBaseline="middle"
                className="font-mono"
              >
                {content.signId}
              </text>

              {/* Planets */}
              <g transform={`translate(${h.x - 20}, ${h.y - 15})`}>
                 {content.planets.map((p, idx) => {
                    // Translate planet name, then take first 2 chars
                    const shortName = translatePlanet(p.planet, language).substring(0, 2);
                    return (
                        <text 
                        key={idx}
                        x={20}
                        y={idx * 12}
                        fill={p.planet.includes('Sun') ? '#fcd34d' : p.planet.includes('Moon') ? '#e2e8f0' : '#fbbf24'}
                        fontSize="10"
                        fontWeight="600"
                        textAnchor="middle"
                        >
                        {shortName}
                        </text>
                    );
                 })}
              </g>
            </g>
          );
        })}
      </svg>
      {/* Label Overlay */}
       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10">
          <span className="text-4xl font-serif text-amber-500">
             {language === 'hi' ? 'उत्तर' : 'North'}
          </span>
       </div>
    </div>
  );
};

export default NorthIndianChart;