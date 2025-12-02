import { useEffect, useRef } from "react";

export default function useMinerAutoMine(miners: any[]) {
  const minersRef = useRef(miners);
  const miningInProgress = useRef<Set<string>>(new Set());

  // Keep miners ref updated without triggering effect
  useEffect(() => {
    minersRef.current = miners;
  }, [miners]);

  useEffect(() => {
    async function tick() {
      const currentMiners = minersRef.current;
      
      if (!currentMiners || currentMiners.length === 0) return;

      // Process miners concurrently
      const miningPromises = currentMiners.map(async (miner: any) => {
        // Skip if already mining
        if (miningInProgress.current.has(miner.id)) {
          return;
        }

        // Mining probability based on hash rate
        const probability = Math.min(miner.hashRate / 5000, 0.9);

        // Decide if this miner finds a block
        if (Math.random() < probability) {
          miningInProgress.current.add(miner.id);
          
          try {
            const response = await fetch("http://127.0.0.1:5001/api/mine_with_rate", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                miner: miner.id,
                hash_rate: miner.hashRate,
              })
            });

            if (!response.ok) {
              console.warn(`Mining failed for ${miner.id}: ${response.statusText}`);
            } else {
              const result = await response.json();
              if (result.success) {
                console.log(`⛏️ Block mined by ${miner.id}!`);
              }
            }
          } catch (error) {
            console.error(`Mining error for ${miner.id}:`, error);
          } finally {
            miningInProgress.current.delete(miner.id);
          }
        }
      });

      // Wait for all mining attempts to complete
      await Promise.allSettled(miningPromises);
    }

    // Start mining immediately
    tick();
    const interval = setInterval(tick, 1000); // run every second

    return () => {
      clearInterval(interval);
      miningInProgress.current.clear();
    };
  }, []); // Only run once on mount
}