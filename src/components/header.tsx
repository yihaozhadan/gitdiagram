"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaGithub, FaCoffee, FaBars, FaTimes } from "react-icons/fa";
import { getStarCount } from "~/app/_actions/github";
import { PrivateReposDialog } from "./private-repos-dialog";

import { ModelConfigDialog } from "./model-config-dialog";
import type { ModelConfig } from "./model-config-dialog";
import { ThemeSwitch } from "./theme-switch";

export function Header() {
  const [isPrivateReposDialogOpen, setIsPrivateReposDialogOpen] =
    useState(false);
  const [isModelConfigDialogOpen, setIsModelConfigDialogOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
    <header className="border-b-[3px] border-black dark:border-white bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        {/* Main header bar */}
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center">
            <span className="text-lg font-semibold sm:text-xl">
              <span className="text-foreground transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300">
                Git
              </span>
              <span className="text-purple-600 transition-colors duration-200 hover:text-purple-500">
                Diagram
              </span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <span
              onClick={() => setIsModelConfigDialogOpen(true)}
              className="cursor-pointer text-sm font-medium text-foreground transition-transform hover:translate-y-[-2px] hover:text-purple-600"
            >
              AI Model
            </span>
            <span
              onClick={() => setIsPrivateReposDialogOpen(true)}
              className="cursor-pointer text-sm font-medium text-foreground transition-transform hover:translate-y-[-2px] hover:text-purple-600"
            >
              Private Repos
            </span>
            <Link
              href="/cache"
              className="cursor-pointer text-sm font-medium text-foreground transition-transform hover:translate-y-[-2px] hover:text-purple-600"
            >
              Cached Diagrams
            </Link>
            <Link
              href="/contact"
              className="cursor-pointer text-sm font-medium text-foreground transition-transform hover:translate-y-[-2px] hover:text-purple-600"
            >
              Contact
            </Link>
            <ThemeSwitch />
            <Link
              href="https://buymeacoffee.com/hui.zhou"
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-transform hover:translate-y-[-2px] hover:text-purple-600"
            >
              <FaCoffee className="h-5 w-5" />
              <span>Sponsor</span>
            </Link>
            <Link
              href="https://github.com/yihaozhadan/gitdiagram"
              className="flex items-center gap-2 text-sm font-medium text-foreground transition-transform hover:translate-y-[-2px] hover:text-purple-600"
            >
              <FaGithub className="h-5 w-5" />
              <span>GitHub</span>
            </Link>
            <span className="flex items-center gap-1 text-sm font-medium text-foreground">
              <span className="text-amber-400">★</span>
              {formatStarCount(starCount)}
            </span>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground hover:text-purple-600 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <nav className="flex flex-col space-y-4">
              <span
                onClick={() => {
                  setIsModelConfigDialogOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="cursor-pointer text-sm font-medium text-foreground hover:text-purple-600 transition-colors px-2 py-1"
              >
                AI Model
              </span>
              <span
                onClick={() => {
                  setIsPrivateReposDialogOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="cursor-pointer text-sm font-medium text-foreground hover:text-purple-600 transition-colors px-2 py-1"
              >
                Private Repos
              </span>
              <Link
                href="/cache"
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer text-sm font-medium text-foreground hover:text-purple-600 transition-colors px-2 py-1"
              >
                Cached Diagrams
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="cursor-pointer text-sm font-medium text-foreground hover:text-purple-600 transition-colors px-2 py-1"
              >
                Contact
              </Link>
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm font-medium text-foreground">Theme</span>
                <ThemeSwitch />
              </div>
              <Link
                href="https://buymeacoffee.com/hui.zhou"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-purple-600 transition-colors px-2 py-1"
              >
                <FaCoffee className="h-5 w-5" />
                <span>Sponsor</span>
              </Link>
              <Link
                href="https://github.com/yihaozhadan/gitdiagram"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-purple-600 transition-colors px-2 py-1"
              >
                <FaGithub className="h-5 w-5" />
                <span>GitHub</span>
              </Link>
              <div className="flex items-center gap-1 text-sm font-medium text-foreground px-2 py-1">
                <span className="text-amber-400">★</span>
                {formatStarCount(starCount)}
              </div>
            </nav>
          </div>
        )}

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
