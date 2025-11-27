import { useState } from 'react';
import axios from 'axios';

// TypeScript Interface (The "Industry Standard" way to type API responses)
interface Match {
    metadata: {
        map: string;
        game_start_patched: string;
    };
    players: {
        all_players: Array<{
            name: string;
            character: string;
            stats: {
                score: number;
                kills: number;
                deaths: number;
            };
        }>;
    };
}

function App() {
    const [matches, setMatches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchMatches = async () => {
        setLoading(true);
        try {
            // Call YOUR server, not external API directly
            const response = await axios.get('http://localhost:5000/api/history/YourName/YourTag');
            setMatches(response.data.data); // Adjust based on actual API shape
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-10">
            <button onClick={fetchMatches} className="bg-red-500 text-white px-4 py-2 rounded">
                Load Matches
            </button>

            <div className="mt-5 grid gap-4">
                {loading ? <p>Loading...</p> : matches.map((match, idx) => (
                    <div key={idx} className="border p-4 rounded shadow bg-gray-800 text-white">
                        <h3 className="font-bold text-xl">{match.metadata.map}</h3>
                        <p>{match.metadata.game_start_patched}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default App;