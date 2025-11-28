import type { MatchData, Player } from '../types';

interface MatchDetailsProps {
  match: MatchData;
  onClose: () => void;
}

export const MatchDetails = ({ match, onClose }: MatchDetailsProps) => {
  const isDeathmatch = match.metadata.mode === 'Deathmatch';

  const redTeam = match.players.all_players
    .filter((p) => p.team === 'Red')
    .sort((a, b) => b.stats.score - a.stats.score);

  const blueTeam = match.players.all_players
    .filter((p) => p.team === 'Blue')
    .sort((a, b) => b.stats.score - a.stats.score);
  
  const allPlayers = match.players.all_players.sort((a, b) => b.stats.kills - a.stats.kills);

  // --- UPDATED PLAYER ROW ---
  const PlayerRow = ({ player }: { player: Player }) => {
    const tierId = player.currenttier ?? 0;
    const rankIconUrl = `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;

    return (
      <tr className="border-b border-white/5 hover:bg-white/5 transition-colors">
        {/* First Column: Agent & Rank Side-by-Side */}
        <td className="p-3">
          <div className="flex items-center gap-3"> {/* flex container with gap */}
            
            {/* Agent Icon */}
            <img 
              src={player.assets.agent.small || 'https://via.placeholder.com/36'} 
              className="w-9 h-9 rounded-full border border-gray-600 bg-gray-900" 
              alt={player.character} 
              title={player.character}
            />
            
            {/* Rank Icon (Now a separate element next to the agent) */}
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

        {/* Player Name Column */}
        <td className="p-3 font-medium text-white">
          <div className="flex flex-col leading-tight">
            <span>{player.name}</span>
            <span className="text-gray-500 text-xs">#{player.tag}</span>
          </div>
        </td>
        
        {/* Stats Columns */}
        <td className="p-3 text-center text-gray-300 font-mono">{player.stats.score}</td>
        <td className="p-3 text-center font-bold text-white font-mono">{player.stats.kills}</td>
        <td className="p-3 text-center text-red-400 font-mono">{player.stats.deaths}</td>
        <td className="p-3 text-center text-gray-400 font-mono">{player.stats.assists}</td>
      </tr>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
      <div className="bg-[#0f1923] border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl shadow-2xl relative" onClick={(e) => e.stopPropagation()}>
        
        <div className="sticky top-0 bg-[#1f2b35] p-4 flex justify-between items-center border-b border-gray-700 z-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider">{match.metadata.map}</h2>
            <p className="text-gray-400 text-sm">{match.metadata.mode} • {match.metadata.game_start_patched}</p>
          </div>
          
          {!isDeathmatch && match.teams && (
            <div className="text-3xl font-black flex gap-4">
              <span className="text-[#00c49a]">{match.teams.blue?.rounds_won ?? 0}</span>
              <span className="text-gray-600">:</span>
              <span className="text-[#ff4655]">{match.teams.red?.rounds_won ?? 0}</span>
            </div>
          )}

          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 p-2 rounded text-white transition">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-8">
          {isDeathmatch ? (
             <table className="w-full text-left border-collapse">
               <thead className="text-xs uppercase text-gray-500 font-bold bg-white/5">
                 <tr>
                   <th className="p-3 pl-4">Agent / Rank</th> {/* Updated Header Text */}
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
              {/* Blue Team Table */}
              <div>
                <h3 className="text-[#00c49a] font-bold uppercase mb-2 tracking-widest text-sm px-2">Blue Team {match.teams?.blue?.has_won && '👑'}</h3>
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs uppercase text-gray-500 font-bold bg-[#00c49a]/10">
                    <tr>
                      <th className="p-3 pl-4 w-32">Agent / Rank</th> {/* Wider column for two icons */}
                      <th className="p-3">Player</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3 text-center">K</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">A</th>
                    </tr>
                  </thead>
                  <tbody>
                    {blueTeam.map((p) => <PlayerRow key={p.puuid} player={p} />)}
                  </tbody>
                </table>
              </div>

              {/* Red Team Table */}
              <div>
                <h3 className="text-[#ff4655] font-bold uppercase mb-2 tracking-widest text-sm px-2">Red Team {match.teams?.red?.has_won && '👑'}</h3>
                <table className="w-full text-left border-collapse">
                  <thead className="text-xs uppercase text-gray-500 font-bold bg-[#ff4655]/10">
                    <tr>
                      <th className="p-3 pl-4 w-32">Agent / Rank</th>
                      <th className="p-3">Player</th>
                      <th className="p-3 text-center">Score</th>
                      <th className="p-3 text-center">K</th>
                      <th className="p-3 text-center">D</th>
                      <th className="p-3 text-center">A</th>
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