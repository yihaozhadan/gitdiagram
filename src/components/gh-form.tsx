"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Sparkles } from "lucide-react";
import React from "react";
import { CopyButton } from "./copy-button";

const exampleRepos = {
  FastAPI: "/fastapi/fastapi",
  "ai-chatbot": "/vercel/ai-chatbot",
};

interface GHFormProps {
  isHome?: boolean;
  username?: string;
  repo?: string;
}

export default function GHForm({ isHome = true, username, repo }: GHFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (username && repo) {
      setRepoUrl(`https://github.com/${username}/${repo}`);
    }
  }, [username, repo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const githubUrlPattern =
      /^https?:\/\/github\.com\/([a-zA-Z0-9-_]+)\/([a-zA-Z0-9-_\.]+)\/?$/;
    const match = githubUrlPattern.exec(repoUrl.trim());

    if (!match) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    const [, username, repo] = match || [];
    if (!username || !repo) {
      setError("Invalid repository URL format");
      return;
    }
    const sanitizedUsername = encodeURIComponent(username);
    const sanitizedRepo = encodeURIComponent(repo);
    router.push(`/${sanitizedUsername}/${sanitizedRepo}`);
  };

  const handleExampleClick = (repoPath: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(repoPath);
  };

  const handleCopy = () => {
    // Placeholder for copy functionality
    console.log("Copy Mermaid.js code");
  };

  return (
    <Card className="relative w-full max-w-3xl border-[3px] border-black bg-purple-200 p-4 shadow-[8px_8px_0_0_#000000] sm:p-8">
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
          <Input
            placeholder="https://github.com/username/repo"
            className="flex-1 rounded-md border-[3px] border-black px-3 py-4 text-base font-bold shadow-[4px_4px_0_0_#000000] placeholder:text-base placeholder:font-normal placeholder:text-gray-700 sm:px-4 sm:py-6 sm:text-lg sm:placeholder:text-lg"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="border-[3px] border-black bg-purple-400 p-4 px-4 text-base text-black shadow-[4px_4px_0_0_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:transform hover:bg-purple-400 sm:p-6 sm:px-6 sm:text-lg"
          >
            Diagram
          </Button>
          {!isHome && <CopyButton onClick={handleCopy} />}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Example Repositories */}
        {isHome && (
          <div className="space-y-2">
            <div className="text-sm text-gray-700 sm:text-base">
              Try these example repositories:
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(exampleRepos).map(([name, path]) => (
                <Button
                  key={name}
                  variant="outline"
                  className="border-2 border-black bg-purple-400 text-sm text-black transition-transform hover:-translate-y-0.5 hover:transform hover:bg-purple-300 sm:text-base"
                  onClick={(e) => handleExampleClick(path, e)}
                >
                  {name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </form>

      {/* Decorative Sparkle */}
      <div className="absolute -bottom-8 -left-12 hidden sm:block">
        <Sparkles
          className="h-20 w-20 fill-sky-400 text-black"
          strokeWidth={0.6}
          style={{ transform: "rotate(-15deg)" }}
        />
      </div>
    </Card>
  );
}
