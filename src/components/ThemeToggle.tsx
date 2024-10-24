"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@src/components/ui/button";

const ThemeToggle: React.FC = () => {
  const { theme, systemTheme, setTheme } = useTheme();
  const currentTheme = theme === 'system' ? systemTheme : theme;
  
  const toggleTheme = () => {
    setTheme(currentTheme === 'dark' ? 'light' : 'dark')
  };

  return (
    <Button variant="outline" size="icon" onClick={toggleTheme}>
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">테마 전환</span>
    </Button>      
  );
};

export default ThemeToggle;