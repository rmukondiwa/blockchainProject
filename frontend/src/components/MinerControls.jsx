import { useCallback, useEffect, useRef, useState } from "react";

export default function MinerControls({miners, onMinerUpdate }) {
  const [newMinerName, setNewMinerName] = useState("");
  const [newMinerRate, setNewMinerRate] = useState(1000);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const loadingRef = useRef(false);

  // Fetch miners with debounce
  const loadMiners = useCallback(async () => {
    if (loadingRef.current) return;
    
    loadingRef.current = true;
    try {
      const res = await fetch("http://127.0.0.1:5001/api/miners");
      const data = await res.json();
      const list = data.data.miners;
      console.log("Loaded miners:", list);
      onMinerUpdate(list);
    } catch (error) {
      console.error("Failed to load miners:", error);
      setError("Failed to connect to backend");
    } finally {
      loadingRef.current = false;
    }
  }, [onMinerUpdate]);

  useEffect(() => {
    loadMiners();
    const interval = setInterval(loadMiners, 3000); // Increased to 3s to reduce conflicts
    return () => clearInterval(interval);
  }, [loadMiners]);

  async function addMiner() {
    if (!newMinerName.trim()) {
      setError("Miner name is required");
      return;
    }
    
    if (isAdding) return; // Prevent double-clicks
    
    setIsAdding(true);
    setError("");
    
    try {
      const response = await fetch("http://127.0.0.1:5001/api/miners/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: newMinerName.trim(),
          hashRate: Number(newMinerRate) || 1000
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        setError(result.error || "Failed to add miner");
        console.error("Failed to add miner:", result);
        return;
      }

      console.log("Miner added successfully:", result);
      
      // Clear form
      setNewMinerName("");
      setNewMinerRate(1000);
      
      // Force immediate reload
      await loadMiners();
      
    } catch (error) {
      console.error("Failed to add miner:", error);
      setError("Network error: Could not connect to backend");
    } finally {
      setTimeout(() => setIsAdding(false), 500);
    }
  }

  async function deleteMiner(id) {
    try {
      await fetch("http://127.0.0.1:5001/api/miners/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      await loadMiners();
    } catch (error) {
      console.error("Failed to delete miner:", error);
    }
  }

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
      {/* Controls Header */}
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
        ⚙️ Miner Controls
      </h2>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Add Miner UI */}
      <div className="space-y-3">
        <input
          value={newMinerName}
          onChange={(e) => setNewMinerName(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
          placeholder="Miner Name (e.g., Miner Zeta)"
        />

        <input
          type="number"
          value={newMinerRate}
          onChange={(e) => setNewMinerRate(e.target.value)}
          className="w-full p-3 rounded-xl bg-white/10 border border-white/20 text-white"
          placeholder="Hash Rate (H/s)"
        />

        <button
          onClick={addMiner}
          disabled={isAdding}
          className={`w-full ${isAdding ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-500'} text-white py-3 rounded-xl font-semibold transition-colors`}
        >
          {isAdding ? "Adding..." : "+ Add Miner Node"}
        </button>
      </div>

      {/* Miner List */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4 text-white">
          Active Miners ({miners.length})
        </h3>

        <div className="space-y-4">
          {miners.map((miner) => (
            <div
              key={miner.id}
              className="p-4 bg-white/5 rounded-xl border border-white/10 flex justify-between"
            >
              <div>
                <p className="text-white font-semibold">{miner.id}</p>
                <p className="text-sm text-gray-400">Hash Rate: {miner.hashRate} H/s</p>
                <p className="text-sm text-gray-400">Blocks: {miner.blocks}</p>
              </div>

              <button
                onClick={() => deleteMiner(miner.id)}
                className="text-red-400 hover:text-red-300 text-xl"
              >
                🗑
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}