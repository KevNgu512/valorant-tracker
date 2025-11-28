import type { MatchData } from '../types';

interface MatchCardProps {
  match: MatchData;
  playerName: string;
  onClick: () => void;
}

export const MatchCard = ({ match, playerName, onClick }: MatchCardProps) => {
  const player = match.players.all_players.find(
    (p) => p.name.toLowerCase() === playerName.toLowerCase()
  );

  if (!player) return null;

  const teamColor = player.team ? (player.team.toLowerCase() as 'red' | 'blue') : 'red';
  const teamData = match.teams?.[teamColor];
  const isDeathmatch = match.metadata.mode === 'Deathmatch';
  const isWin = isDeathmatch ? false : (teamData?.has_won ?? false); 

  const gradientBg = isDeathmatch 
    ? 'bg-gradient-to-r from-gray-800/90 to-gray-900/90 border-l-gray-400'
    : isWin 
      ? 'bg-gradient-to-r from-emerald-900/40 to-emerald-900/10 border-l-emerald-400' 
      : 'bg-gradient-to-r from-red-900/40 to-red-900/10 border-l-val-red';
  
  const textColor = isDeathmatch ? 'text-gray-400' : isWin ? 'text-emerald-400' : 'text-val-red';
  const resultText = isDeathmatch ? 'DEATHMATCH' : isWin ? 'VICTORY' : 'DEFEAT';

  // --- UPDATED LOGIC HERE ---
  // Use currenttier if it exists, otherwise default to 0 (Unranked)
  const tierId = player.currenttier ?? 0;
  const rankIconUrl = `https://media.valorant-api.com/competitivetiers/03621f52-342b-cf4e-4f86-9350a49c6d04/${tierId}/largeicon.png`;

  return (
    <div 
      onClick={onClick}
      className={`
        relative flex items-center justify-between p-4 mb-4 rounded-r-xl border-l-4 
        ${gradientBg} 
        backdrop-blur-md shadow-lg 
        cursor-pointer 
        transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl hover:brightness-110
        group overflow-visible
      `}
    >
      <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-r-xl" />

      <div className="flex items-center gap-5 relative z-10">
        <div className="relative">
            <img 
                src={player.assets.agent.small || 'https://via.placeholder.com/50'} 
                alt={player.character} 
                className="w-14 h-14 rounded-full border-2 border-white/10 shadow-md object-cover group-hover:border-white/30 transition-colors bg-gray-900" 
            />
            
            {/* Always render rank icon now */}
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-gray-900/90 rounded-full p-1 border border-white/10 shadow-sm backdrop-blur-sm flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <img 
                    src={rankIconUrl} 
                    alt={player.currenttier_patched || 'Unranked'} 
                    title={player.currenttier_patched || 'Unranked'} 
                    className="w-full h-full object-contain" 
                />
            </div>
        </div>

        <div>
            <h3 className={`font-black text-xl uppercase tracking-wider ${textColor} drop-shadow-sm`}>
                {resultText}
            </h3>
            <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mt-0.5">
                <span className="bg-white/5 px-2 py-0.5 rounded text-gray-300 uppercase tracking-widest border border-white/5">
                    {match.metadata.map}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-400">{match.metadata.mode}</span>
            </div>
            <p className="text-gray-600 text-[10px] mt-1 font-mono tracking-tight">
                {match.metadata.game_start_patched}
            </p>
        </div>
      </div>

      <div className="text-right relative z-10">
        <div className="text-3xl font-black text-white leading-none tracking-tight drop-shadow-md">
            {player.stats.kills}
            <span className="text-gray-600 text-xl font-medium mx-1.5">/</span>
            <span className="text-val-red">{player.stats.deaths}</span>
            <span className="text-gray-600 text-xl font-medium mx-1.5">/</span>
            {player.stats.assists}
        </div>
        <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">
            KDA Ratio
        </div>
      </div>
    </div>
  );
};