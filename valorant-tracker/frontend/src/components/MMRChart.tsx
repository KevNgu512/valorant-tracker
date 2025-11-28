import { useState } from 'react';

interface MMRData {
  currenttier_patched: string;
  ranking_in_tier: number;
  mmr_change_to_last_game: number;
  date: string;
}

interface MMRChartProps {
  data: MMRData[];
}

export const MMRChart = ({ data }: MMRChartProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 1. Process Data
  // We take the last 20 games and reverse them so they go Left -> Right
  const chartData = [...data].reverse().map(item => ({
    ...item,
    val: Number(item.ranking_in_tier || 0),
    dateLabel: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }));

  // 2. Chart Dimensions
  const height = 200;
  const width = 600;
  const padding = 20;
  const maxVal = 100; // RR goes from 0 to 100

  // 3. Helper to calculate coordinates
  const getX = (index: number) => {
    return (index / (chartData.length - 1)) * (width - padding * 2) + padding;
  };

  const getY = (value: number) => {
    // Invert Y because SVG 0 is at the top
    return height - ((value / maxVal) * (height - padding * 2)) - padding;
  };

  // 4. Generate the Line Path
  const points = chartData.map((d, i) => `${getX(i)},${getY(d.val)}`).join(' ');

  return (
    <div className="bg-[#1f2b35] p-6 rounded-xl border border-gray-700 shadow-lg mb-8">
      <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-6 flex items-center gap-2">
        <span className="w-1 h-4 bg-[#ff4655] rounded-full"></span>
        Competitive Performance (Last 20 Games)
      </h3>

      <div className="relative w-full overflow-x-auto pb-4">
        {/* SVG Container */}
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full min-w-[600px]"
          style={{ overflow: 'visible' }}
        >
          {/* Background Grid Lines (0, 50, 100 RR) */}
          {[0, 25, 50, 75, 100].map((tick) => (
             <g key={tick}>
               <line 
                 x1={padding} y1={getY(tick)} 
                 x2={width - padding} y2={getY(tick)} 
                 stroke="#ffffff10" 
                 strokeWidth="1" 
                 strokeDasharray="4 4"
               />
               <text x={0} y={getY(tick) + 4} fill="#6b7280" fontSize="10" textAnchor="start">
                 {tick}
               </text>
             </g>
          ))}

          {/* The Main Line */}
          <polyline 
            fill="none" 
            stroke="#ff4655" 
            strokeWidth="3" 
            points={points} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          />

          {/* Dots for each game */}
          {chartData.map((d, i) => (
            <g key={i}>
              {/* Invisible Hit Area for easier hovering */}
              <rect
                x={getX(i) - 10}
                y={0}
                width={20}
                height={height}
                fill="transparent"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              />
              
              {/* Visible Dot */}
              <circle
                cx={getX(i)}
                cy={getY(d.val)}
                r={hoveredIndex === i ? 6 : 4}
                fill="#1f2b35"
                stroke={hoveredIndex === i ? '#fff' : '#ff4655'}
                strokeWidth="2"
                className="transition-all duration-200 pointer-events-none"
              />
            </g>
          ))}
        </svg>

        {/* Custom Tooltip (HTML overlay) */}
        {hoveredIndex !== null && chartData[hoveredIndex] && (
          <div 
            className="absolute top-0 bg-[#0f1923] border border-gray-500 p-3 rounded shadow-xl backdrop-blur-md pointer-events-none z-10 w-40"
            style={{ 
              left: `${(hoveredIndex / (chartData.length - 1)) * 100}%`,
              transform: 'translateX(-50%) translateY(20px)' 
            }}
          >
            <p className="text-gray-400 text-xs mb-1">{chartData[hoveredIndex].dateLabel}</p>
            <p className="text-white font-bold text-sm">{chartData[hoveredIndex].currenttier_patched}</p>
            <p className="text-[#ff4655] font-mono font-bold text-lg">
              {chartData[hoveredIndex].val} RR
            </p>
            <p className={`text-xs font-bold mt-1 ${chartData[hoveredIndex].mmr_change_to_last_game >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {chartData[hoveredIndex].mmr_change_to_last_game >= 0 ? '+' : ''}
              {chartData[hoveredIndex].mmr_change_to_last_game} RR
            </p>
          </div>
        )}
      </div>
    </div>
  );
};