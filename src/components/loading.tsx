"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Progress } from "./ui/progress";

// Move the trio import and registration to a client-side only component
const LoadingAnimation = dynamic(() => import("./loading-animation"), {
  ssr: false,
});

const messages = [
  "Checking if its cached...",
  "Generating diagram...",
  "Analyzing repository...",
  "Prompting o3-mini...",
  "Inspecting file paths...",
  "Finding component relationships...",
  "Linking components to code...",
  "Extracting relevant directories...",
  "Reasoning about the diagram...",
  "Prompt engineers needed -> Check out the GitHub",
  "Shoutout to GitIngest for inspiration",
  "I need to find a way to make this faster...",
  "Finding the meaning of life...",
  "I'm tired...",
  "Please just give me the diagram...",
  "...NOW!",
  "guess not...",
];

interface LoadingProps {
  cost?: string;
  status:
    | "idle"
    | "started"
    | "explanation_sent"
    | "explanation"
    | "explanation_chunk"
    | "mapping_sent"
    | "mapping"
    | "mapping_chunk"
    | "diagram_sent"
    | "diagram"
    | "diagram_chunk"
    | "complete"
    | "error";
  message?: string;
  explanation?: string;
  mapping?: string;
  diagram?: string;
}

export default function Loading({
  status = "idle",
  message,
  explanation,
  mapping,
  diagram,
  cost,
}: LoadingProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Update progress based on status
  useEffect(() => {
    switch (status) {
      case "started":
        setProgress(5);
        break;
      case "explanation_sent":
        setProgress(10);
        break;
      case "explanation":
      case "explanation_chunk":
        setProgress(30);
        break;
      case "mapping_sent":
        setProgress(35);
        break;
      case "mapping":
      case "mapping_chunk":
        setProgress(60);
        break;
      case "diagram_sent":
        setProgress(65);
        break;
      case "diagram":
      case "diagram_chunk":
        setProgress(90);
        break;
      default:
        setProgress(0);
    }
  }, [status]);

  const getStatusDisplay = () => {
    switch (status) {
      case "explanation_sent":
        return "Waiting for o3-mini to start analyzing repository...";
      case "explanation":
      case "explanation_chunk":
        return "Analyzing repository structure...";
      case "mapping_sent":
        return "Waiting for o3-mini to start mapping components...";
      case "mapping":
      case "mapping_chunk":
        return "Creating component mapping...";
      case "diagram_sent":
        return "Waiting for o3-mini to start generating diagram...";
      case "diagram":
      case "diagram_chunk":
        return "Generating diagram...";
      default:
        return messages[currentMessageIndex];
    }
  };

  return (
    <div className="flex flex-col items-center gap-8">
      <LoadingAnimation />
      {/* <div className="mt-4 animate-fade-in-up text-lg">
        {messages[currentMessageIndex]}
      </div> */}
      {cost && (
        <div className="mt-4 animate-fade-in text-sm text-purple-500">
          Estimated cost: {cost}
        </div>
      )}
      <div className="flex flex-col items-center gap-4">
        {explanation && (
          <div className="mt-4 max-w-2xl text-sm text-gray-600">
            <p className="font-medium">Current explanation:</p>
            <p className="mt-2">{explanation}</p>
          </div>
        )}
        {mapping && (
          <div className="mt-4 max-w-2xl text-sm text-gray-600">
            <p className="font-medium">Current component mapping:</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
              {mapping}
            </pre>
          </div>
        )}
        {diagram && (
          <div className="mt-4 max-w-2xl text-sm text-gray-600">
            <p className="font-medium">Current diagram:</p>
            <pre className="mt-2 overflow-x-auto whitespace-pre-wrap">
              {diagram}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
