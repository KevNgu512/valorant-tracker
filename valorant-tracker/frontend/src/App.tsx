import { useState } from 'react';
import { getMatchHistory } from './api';
import { MatchCard } from './components/MatchCard';
import type { MatchData } from './types';

// --- 1. Simple Popup Component ---
const ErrorPopup = ({ message, onClose }: { message: string, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">
    <div className="bg-[#1f2b35] border border-[#ff4655] p-8 rounded-lg max-w-sm w-full shadow-2xl text-center transform transition-all scale-100">
      {/* Icon */}
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/50 mb-4">
        <svg className="h-6 w-6 text-[#ff4655]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      
      {/* Title */}
      <h3 className="text-xl font-bold text-white mb-2">Notice</h3>
      
      {/* Message */}
      <p className="text-gray-300 mb-6">{message}</p>
      
      {/* Button */}
      <button 
        onClick={onClose}
        className="w-full bg-[#ff4655] hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Return to Search
      </button>
    </div>
  </div>
);

function App() {
  const [name, setName] = useState('Tarik');
  const [tag, setTag] = useState('NA1');
  const [region, setRegion] = useState('na');
  const [matches, setMatches] = useState<MatchData[]>([]);
  const [loading, setLoading] = useState(false);

  // --- 2. New State for Popup ---
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState('');
  const [error, setError] = useState(''); // Keep this for generic errors

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setShowPopup(false); // Reset popup
    setMatches([]);

    try {
      const data = await getMatchHistory(name, tag, region);
      setMatches(data);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch matches.';
      
      // --- 3. Check for specific backend message ---
      if (errorMsg === "NOT_ENOUGH_GAMES") {
        setPopupMsg("This player exists, but hasn't played enough recent games to be tracked. Please ask them to play a match!");
        setShowPopup(true);
      } else {
        // Fallback for normal errors (like Typo)
        setError(errorMsg); 
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f1923] text-white p-6 md:p-12 font-sans selection:bg-red-500 selection:text-white relative">
      
      {/* --- 4. Render Popup if state is true --- */}
      {showPopup && (
        <ErrorPopup 
          message={popupMsg} 
          onClose={() => setShowPopup(false)} 
        />
      )}

      <div className={`max-w-4xl mx-auto transition-opacity ${showPopup ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
        
        <header className="mb-10 text-center">
            <h1 className="text-5xl font-extrabold text-[#ff4655] uppercase tracking-tighter mb-2">
                VALORANT <span className="text-white">STATS</span>
            </h1>
            <p className="text-gray-400">Check Match History & Performance</p>
        </header>

        <form onSubmit={handleSearch} className="bg-gray-800 p-6 rounded-lg shadow-xl border border-gray-700 flex flex-col md:flex-row gap-4 mb-10">
            <select 
                value={region} 
                onChange={(e) => setRegion(e.target.value)}
                className="bg-[#1f2b35] text-white p-3 rounded border border-gray-600 focus:border-[#ff4655] outline-none font-bold"
            >
                <option value="na">NA</option>
                <option value="eu">EU</option>
                <option value="ap">Asia</option>
                <option value="kr">Korea</option>
            </select>

            <input 
                type="text" 
                placeholder="Name" 
                className="bg-[#1f2b35] flex-grow p-3 rounded text-white border border-gray-600 focus:border-[#ff4655] outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
            <div className="flex items-center text-gray-500 font-bold">#</div>
            <input 
                type="text" 
                placeholder="TAG" 
                className="bg-[#1f2b35] w-24 p-3 rounded text-white border border-gray-600 focus:border-[#ff4655] outline-none"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
            />

            <button 
                type="submit"
                disabled={loading}
                className="bg-[#ff4655] hover:bg-red-600 disabled:bg-gray-600 text-white font-bold py-3 px-8 rounded transition-all"
            >
                {loading ? 'LOADING...' : 'SEARCH'}
            </button>
        </form>

        {error && (
            <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded text-center mb-8">
                {error}
            </div>
        )}

        <div className="space-y-4">
            {matches.map((match, index) => (
                <MatchCard key={index} match={match} playerName={name} />
            ))}
        </div>
      </div>
    </div>
  );
}

export default App;