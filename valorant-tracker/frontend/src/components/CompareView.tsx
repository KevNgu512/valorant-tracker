import { useEffect, useState } from 'react';
import { getGeminiAnalysis } from '../api'; // Import the API function

interface CompareStats {
  name: string;
  rank: string;
  rankRR: number;
  acs: number;
  kd: number;
  winRate: number;
  hs: number;
  img: string;
  role: string;
}

interface CompareViewProps {
  p1: CompareStats;
  p2: CompareStats;
  onClose: () => void;
}

export const CompareView = ({ p1, p2, onClose }: CompareViewProps) => {
  const [winner, setWinner] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Call Gemini when the component mounts
    const fetchAnalysis = async () => {
        try {
            setLoading(true);
            const result = await getGeminiAnalysis(p1, p2);
            setWinner(result.winner);
            setReason(result.reason);
        } catch (err: any) {
            setError(err.response?.data?.error || "AI is taking a break. Try again in 5s.");
        } finally {
            setLoading(false);
        }
    };

    fetchAnalysis();
  }, [p1, p2]);

  const StatRow = ({ label, v1, v2, unit = '' }: any) => {
    const isBetter1 = v1 > v2;
    const isBetter2 = v2 > v1;
    
    return (
      <div className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
        <span className={`font-mono font-bold w-1/4 text-center text-lg ${isBetter1 ? 'text-[#00c49a]' : 'text-gray-500'}`}>
            {v1}{unit}
        </span>
        <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest w-2/4 text-center">
            {label}
        </span>
        <span className={`font-mono font-bold w-1/4 text-center text-lg ${isBetter2 ? 'text-[#00c49a]' : 'text-gray-500'}`}>
            {v2}{unit}
        </span>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-[#1f2b35] border border-gray-600 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="bg-[#ff4655] p-4 text-center relative shadow-lg z-10">
            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter flex items-center justify-center gap-2">
                <span className="text-white">AI Analysis</span> 
                {loading && <span className="text-sm font-normal normal-case opacity-75 animate-pulse">(Analyzing...)</span>}
            </h2>
            <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white p-2 rounded transition">✕</button>
        </div>

        {/* LOADING STATE */}
        {loading ? (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <div className="w-12 h-12 border-4 border-[#ff4655] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-400 font-mono text-sm animate-pulse">Consulting the strategy book...</p>
            </div>
        ) : error ? (
            <div className="p-10 text-center text-red-400 font-mono">
                {error}
            </div>
        ) : (
            <>
                {/* PLAYERS HERO */}
                <div className="flex justify-between items-center p-8 bg-gradient-to-b from-[#1f2b35] to-[#0f1923]">
                    {/* P1 */}
                    <div className="text-center w-1/3 group">
                        <div className="relative inline-block">
                            <img src={p1.img} className={`w-28 h-28 mx-auto object-contain drop-shadow-lg transition-transform duration-500 ${winner === p1.name ? 'scale-110' : 'opacity-60 grayscale scale-90'}`} />
                            {winner === p1.name && <div className="absolute -top-4 -right-4 text-4xl animate-bounce">👑</div>}
                        </div>
                        <h3 className="text-2xl font-black text-white mt-4 leading-none">{p1.name}</h3>
                        <div className="flex justify-center gap-2 mt-2">
                            <span className="bg-[#ff4655]/20 text-[#ff4655] text-[10px] font-bold px-2 py-1 rounded uppercase border border-[#ff4655]/30">{p1.role}</span>
                            <span className="text-gray-400 font-mono text-sm self-center">{p1.rank}</span>
                        </div>
                    </div>

                    {/* VS */}
                    <div className="text-center w-1/3 flex flex-col items-center">
                        <div className="text-7xl font-black text-gray-800 italic opacity-50 select-none">VS</div>
                        {winner && (
                            <div className="mt-4 bg-[#00c49a] text-black px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-in zoom-in duration-300 shadow-[0_0_20px_rgba(0,196,154,0.4)]">
                                Coach Picks: {winner}
                            </div>
                        )}
                    </div>

                    {/* P2 */}
                    <div className="text-center w-1/3 group">
                        <div className="relative inline-block">
                            <img src={p2.img} className={`w-28 h-28 mx-auto object-contain drop-shadow-lg transition-transform duration-500 ${winner === p2.name ? 'scale-110' : 'opacity-60 grayscale scale-90'}`} />
                            {winner === p2.name && <div className="absolute -top-4 -right-4 text-4xl animate-bounce">👑</div>}
                        </div>
                        <h3 className="text-2xl font-black text-white mt-4 leading-none">{p2.name}</h3>
                        <div className="flex justify-center gap-2 mt-2">
                            <span className="bg-[#ff4655]/20 text-[#ff4655] text-[10px] font-bold px-2 py-1 rounded uppercase border border-[#ff4655]/30">{p2.role}</span>
                            <span className="text-gray-400 font-mono text-sm self-center">{p2.rank}</span>
                        </div>
                    </div>
                </div>

                {/* ANALYSIS TEXT */}
                <div className="p-6 bg-[#0f1923] border-y border-gray-700 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#ff4655]"></div>
                    <p className="text-gray-300 italic text-lg font-medium leading-relaxed">
                        <span className="text-[#ff4655] font-bold not-italic mr-2">COACH SAYS:</span>
                        "{reason}"
                    </p>
                </div>

                {/* STATS TABLE */}
                <div className="p-6 overflow-y-auto bg-[#1f2b35]">
                    <StatRow label="Win Rate" v1={p1.winRate} v2={p2.winRate} unit="%" />
                    <StatRow label="K/D Ratio" v1={p1.kd} v2={p2.kd} />
                    <StatRow label="Avg ACS" v1={p1.acs} v2={p2.acs} />
                    <StatRow label="Headshot %" v1={p1.hs} v2={p2.hs} unit="%" />
                </div>
            </>
        )}
      </div>
    </div>
  );
};