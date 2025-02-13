"use client";

import { useEffect, useRef } from "react";
import mermaid from "mermaid";
import svgPanZoom from "svg-pan-zoom";

interface MermaidChartProps {
  chart: string;
  zoomingEnabled?: boolean;
}

const MermaidChart = ({ chart, zoomingEnabled = true }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

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

    const initializePanZoom = () => {
      const svgElement = containerRef.current?.querySelector("svg");
      if (svgElement) {
        // Remove any max-width constraints
        svgElement.style.maxWidth = "none";
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";

        if (zoomingEnabled) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.1,
            maxZoom: 10,
            zoomScaleSensitivity: 0.3,
          });
        }
      }
    };

    mermaid.contentLoaded();
    // Wait for the SVG to be rendered
    setTimeout(initializePanZoom, 100);

    // Store ref value for cleanup
    const currentRef = containerRef.current;

    return () => {
      const svgElement = currentRef?.querySelector("svg");
      if (svgElement) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
          // svgPanZoom(svgElement).destroy();
        } catch (error) {
          console.error("Failed to destroy pan-zoom instance:", error);
        }
      }
    };
  }, [chart, zoomingEnabled]); // Added zoomingEnabled to dependencies

  return (
    <div
      ref={containerRef}
      className={`w-full max-w-full p-4 ${zoomingEnabled ? "h-[600px]" : ""}`}
    >
      <div
        key={`${chart}-${zoomingEnabled}`}
        className={`mermaid h-full ${
          zoomingEnabled ? "rounded-lg border-2 border-black" : ""
        }`}
      >
        {chart}
      </div>
    </div>
  );
};

export default MermaidChart;
