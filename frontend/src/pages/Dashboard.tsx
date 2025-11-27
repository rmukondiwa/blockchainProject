import BlockchainStats from "../components/BlockchainStats";
import MinerNetworkGraph from "../components/MinerNetworkGraph";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f24] to-[#111b44] text-white p-8">
      <header className="mb-10">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          Hylo - Blockchain Miner Network Simulation Dashboard
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          Real-time distributed mining network visualization and analytics
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <MinerNetworkGraph />
        </div>

        <div className="col-span-1 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
          <BlockchainStats />
        </div>
      </div>
    </div>
  );
}
