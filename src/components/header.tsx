"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaGithub, FaCoffee } from "react-icons/fa";
import { getStarCount } from "~/app/_actions/github";
import { PrivateReposDialog } from "./private-repos-dialog";

import { ModelConfigDialog } from "./model-config-dialog";
import type { ModelConfig } from "./model-config-dialog";

export function Header() {
  const [isPrivateReposDialogOpen, setIsPrivateReposDialogOpen] =
    useState(false);
  const [isModelConfigDialogOpen, setIsModelConfigDialogOpen] = useState(false);
  const [starCount, setStarCount] = useState<number | null>(null);

  useEffect(() => {
    void getStarCount().then(setStarCount);
  }, []);

  const formatStarCount = (count: number | null) => {
    if (!count) return "0";
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  };

  const handlePrivateReposSubmit = (pat: string) => {
    // Store the PAT in localStorage
    localStorage.setItem("github_pat", pat);
    setIsPrivateReposDialogOpen(false);
  };

  const handleModelConfigSubmit = (config: ModelConfig) => {
    localStorage.setItem("model_config", JSON.stringify(config));
    setIsModelConfigDialogOpen(false);
  };

  return (
    <header className="border-b-[3px] border-black">
      <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-8">
        <Link href="/" className="flex items-center">
          <span className="text-lg font-semibold sm:text-xl">
            <span className="text-black transition-colors duration-200 hover:text-gray-600">
              Git
            </span>
            <span className="text-purple-600 transition-colors duration-200 hover:text-purple-500">
              Diagram
            </span>
          </span>
        </Link>
        <nav className="flex items-center gap-3 sm:gap-6">
          <span
            onClick={() => setIsModelConfigDialogOpen(true)}
            className="cursor-pointer text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600"
          >
            <span className="flex items-center sm:hidden">
              <span>Model</span>
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <span>AI Model</span>
            </span>
          </span>
          <span
            onClick={() => setIsPrivateReposDialogOpen(true)}
            className="cursor-pointer text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600"
          >
            <span className="flex items-center sm:hidden">
              <span>Repos</span>
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <span className="hidden sm:inline">Private Repos</span>
            </span>
          </span>
          <Link
            href="/cache"
            className="cursor-pointer text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600"
          >
            <span className="flex items-center sm:hidden">
              <span>Cache</span>
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <span>Cached Diagrams</span>
            </span>
          </Link>
          <Link
            href="/contact"
            className="cursor-pointer text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600"
          >
            <span className="flex items-center sm:hidden">
              <span>Contact</span>
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <span>Contact</span>
            </span>
          </Link>
          <Link
            href="https://buymeacoffee.com/hui.zhou"
            className="flex items-center gap-1 text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600 sm:gap-2"
          >
            <FaCoffee className="h-5 w-5" />
            <span className="hidden sm:inline">Sponsor</span>
          </Link>
          <Link
            href="https://github.com/yihaozhadan/gitdiagram"
            className="flex items-center gap-1 text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600 sm:gap-2"
          >
            <FaGithub className="h-5 w-5" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
          <span className="flex items-center gap-1 text-sm font-medium text-black">
            <span className="text-amber-400">★</span>
            {formatStarCount(starCount)}
          </span>
        </nav>

        <ModelConfigDialog
          isOpen={isModelConfigDialogOpen}
          onClose={() => setIsModelConfigDialogOpen(false)}
          onSubmit={handleModelConfigSubmit}
        />
        <PrivateReposDialog
          isOpen={isPrivateReposDialogOpen}
          onClose={() => setIsPrivateReposDialogOpen(false)}
          onSubmit={handlePrivateReposSubmit}
        />
      </div>
    </header>
  );
}
