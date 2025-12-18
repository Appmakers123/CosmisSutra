
import React from 'react';
import { PlanetaryPosition, Language } from '../types';
import { translatePlanet } from '../constants';

interface NorthIndianChartProps {
  planets: PlanetaryPosition[];
  ascendantSignId: number;
  language: Language;
}

const NorthIndianChart: React.FC<NorthIndianChartProps> = ({ planets = [], ascendantSignId, language }) => {
  const getSignForHouse = (houseNum: number) => {
    return ((ascendantSignId + houseNum - 2) % 12) + 1;
  };

  const getHouseContent = (houseNum: number) => {
    const signId = getSignForHouse(houseNum);
    const planetsInHouse = (planets || []).filter(p => p.signId === signId);
    return { signId, planets: planetsInHouse };
  };

  const houseConfig = [
    { id: 1,  x: 200, y: 110, labelX: 200, labelY: 155 },
    { id: 2,  x: 100, y: 60,  labelX: 80,  labelY: 30 },
    { id: 3,  x: 50,  y: 110, labelX: 30,  labelY: 90 },
    { id: 4,  x: 110, y: 200, labelX: 155, labelY: 200 },
    { id: 5,  x: 50,  y: 290, labelX: 30,  labelY: 310 },
    { id: 6,  x: 100, y: 340, labelX: 80,  labelY: 370 },
    { id: 7,  x: 200, y: 290, labelX: 200, labelY: 245 },
    { id: 8,  x: 300, y: 340, labelX: 320, labelY: 370 },
    { id: 9,  x: 350, y: 290, labelX: 370, labelY: 310 },
    { id: 10, x: 290, y: 200, labelX: 245, labelY: 200 },
    { id: 11, x: 350, y: 110, labelX: 370, labelY: 90 },
    { id: 12, x: 300, y: 60,  labelX: 320, labelY: 30 },
  ];

  return (
    <div className="w-full max-w-[450px] aspect-square bg-slate-950 border-4 border-amber-900/40 rounded-xl shadow-2xl relative">
      <svg viewBox="0 0 400 400" className="w-full h-full stroke-amber-500/20" strokeWidth="1.5">
        <line x1="0" y1="0" x2="400" y2="400" />
        <line x1="0" y1="400" x2="400" y2="0" />
        <line x1="200" y1="0" x2="0" y2="200" />
        <line x1="0" y1="200" x2="200" y2="400" />
        <line x1="200" y1="400" x2="400" y2="200" />
        <line x1="400" y1="200" x2="200" y2="0" />

        {houseConfig.map((h) => {
          const content = getHouseContent(h.id);
          return (
            <g key={h.id}>
              <text x={h.labelX} y={h.labelY} fill="#64748b" fontSize="12" fontWeight="900" textAnchor="middle" className="font-mono">{content.signId}</text>
              <g transform={`translate(${h.x - 20}, ${h.y - 15})`}>
                 {content.planets.map((p, idx) => (
                    <text key={idx} x={20} y={idx * 13} fill={p.planet.includes('Sun') ? '#fbbf24' : '#e2e8f0'} fontSize="10" fontWeight="bold" textAnchor="middle">
                        {translatePlanet(p.planet, language).substring(0, 2)}
                        {p.isRetrograde ? ' (R)' : ''}
                    </text>
                 ))}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default NorthIndianChart;
