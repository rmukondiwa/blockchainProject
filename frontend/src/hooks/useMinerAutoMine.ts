import { useEffect } from "react";

export default function useMinerAutoMine(miners: any[]) {
  useEffect(() => {
    if (!miners || miners.length === 0) return;

    function tick() {
      miners.forEach((miner: any) => {
        // Mining probability = hashRate / 5000 (tweak as needed)
        const probability = Math.min(miner.hashRate / 5000, 0.9);

        // Decide if this miner finds a block
        if (Math.random() < probability) {
          fetch("http://127.0.0.1:5001/api/mine_with_rate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              miner: miner.id,
              hash_rate: miner.hashRate,
            })
          }).catch(() => {});
        }
      });
    }

    tick();
    const interval = setInterval(tick, 1000); // run every second

    return () => clearInterval(interval);
  }, [miners]);
}