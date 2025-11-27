import axios from "axios";
import { useEffect, useState } from "react";

export default function BlockchainStats() {
  const [stats, setStats] = useState<any>({});

  useEffect(() => {
    async function load() {
      const supplyRes = await axios.get("/api/supply");
      const diffRes = await axios.get("/api/difficulty");
      const chainRes = await axios.get("/api/chain");

      setStats({
        difficulty: diffRes.data.data.current_difficulty,
        chainLength: chainRes.data.data.length,
        avgBlockTime: diffRes.data.data.average_block_time,
        minersOnline: 5,
        totalSupply: supplyRes.data.data.current_supply,
        remainingSupply: supplyRes.data.data.remaining_supply,
      });
    }
    load();
  }, []);

  const card = (title: string, value: any, color: string) => (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-3">
      <div className="text-gray-300">{title}</div>
      <div className={`text-3xl font-bold text-${color}-400`}>
        {value}
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-xl mb-4 font-semibold">Blockchain State</h2>

      {card("Current Difficulty", stats.difficulty, "pink")}
      {card("Chain Length", stats.chainLength, "cyan")}
      {card("Avg Block Time (s)", stats.avgBlockTime, "green")}
      {card("Miners Online", stats.minersOnline, "yellow")}
      {card("Total Supply", stats.totalSupply, "red")}
      {card("Remaining Supply", stats.remainingSupply, "blue")}
    </div>
  );
}
