"use client";

import { useEffect } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

const MermaidChart = ({ chart }: MermaidChartProps) => {
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: "neutral",
      htmlLabels: true,
      flowchart: {
        htmlLabels: true,
        curve: "basis",
        nodeSpacing: 50,
        rankSpacing: 50,
        padding: 15,
      },
      themeCSS: `
        .clickable {
          transition: transform 0.2s ease;
        }
        .clickable:hover {
          transform: scale(1.05);
          cursor: pointer;
        }
        .clickable:hover > * {
          filter: brightness(0.85);
        }
      `,
    });
    mermaid.contentLoaded();
  }, []);

  return (
    <div className="w-full max-w-full p-4">
      <div className="mermaid">{chart}</div>
    </div>
  );
};

export default MermaidChart;
