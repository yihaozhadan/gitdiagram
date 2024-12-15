"use client";

import { useEffect } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
}

const MermaidChart = ({ chart }: MermaidChartProps) => {
  useEffect(() => {
    mermaid.initialize({ startOnLoad: true });
    mermaid.contentLoaded();
  }, []);

  return <div className="mermaid">{chart}</div>;
};

export default MermaidChart;
