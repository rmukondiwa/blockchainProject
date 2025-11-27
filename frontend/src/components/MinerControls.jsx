import { useEffect, useState } from "react";

export default function MinerControls({ onMinerUpdate }) {
  const [miners, setMiners] = useState([]);
  const [newMinerName, setNewMinerName] = useState("");
  const [newMinerRate, setNewMinerRate] = useState(1000);

  // Fetch miners
  async function loadMiners() {
  fetch("http://127.0.0.1:5001/api/miners")
    .then(res => res.json())
    .then(data => {
      const list = data.data.miners;
      setMiners(list);        // <-- LOCAL STATE UPDATE (important)
      onMinerUpdate(list);    // <-- PARENT DASHBOARD UPDATE
    });
}

  useEffect(() => {
    loadMiners();
    const interval = setInterval(loadMiners, 2000);
    return () => clearInterval(interval);
  }, []);

  async function addMiner() {
    if (!newMinerName.trim()) return;

    await fetch("http://127.0.0.1:5001/api/miners/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: newMinerName,
        hashRate: Number(newMinerRate)
      })
    });

    setNewMinerName("");
    loadMiners();
  }

  async function deleteMiner(id) {
    await fetch("http://127.0.0.1:5001/api/miners/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });

    loadMiners();
  }

  return (
    <div className="bg-white/5 p-6 rounded-2xl border border-white/10 shadow-lg">
      {/* Controls Header */}
      <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-2">
        ⚙️ Miner Controls
      </h2>

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
          className="w-full bg-green-600 hover:bg-green-500 text-white py-3 rounded-xl font-semibold"
        >
          + Add Miner Node
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