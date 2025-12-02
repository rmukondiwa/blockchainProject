import { useState } from "react";
import BlockchainStats from "../components/BlockchainStats";
import MinerControls from "../components/MinerControls";
import MinerNetworkGraph from "../components/MinerNetworkGraph";
import useMinerAutoMine from "../hooks/useMinerAutoMine";

export default function Dashboard() {
    const [miners, setMiners] = useState([]);

    useMinerAutoMine(miners);
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-bgDark to-bgDeep text-white p-10">
        <div className="max-w-[1500px] mx-auto">
      {/* HEADER */}
      <header className="mb-10 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-accentAqua to-accentPurple bg-clip-text text-transparent drop-shadow-glowPurple">
          Hydro - Blockchain Miner Network Simulation Dashboard
        </h1>
        <p className="mt-3 text-gray-300 text-lg">
          Real-time distributed mining network visualization and analytics
        </p>
      </header>
    
      {/* MAIN GRID */}
      <div className="grid grid-cols-3 gap-10">

        {/* LEFT SIDE — Miner Controls + Stats */}
        <div className="col-span-1 space-y-8">
          <MinerControls miners={miners} onMinerUpdate={setMiners} />
          <BlockchainStats />
        </div>
        
        {/* Graph Left */}
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-xl shadow-black/40">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-semibold">Network Topology</h2>
            <div className="flex items-center gap-2 text-accentGreen">
              <span className="w-3 h-3 bg-accentGreen rounded-full animate-pulse"></span>
              {miners.length} Active Miners
            </div>
          </div>

          <MinerNetworkGraph />
        </div>
      </div>
      </div>
    </div>
  );
}
