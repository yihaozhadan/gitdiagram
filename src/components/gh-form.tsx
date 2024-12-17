"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Sparkles } from "lucide-react";
import React from "react";

const exampleRepos = {
  FastAPI: "/fastapi/fastapi",
  "ai-chatbot": "/vercel/ai-chatbot",
};

interface GHFormProps {
  showExamples?: boolean;
  username?: string;
  repo?: string;
}

export default function GHForm({
  showExamples = true,
  username,
  repo,
}: GHFormProps) {
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

    const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = githubUrlPattern.exec(repoUrl);

    if (!match) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    const [, username, repo] = match;
    router.push(`/${username}/${repo}`);
  };

  const handleExampleClick = (repoPath: string, e: React.MouseEvent) => {
    e.preventDefault();
    router.push(repoPath);
  };

  return (
    <Card className="relative w-full max-w-3xl border-[3px] border-black bg-purple-200 p-8 shadow-[8px_8px_0_0_#000000]">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex gap-4">
          <Input
            placeholder="https://github.com/username/repo"
            className="flex-1 rounded-md border-[3px] border-black px-4 py-6 text-lg font-bold shadow-[4px_4px_0_0_#000000] placeholder:text-lg placeholder:font-normal placeholder:text-gray-700"
            value={repoUrl}
            onChange={(e) => setRepoUrl(e.target.value)}
            required
          />
          <Button
            type="submit"
            className="border-[3px] border-black bg-purple-400 p-6 px-6 text-lg text-black shadow-[4px_4px_0_0_#000000] transition-transform hover:-translate-x-0.5 hover:-translate-y-0.5 hover:transform hover:bg-purple-400"
          >
            Diagram
          </Button>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Example Repositories */}
        {showExamples && (
          <div className="space-y-2">
            <div className="text-gray-700">Try these example repositories:</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(exampleRepos).map(([name, path]) => (
                <Button
                  key={name}
                  variant="outline"
                  className="border-2 border-black bg-purple-400 font-semibold text-black transition-transform hover:-translate-y-0.5 hover:transform hover:bg-purple-300"
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
      <div className="absolute -bottom-8 -left-12">
        <Sparkles
          className="h-20 w-20 fill-sky-400 text-black"
          strokeWidth={0.6}
          style={{ transform: "rotate(-15deg)" }}
        />
      </div>
    </Card>
  );
}
