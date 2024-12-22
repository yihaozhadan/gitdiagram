"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Progress } from "./ui/progress";

// Move the trio import and registration to a client-side only component
const LoadingAnimation = dynamic(() => import("./loading-animation"), {
  ssr: false,
});

const messages = [
  "Generating diagram...",
  "Checking if its cached...",
  "Analyzing repository...",
  "Abusing Claude...",
  "Losing my mind...",
  "How long is this gonna take 💀",
  "This is gonna use so many credits 😭",
  "Prompt engineers needed -> Check out the GitHub repo",
  "Shoutout to GitIngest for inspiration",
  "Looking for internships...",
  "No internships found 💀",
];

interface LoadingProps {
  cost?: string;
  isModifying?: boolean;
}

const Loading = ({ cost, isModifying }: LoadingProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const seconds = isModifying ? 5 : 50;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Reset progress when component mounts
  useEffect(() => {
    setProgress(0);
  }, []);

  // Handle progress animation
  useEffect(() => {
    let animationFrameId: number;

    // Start progress if we're modifying OR if we have a cost
    if (!isModifying && !cost) return;

    const startTime = Date.now();
    const duration = seconds * 1000;

    const easeOutCubic = (x: number): number => {
      return 1 - Math.pow(1 - x, 3);
    };

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(rawProgress) * 100;
      setProgress(easedProgress);

      if (elapsed < duration) {
        animationFrameId = requestAnimationFrame(updateProgress);
      }
    };

    animationFrameId = requestAnimationFrame(updateProgress);

    // Cleanup function to cancel animation frame and reset progress
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      setProgress(0);
    };
  }, [cost, seconds, isModifying]);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <LoadingAnimation />
      {(cost ?? isModifying) && (
        <Progress value={progress} className="mt-4 h-[7px] w-[300px]" />
      )}
      <div className="mt-4 animate-fade-in-up text-lg">
        {messages[currentMessageIndex]}
      </div>
      {cost && (
        <div className="mt-4 animate-fade-in text-sm text-purple-500">
          Estimated cost: {cost}
        </div>
      )}
    </div>
  );
};

export default Loading;
