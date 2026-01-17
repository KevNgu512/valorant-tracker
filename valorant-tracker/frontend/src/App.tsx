import { useState } from 'react';
import { MatchCard } from './components/MatchCard';
import { MatchDetails } from './components/MatchDetails';
import { getMatchHistory, getMMRHistory } from './api';
import { MMRChart } from './components/MMRChart';
import { CompareView } from './components/CompareView';
import type { MatchData } from './types';

// --- AGENT ROLE MAPPING ---
// Used to determine playstyle context for the AI Judge
const AGENT_ROLES: Record<string, string> = {
  // Duelists
  Jett: 'Duelist', Reyna: 'Duelist', Phoenix: 'Duelist', Raze: 'Duelist', 
  Yoru: 'Duelist', Neon: 'Duelist', Iso: 'Duelist',
  // Initiators
  Sova: 'Initiator', Breach: 'Initiator', Skye: 'Initiator', 'KAY/O': 'Initiator', 
  Fade: 'Initiator', Gekko: 'Initiator',
  // Controllers
  Omen: 'Controller', Brimstone: 'Controller', Viper: 'Controller', Astra: 'Controller', 
  Harbor: 'Controller', Clove: 'Controller',
  // Sentinels
  Sage: 'Sentinel', Cypher: 'Sentinel', Killjoy: 'Sentinel', Chamber: 'Sentinel', 
  Deadlock: 'Sentinel', Vyse: 'Sentinel'
};

// --- Error Popup Component ---
const ErrorPopup = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-[#1f2b35] border border-[#ff4655] p-8 rounded-lg max-w-sm w-full shadow-2xl text-center">
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
        <svg className="h-6 w-6 text-[#ff4655]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Notice</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <button onClick={onClose} className="w-full bg-[#ff4655] hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition">
        Return to Search
      </button>
    </div>
  </div>
);

function App() {
  // --- PLAYER 1 STATE ---
  const [name, setName] = useState('Tarik');
  const [tag, setTag] = useState('NA1');
  const [region, setRegion] = useState('na');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [mmrHistory, setMmrHistory] = useState<any[]>([]);
  
  // --- PLAYER 2 STATE (COMPARE MODE) ---
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [name2, setName2] = useState('');
  const [tag2, setTag2] = useState('');
  const [matches2, setMatches2] = useState<MatchData[]>([]);
  const [mmrHistory2, setMmrHistory2] = useState<any[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  // --- UI STATE ---
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<MatchData | null>(null);

  // --- STATS CALCULATION HELPER ---
  const calculatePlayerStats = (matchData: MatchData[], mmrData: any[], playerName: string) => {
    if (!matchData.length) return null;

    let totalKills = 0, totalDeaths = 0;
    let totalScore = 0, totalRounds = 0;
    let totalShots = 0, totalHeadshots = 0;
    let wins = 0, validGames = 0;
    
    // Agent Frequency Tracking
    const agentCounts: Record<string, number> = {};

    matchData.forEach(match => {
        const p = match.players.all_players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
        if (!p) return;

        // 1. Count Agent
        if (p.character) {
            agentCounts[p.character] = (agentCounts[p.character] || 0) + 1;
        }

        totalKills += p.stats.kills;
        totalDeaths += p.stats.deaths;

        // Skip Deathmatch for specialized stats
        if (match.metadata.mode !== 'Deathmatch') {
             totalScore += p.stats.score;
             totalRounds += match.metadata.rounds_played;
             totalShots += (p.stats.headshots + p.stats.bodyshots + p.stats.legshots);
             totalHeadshots += p.stats.headshots;

             const teamColor = p.team?.toLowerCase() as 'red' | 'blue';
             if (teamColor && match.teams?.[teamColor]?.has_won) wins++;
             validGames++;
        }
    });

    // 2. Determine Main Role
    let mostPlayedAgent = 'Unknown';
    let maxCount = 0;
    Object.entries(agentCounts).forEach(([agent, count]) => {
        if (count > maxCount) {
            maxCount = count;
            mostPlayedAgent = agent;
        }
    });
    const mainRole = AGENT_ROLES[mostPlayedAgent] || 'Flex';

    // 3. Calculate Averages
    const avgACS = totalRounds ? Math.round(totalScore / totalRounds) : 0;
    const avgKD = Number((totalKills / (totalDeaths || 1)).toFixed(2));
    const avgHS = totalShots ? Math.round((totalHeadshots / totalShots) * 100) : 0;
    const winRate = validGames ? Math.round((wins / validGames) * 100) : 0;

    const currentRank = mmrData.length > 0 ? mmrData[0] : null;
    const latestMatchPlayer = matchData[0]?.players.all_players.find(p => p.name.toLowerCase() === playerName.toLowerCase());
    
    const rankName = currentRank?.currenttier_patched || latestMatchPlayer?.currenttier_patched || 'Unranked';
    const rankRR = currentRank?.ranking_in_tier || 0;
    const tierId = currentRank?.currenttier || latestMatchPlayer?.currenttier || 0;
    const rankImg = `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;

    return { 
        name: playerName, 
        rank: rankName, 
        rankRR, 
        acs: avgACS, 
        kd: avgKD, 
        winRate, 
        hs: avgHS, 
        img: rankImg,
        role: mainRole, // <--- Used by AI Judge for context
        mostPlayedAgent
    };
  };

  const stats = calculatePlayerStats(matches, mmrHistory, name);
  const p2Stats = calculatePlayerStats(matches2, mmrHistory2, name2);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowPopup(false);
    
    setMatches([]); setMmrHistory([]);
    setMatches2([]); setMmrHistory2([]);

    try {
      // 1. Fetch Player 1 (Primary)
      const [m1, mmr1] = await Promise.all([
            getMatchHistory(name, tag, region),
            getMMRHistory(name, tag, region)
      ]);
      setMatches(m1);
      setMmrHistory(mmr1);

      // 2. Fetch Player 2 (If Compare Mode is Active)
      if (isCompareMode && name2 && tag2) {
          const [m2, mmr2] = await Promise.all([
             getMatchHistory(name2, tag2, region),
             getMMRHistory(name2, tag2, region)
          ]);
          setMatches2(m2);
          setMmrHistory2(mmr2);
          setShowCompareModal(true); // Open the AI Judge
      }

    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch data.';
      if (errorMsg === "NOT_ENOUGH_GAMES") {
        setPopupMsg("One of the players hasn't played enough recent games to be tracked.");
        setShowPopup(true);
      } else {
        setError("Failed to fetch matches. Check names and try again."); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-6 font-sans relative">
      
      {/* DETAILS MODAL */}
      {selectedMatch && (
        <MatchDetails match={selectedMatch} onClose={() => setSelectedMatch(null)} />
      )}

      {/* ERROR POPUP */}
      {showPopup && (
        <ErrorPopup message={popupMsg} onClose={() => setShowPopup(false)} />
      )}

      {/* AI JUDGE MODAL */}
      {showCompareModal && stats && p2Stats && (
        <CompareView p1={stats} p2={p2Stats} onClose={() => setShowCompareModal(false)} />
      )}

      <div className={`max-w-7xl mx-auto ${selectedMatch || showPopup || showCompareModal ? 'blur-sm pointer-events-none' : ''}`}> 
        
        {/* MAIN LAYOUT GRID: Left (Content) vs Right (History) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* --- LEFT COLUMN (Search, Stats, Chart) [Span 8] --- */}
            <div className="lg:col-span-8 space-y-8">
                
                {/* 1. Header & Search */}
                <div className="bg-[#1f2b35] p-6 rounded-2xl border border-gray-700 shadow-xl transition-all duration-300">
                    <header className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-extrabold text-[#ff4655] uppercase tracking-tighter leading-none">
                                VALORANT <span className="text-white">STATS</span>
                            </h1>
                            <p className="text-gray-400 text-xs mt-1">Player Analytics Dashboard</p>
                        </div>
                    </header>

                    <form onSubmit={handleSearch} className="flex flex-col gap-4">
                        {/* Top Row: Region + Player 1 */}
                        <div className="flex flex-col md:flex-row gap-3">
                            <select value={region} onChange={(e) => setRegion(e.target.value)} className="bg-[#0f1923] text-white p-3 rounded border border-gray-600 focus:border-[#ff4655] outline-none font-bold">
                                <option value="na">NA</option>
                                <option value="eu">EU</option>
                                <option value="ap">AP</option>
                                <option value="kr">KR</option>
                            </select>
                            
                            <div className="flex-grow flex gap-2">
                                <input type="text" placeholder="Name" className="bg-[#0f1923] flex-grow p-3 rounded text-white border border-gray-600 focus:border-[#ff4655] outline-none" value={name} onChange={(e) => setName(e.target.value)} />
                                <span className="flex items-center text-gray-500 font-bold px-1">#</span>
                                <input type="text" placeholder="TAG" className="bg-[#0f1923] w-24 p-3 rounded text-white border border-gray-600 focus:border-[#ff4655] outline-none" value={tag} onChange={(e) => setTag(e.target.value)} />
                            </div>

                            <button 
                                type="button" 
                                onClick={() => setIsCompareMode(!isCompareMode)}
                                className={`px-4 font-bold rounded transition border whitespace-nowrap ${isCompareMode ? 'bg-[#ff4655] text-white border-[#ff4655]' : 'bg-transparent text-gray-500 border-gray-600 hover:border-white hover:text-white'}`}
                            >
                                {isCompareMode ? 'REMOVE VS' : 'ADD VS'}
                            </button>

                            {!isCompareMode && (
                                <button type="submit" disabled={loading} className="bg-[#ff4655] hover:bg-red-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-all">
                                    {loading ? '...' : 'GO'}
                                </button>
                            )}
                        </div>

                        {/* Bottom Row: Player 2 Input (Only if VS mode is active) */}
                        {isCompareMode && (
                             <div className="flex flex-col md:flex-row gap-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-[72px] hidden md:block"></div> {/* Spacer for alignment */}
                                <div className="flex-grow flex gap-2 relative">
                                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 text-[#ff4655] font-black italic text-xl hidden md:block">VS</div>
                                    <input type="text" placeholder="Player 2 Name" className="bg-[#0f1923] flex-grow p-3 rounded text-white border border-gray-600 focus:border-[#ff4655] outline-none" value={name2} onChange={(e) => setName2(e.target.value)} />
                                    <span className="flex items-center text-gray-500 font-bold px-1">#</span>
                                    <input type="text" placeholder="TAG" className="bg-[#0f1923] w-24 p-3 rounded text-white border border-gray-600 focus:border-[#ff4655] outline-none" value={tag2} onChange={(e) => setTag2(e.target.value)} />
                                </div>
                                <button type="submit" disabled={loading} className="bg-[#ff4655] hover:bg-red-600 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded transition-all whitespace-nowrap">
                                    {loading ? 'Analyzing...' : 'COMPARE'}
                                </button>
                            </div>
                        )}
                    </form>
                    {error && <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-3 rounded text-center text-sm">{error}</div>}
                </div>

                {/* 2. Stats Banner (Rank + Grid) */}
                {stats && !loading && (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                        {/* Rank Card */}
                        <div className="bg-gradient-to-br from-[#1f2b35] to-[#0f1923] p-6 rounded-xl border border-gray-700 flex items-center gap-6 shadow-lg relative overflow-hidden group h-full">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff4655]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <img src={stats.img} alt="Rank" className="w-20 h-20 object-contain drop-shadow-lg group-hover:scale-110 transition-transform duration-300" />
                            <div className="z-10">
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Current Rank</p>
                                <h2 className="text-3xl font-black text-white leading-none mt-1">{stats.rank}</h2>
                                <p className="text-[#ff4655] font-mono font-bold mt-1 text-lg">{stats.rankRR} RR</p>
                                <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest bg-gray-800 text-gray-400 px-2 py-1 rounded">
                                    {stats.role} Main
                                </span>
                            </div>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-[#1f2b35] p-3 rounded-xl border border-gray-700 flex flex-col justify-center items-center">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">K/D Ratio</p>
                                <p className={`text-2xl font-black ${stats.kd >= 1 ? 'text-[#00c49a]' : 'text-red-400'}`}>{stats.kd}</p>
                            </div>
                            <div className="bg-[#1f2b35] p-3 rounded-xl border border-gray-700 flex flex-col justify-center items-center">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Win %</p>
                                <p className={`text-2xl font-black ${stats.winRate >= 50 ? 'text-[#00c49a]' : 'text-white'}`}>{stats.winRate}%</p>
                            </div>
                            <div className="bg-[#1f2b35] p-3 rounded-xl border border-gray-700 flex flex-col justify-center items-center">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Avg ACS</p>
                                <p className="text-2xl font-black text-white">{stats.acs}</p>
                            </div>
                            <div className="bg-[#1f2b35] p-3 rounded-xl border border-gray-700 flex flex-col justify-center items-center">
                                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Headshot %</p>
                                <p className="text-2xl font-black text-white">{stats.hs}%</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 3. MMR Chart */}
                {mmrHistory.length > 0 && (
                    <div className="animate-in slide-in-from-bottom-4 duration-700">
                        <MMRChart data={mmrHistory} />
                    </div>
                )}

                {/* 4. Empty State */}
                {!loading && matches.length === 0 && (
                    <div className="h-64 border-2 border-dashed border-gray-800 rounded-xl flex items-center justify-center text-gray-600 font-bold">
                        Search for a player to view stats
                    </div>
                )}
            </div>

            {/* --- RIGHT COLUMN (Match History) [Span 4] --- */}
            <div className="lg:col-span-4">
                <h3 className="text-white font-bold uppercase tracking-widest text-sm mb-4 flex items-center gap-2">
                    <span className="w-1 h-4 bg-[#ff4655] rounded-full"></span>
                    Recent Matches
                </h3>
                
                <div className="space-y-3">
                    {matches.map((match, index) => (
                        <MatchCard 
                        key={index} 
                        match={match} 
                        playerName={name}
                        onClick={() => setSelectedMatch(match)}
                        />
                    ))}
                    
                    {loading && Array(5).fill(0).map((_, i) => (
                        <div key={i} className="h-24 bg-[#1f2b35] rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}

export default App;