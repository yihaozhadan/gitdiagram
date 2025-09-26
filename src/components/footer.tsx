import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t-[3px] border-black dark:border-white py-4 lg:px-8 bg-background">
      <div className="container mx-auto flex h-8 max-w-4xl items-center justify-center">
        <span className="text-sm font-medium text-foreground">
          This project is forked from{" "}
          <Link
            href="https://github.com/ahmedkhaleel2004/gitdiagram"
            className="text-purple-600 hover:underline"
          >
            Ahmed Khaleel
          </Link>
          {" "}and improved by{" "}
          <Link
            href="https://www.linkedin.com/in/huizhou1"
            className="text-purple-600 hover:underline"
          >
            Hui Zhou
          </Link>
        </span>
      </div>
    </footer>
  );
}
