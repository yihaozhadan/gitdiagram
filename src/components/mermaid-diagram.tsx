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
      theme: "default",
      htmlLabels: true,
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
