import type { MatchData } from '../types';

interface MatchCardProps {
  match: MatchData;
  playerName: string;
}

export const MatchCard = ({ match, playerName }: MatchCardProps) => {
  // 1. Find the player
  const player = match.players.all_players.find(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (!player) return null;

  // 2. Safe Team Logic
  // Convert team to lowercase safely (Deathmatch sometimes returns null team)
  const teamColor = player.team ? (player.team.toLowerCase() as 'red' | 'blue') : 'red';
  
  // 3. Determine Win/Loss safely
  // If it's Deathmatch, 'teams' might be empty or missing the specific color.
  // We use optional chaining (?.) to prevent the crash.
  const teamData = match.teams?.[teamColor];
  
  // If no team data (Deathmatch), we default to false or check generic win status
  // For simplicity, if it's Deathmatch, we might just show "COMPLETED" or handle differently.
  const isDeathmatch = match.metadata.mode === 'Deathmatch';
  const isWin = isDeathmatch ? false : (teamData?.has_won ?? false); 

  // 4. Styling Logic
  // If Deathmatch, use Gray/Neutral colors instead of Red/Green
  let borderColor = isWin ? 'border-l-emerald-400' : 'border-l-red-500';
  let bgColor = isWin ? 'bg-emerald-900/20' : 'bg-red-900/20';
  let resultText = isWin ? 'VICTORY' : 'DEFEAT';
  let resultTextColor = isWin ? 'text-emerald-400' : 'text-red-400';

  if (isDeathmatch) {
    borderColor = 'border-l-gray-400';
    bgColor = 'bg-gray-800';
    resultText = 'DEATHMATCH';
    resultTextColor = 'text-gray-400';
  }

  return (
    <div className={`relative flex items-center justify-between p-4 mb-3 rounded bg-gray-800 border-l-4 ${borderColor} ${bgColor} shadow-lg transition hover:scale-[1.01]`}>
      
      {/* Left: Agent & Map Info */}
      <div className="flex items-center gap-4">
        <div className="relative">
            {/* Some modes don't have agents (like some special events), fallback to ? */}
            <img 
                src={player.assets.agent.small || 'https://via.placeholder.com/50'} 
                alt={player.character} 
                className="w-12 h-12 rounded-full border border-gray-600 object-cover" 
            />
            <span className="absolute bottom-0 right-0 text-xs bg-black/80 px-1 rounded text-gray-300">
                {player.currenttier_patched || 'Unranked'}
            </span>
        </div>

        <div>
            <h3 className={`font-bold text-lg ${resultTextColor} tracking-wider`}>
                {resultText}
            </h3>
            <p className="text-gray-400 text-sm font-medium">
                {match.metadata.map} • <span className="text-gray-500">{match.metadata.mode}</span>
            </p>
            <p className="text-gray-600 text-xs mt-1">{match.metadata.game_start_patched}</p>
        </div>
      </div>

      {/* Right: KDA Stats */}
      <div className="text-right">
        <div className="text-2xl font-bold text-white">
            {player.stats.kills} / <span className="text-red-400">{player.stats.deaths}</span> / {player.stats.assists}
        </div>
        <div className="text-sm text-gray-400">
            KDA Ratio
        </div>
      </div>
    </div>
  );
};