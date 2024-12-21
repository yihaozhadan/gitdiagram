"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

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
}

const Loading = ({ cost }: LoadingProps) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <LoadingAnimation />
      <div className="mt-2 animate-fade-in-up text-lg">
        {messages[currentMessageIndex]}
      </div>
      {cost && (
        <div className="animate-fade-in mt-2 text-sm text-gray-400">
          Estimated cost: {cost}
        </div>
      )}
    </div>
  );
};

export default Loading;
