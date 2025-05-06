"use client";

import { useEffect, useRef, useCallback } from "react";
import mermaid from "mermaid";

interface MermaidChartProps {
  chart: string;
  zoomingEnabled?: boolean;
  onError?: (error: string) => void;
}

const MermaidChart = ({ chart, zoomingEnabled = true, onError }: MermaidChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const stableOnError = useCallback(
    (error: string) => {
      onError?.(error);
    },
    [onError]
  );

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

    const initializePanZoom = async () => {
      const svgElement = containerRef.current?.querySelector("svg");
      if (svgElement && zoomingEnabled) {
        // Remove any max-width constraints
        svgElement.style.maxWidth = "none";
        svgElement.style.width = "100%";
        svgElement.style.height = "100%";

        if (zoomingEnabled) {
          try {
            // Dynamically import svg-pan-zoom only when needed in the browser
            const svgPanZoom = (await import("svg-pan-zoom")).default;
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
          } catch (error) {
            console.error("Failed to load svg-pan-zoom:", error);
          }
        }
      }
    };

    try {
      mermaid.contentLoaded();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      stableOnError(errorMessage);
    }
    // Wait for the SVG to be rendered
    setTimeout(() => {
      void initializePanZoom();
    }, 100);

    return () => {
      // Cleanup not needed with dynamic import approach
    };
  }, [chart, zoomingEnabled, stableOnError]);

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
