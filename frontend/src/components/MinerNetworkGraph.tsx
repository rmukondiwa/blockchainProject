import { useEffect, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";

export default function MinerNetworkGraph() {
  const fgRef = useRef<any>(null);
  const [graphData, setGraphData] = useState<any>({ nodes: [], links: [] });

  // 🚀 Fetch miners every second
  useEffect(() => {
    function loadMiners() {
      fetch("http://127.0.0.1:5001/api/miners")
        .then(res => res.json())
        .then(data => {
          const miners = data?.data?.miners || [];

          // Build nodes dynamically
          const nodes = miners.map((m: any, index: number) => ({
            id: m.id,
            hashRate: m.hashRate,
            blocks: m.blocks,
            color: pickColor(index),
            // Auto-position (spread in circle)
            fx: Math.cos((index / miners.length) * 2 * Math.PI) * 150,
            fy: Math.sin((index / miners.length) * 2 * Math.PI) * 150
          }));

          // Simple hub links: everyone links to first node
          const links =
            miners.length > 1
              ? miners
                  .slice(1)
                  .map((m: any) => ({ source: miners[0].id, target: m.id }))
              : [];

          setGraphData({ nodes, links });
        });
    }

    loadMiners();
    const interval = setInterval(loadMiners, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-[600px]">
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        backgroundColor="rgba(0,0,0,0)"
        linkColor={() => "rgba(255,255,255,0.2)"}
        nodeCanvasObject={(node: any, ctx, globalScale) => drawNode(node, ctx, globalScale)}
      />
    </div>
  );
}

// 🎨 Color palette
function pickColor(i: number) {
  const colors = [
    "#3bc7d4", "#8b5cf6", "#ff3cac", "#fbdc4e", "#56f59d", "#64a1ff"
  ];
  return colors[i % colors.length];
}

// 🎨 Node drawing
function drawNode(node: any, ctx: any, globalScale: number) {
  const label = `${node.id}\n⚡ ${node.hashRate} H/s\n🧱 ${node.blocks} blocks`;
  const fontSize = 8
  ctx.font = `${fontSize}px Inter`;

  const lines = label.split("\n");
  const longest = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const padding = 4;
  const boxWidth = longest + padding * 2;
  const boxHeight = lines.length * (fontSize + 2) + padding;

  const x = node.x - boxWidth / 2;
  const y = node.y - boxHeight / 2;

  // Glow box
  ctx.fillStyle = `${node.color}22`;
  ctx.shadowBlur = 18;
  ctx.shadowColor = node.color;

  roundRect(ctx, x, y, boxWidth, boxHeight, 8);
  ctx.fill();

  ctx.shadowBlur = 0;
  ctx.fillStyle = "white";

  lines.forEach((line, i) => {
    ctx.fillText(line, node.x - longest / 2, y + padding + (i + 1) * (fontSize + 2));
  });
}

// Rounded rectangle helper
function roundRect(ctx: any, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
