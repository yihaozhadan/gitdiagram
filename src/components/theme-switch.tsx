"use client";

import React, { useEffect, useState } from "react";
import { Switch } from "~/components/ui/switch";
import { useTheme } from "~/components/theme-provider";
import { FaSun, FaMoon } from "react-icons/fa";

export function ThemeSwitch() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center gap-2">
        <FaSun className="h-4 w-4 text-gray-400" />
        <div className="h-8 w-16 rounded-full bg-gray-300 border-2 border-black" />
        <FaMoon className="h-4 w-4 text-gray-400" />
      </div>
    );
  }

  return <ThemeSwitchClient />;
}

function ThemeSwitchClient() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center gap-2">
      <FaSun 
        className={`h-4 w-4 transition-colors ${
          theme === "light" ? "text-yellow-500" : "text-gray-400"
        }`} 
      />
      <Switch
        checked={theme === "dark"}
        onCheckedChange={toggleTheme}
        className="data-[state=checked]:bg-gray-700 data-[state=unchecked]:bg-yellow-400"
      />
      <FaMoon 
        className={`h-4 w-4 transition-colors ${
          theme === "dark" ? "text-blue-400" : "text-gray-400"
        }`} 
      />
    </div>
  );
}
