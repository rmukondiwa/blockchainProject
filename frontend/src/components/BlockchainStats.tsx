import { useEffect, useState } from "react";

export default function BlockchainStats() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    function loadStats() {
    fetch("http://127.0.0.1:5001/stats")   // <-- FIXED PORT
      .then(res => res.json())
      .then(data => {
        setStats(data.data ?? data);
      })
      .catch(err => console.error("Failed to load blockchain stats:", err));
    }

    loadStats(); // load immediately

    const interval = setInterval(loadStats, 1000);
    return () => clearInterval(interval); // cleanup on unmount  

    }, []);

  if (!stats) {
    return (
      <div className="bg-white/5 p-5 rounded-2xl border border-white/10">
        <h2 className="text-xl font-semibold mb-3">Blockchain State</h2>
        <p className="text-gray-400">Loading data...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/5 p-5 rounded-2xl border border-white/10 space-y-3">
      <h2 className="text-xl font-semibold mb-3">Blockchain State</h2>

      <Stat label="Current Difficulty" value={stats.difficulty} />
      <Stat label="Chain Length" value={stats.chainLength} />
      <Stat
        label="Avg Block Time"
        value={
          stats.avgBlockTime !== null && stats.avgBlockTime !== undefined
            ? stats.avgBlockTime + "s"
            : "N/A"
        }
      />
      <Stat label="Miners Online" value={stats.minersOnline} />
      <Stat label="Total Supply" value={stats.totalSupply} />
      <Stat label="Remaining Supply" value={stats.remainingSupply} />
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-lg font-semibold text-white">{value ?? "…"} </p>
    </div>
  );
}
