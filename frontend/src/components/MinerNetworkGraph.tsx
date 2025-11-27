import { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

interface MinerNode {
  id: string;
  label: string;
  hashRate: number;
  blocks: number;
}

export default function MinerNetworkGraph() {
  const [graphData, setGraphData] = useState<any>({
    nodes: [],
    links: []
  });

  useEffect(() => {
    // Fake sample graph — replace with live backend data later
    setGraphData({
      nodes: [
        { id: "Miner Alpha", hashRate: 1200, blocks: 15 },
        { id: "Miner Beta", hashRate: 1800, blocks: 23 },
        { id: "Miner Gamma", hashRate: 950, blocks: 11 },
        { id: "Miner Delta", hashRate: 1500, blocks: 18 },
        { id: "Miner Epsilon", hashRate: 2100, blocks: 28 },
      ],
      links: [
        { source: "Miner Alpha", target: "Miner Delta" },
        { source: "Miner Beta", target: "Miner Delta" },
        { source: "Miner Gamma", target: "Miner Delta" },
        { source: "Miner Epsilon", target: "Miner Delta" },
      ]
    });
  }, []);

  return (
    <div className="h-[650px]">
      <ForceGraph2D
        graphData={graphData}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = `${node.id}\n⚡ ${node.hashRate} H/s\n🔑 ${node.blocks} blocks`;
          const fontSize = 6 / globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = "#fff";
          ctx.fillText(label, node.x + 8, node.y + 8);
        }}
        nodeAutoColorBy="id"
        linkColor={() => "rgba(255,255,255,0.2)"}
      />
    </div>
  );
}
