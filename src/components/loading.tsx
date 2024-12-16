"use client";

import { useEffect, useState } from "react";
import { trio } from "ldrs";

trio.register();

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

const Loading = () => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000); // Change message every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full flex-col items-center justify-center">
      <l-trio size="40" speed="2.0" color="black" />
      <div className="animate-fade-in-up mt-2 text-lg">
        {messages[currentMessageIndex]}
      </div>
    </div>
  );
};

export default Loading;
