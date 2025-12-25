import type { MatchData, Player } from '../types';

interface MatchDetailsProps {
  match: MatchData;
  onClose: () => void;
}

export const MatchDetails = ({ match, onClose }: MatchDetailsProps) => {
  const isDeathmatch = match.metadata.mode === 'Deathmatch';
  const rounds = match.metadata.rounds_played;

  // Sort players by Combat Score (High to Low)
  const redTeam = match.players.all_players
    .filter((p) => p.team === 'Red')
    .sort((a, b) => b.stats.score - a.stats.score);

  const blueTeam = match.players.all_players
    .filter((p) => p.team === 'Blue')
    .sort((a, b) => b.stats.score - a.stats.score);
  
  const allPlayers = match.players.all_players.sort((a, b) => b.stats.kills - a.stats.kills);

  // --- STATS CALCULATION HELPER ---
  const calculateStats = (player: Player) => {
    // ACS: Total Score / Rounds
    const acs = Math.round(player.stats.score / rounds);

    // HS%: Headshots / Total Shots
    const totalShots = player.stats.headshots + player.stats.bodyshots + player.stats.legshots;
    const hsPercent = totalShots > 0 
        ? Math.round((player.stats.headshots / totalShots) * 100) 
        : 0;

    return { acs, hsPercent };
  };

  // --- ROW COMPONENT ---
  const PlayerRow = ({ player }: { player: Player }) => {
    const tierId = player.currenttier ?? 0;
    const rankIconUrl = `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;
    
    const { acs, hsPercent } = calculateStats(player);

    // Color code HS% (Green if > 20%, Gray otherwise)
    const hsColor = hsPercent >= 20 ? 'text-[#00c49a]' : 'text-gray-500';

    return (
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        {/* Agent & Rank */}
        <td className="p-3">
          <div className="flex items-center gap-3">
            <img 
              src={player.assets.agent.small || 'https://via.placeholder.com/36'} 
              className="w-9 h-9 rounded-full border border-gray-600 bg-gray-900" 
              alt={player.character} 
              title={player.character}
            />
            <div className="w-8 h-8 flex items-center justify-center bg-gray-900/50 rounded-full p-1 border border-white/5">
              <img 
                src={rankIconUrl} 
                className="w-full h-full object-contain"
                alt={player.currenttier_patched || 'Unranked'} 
                title={player.currenttier_patched || 'Unranked'}
              />
            </div>
          </div>
        </td>

        {/* Name */}
        <td className="p-3 font-medium text-white">
          <div className="flex flex-col leading-tight">
            <span>{player.name}</span>
            <span className="text-gray-500 text-xs">#{player.tag}</span>
          </div>
        </td>
        
        {/* Core Stats */}
        <td className="p-3 text-center text-white font-mono font-bold text-lg" title="Average Combat Score">{acs}</td>
        <td className="p-3 text-center text-gray-300 font-mono font-bold">{player.stats.kills}</td>
        <td className="p-3 text-center text-red-400 font-mono font-bold">{player.stats.deaths}</td>
        <td className="p-3 text-center text-gray-400 font-mono font-bold">{player.stats.assists}</td>
        
        {/* HS% (Now the only advanced stat) */}
        <td className={`p-3 text-center font-mono font-bold hidden sm:table-cell ${hsColor}`} title="Headshot %">
            {hsPercent}%
        </td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#0f1923] border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-[#1f2b35] p-4 flex justify-between items-center border-b border-gray-700 z-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">{match.metadata.map}</h2>
            <p className="text-gray-400 text-sm font-mono">
                {match.metadata.mode} • {match.metadata.game_start_patched} • <span className="text-white">{rounds} Rounds</span>
            </p>
          </div>
          
          {!isDeathmatch && match.teams && (
            <div className="text-4xl font-black flex gap-4 drop-shadow-lg">
              <span className="text-[#00c49a]">{match.teams.blue?.rounds_won ?? 0}</span>
              <span className="text-gray-600">:</span>
              <span className="text-[#ff4655]">{match.teams.red?.rounds_won ?? 0}</span>
            </div>
          )}

          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-white transition text-xl px-4">
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 space-y-8">
          {isDeathmatch ? (
             /* Deathmatch Table */
             <table className="w-full text-left border-collapse">
               <thead className="text-xs uppercase text-gray-500 font-bold bg-white/5">
                 <tr>
                   <th className="p-3 pl-4">Agent / Rank</th>
                   <th className="p-3">Player</th>
                   <th className="p-3 text-center">Score</th>
                   <th className="p-3 text-center">K</th>
                   <th className="p-3 text-center">D</th>
                   <th className="p-3 text-center">A</th>
                 </tr>
               </thead>
               <tbody>
                 {allPlayers.map((p) => <PlayerRow key={p.puuid} player={p} />)}
               </tbody>
             </table>
          ) : (
            <>
              {/* Blue Team */}
              <div>
                <h3 className="text-[#00c49a] font-bold uppercase mb-2 tracking-widest text-sm px-2 flex justify-between">
                    <span>Blue Team {match.teams?.blue?.has_won && '👑'}</span>
                    <span className="text-xs opacity-60">Defenders</span>
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs uppercase text-gray-500 font-bold bg-[#00c49a]/10 border-b border-[#00c49a]/20">
                    <tr>
                      <th className="p-3 pl-4 w-32">Agent / Rank</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-center" title="Average Combat Score">ACS</th>
                      <th className="p-3 text-center">K</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">A</th>
                      <th className="p-3 text-center hidden sm:table-cell" title="Headshot Percentage">HS%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueTeam.map((p) => <PlayerRow key={p.puuid} player={p} />)}
                  </tbody>
                </table>
              </div>

              {/* Red Team */}
              <div>
                <h3 className="text-[#ff4655] font-bold uppercase mb-2 tracking-widest text-sm px-2 flex justify-between">
                    <span>Red Team {match.teams?.red?.has_won && '👑'}</span>
                    <span className="text-xs opacity-60">Attackers</span>
                </h3>
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs uppercase text-gray-500 font-bold bg-[#ff4655]/10 border-b border-[#ff4655]/20">
                    <tr>
                      <th className="p-3 pl-4 w-32">Agent / Rank</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-center">ACS</th>
                      <th className="p-3 text-center">K</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">A</th>
                      <th className="p-3 text-center hidden sm:table-cell">HS%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {redTeam.map((p) => <PlayerRow key={p.puuid} player={p} />)}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};