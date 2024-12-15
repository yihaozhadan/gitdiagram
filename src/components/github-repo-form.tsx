"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

export default function GitHubRepoForm() {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Parse GitHub URL
    const githubUrlPattern = /github\.com\/([^\/]+)\/([^\/]+)/;
    const match = githubUrlPattern.exec(repoUrl);

    if (!match) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    const [, username, repo] = match;
    router.push(`/${username}/${repo}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 transition-colors duration-300 dark:bg-gray-900">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-6 shadow-md dark:bg-gray-800">
        <div>
          <h1 className="text-center text-4xl font-bold text-gray-900 dark:text-white">
            GitHub Repo Analyzer
          </h1>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            Enter a GitHub repository URL to get started
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <Input
              type="url"
              placeholder="https://github.com/username/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              required
              className="relative block w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm dark:border-gray-700 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
            />
          </div>
          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}
          <div>
            <Button
              type="submit"
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-300 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:bg-indigo-500 dark:hover:bg-indigo-600"
            >
              Analyze Repository
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
