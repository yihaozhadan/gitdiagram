import React from "react";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

export function Header() {
  return (
    <header className="border-b-[3px] border-black lg:px-8">
      <div className="container mx-auto flex h-16 max-w-4xl items-center justify-between">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-semibold">
            <span className="text-black">Git</span>
            <span className="text-purple-600">Diagram</span>
          </span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link
            href="https://api.gitdiagram.com"
            className="text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600"
          >
            API
          </Link>
          <Link
            href="https://github.com/ahmedkhaleel2004/gitdiagram"
            className="flex items-center gap-2 text-sm font-medium text-black transition-transform hover:translate-y-[-2px] hover:text-purple-600"
          >
            <FaGithub className="h-5 w-5" />
            GitHub
          </Link>
          <span className="flex items-center gap-1 text-sm font-medium text-black">
            <span className="text-amber-400">★</span>
            1.3k
          </span>
        </nav>
      </div>
    </header>
  );
}
