"use client";

import { useEffect, useState } from "react";
import { Eclipse, Moon, Sun } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "theme-preference";

const THEME_META = {
  system: { label: "System", Icon: Eclipse },
  light: { label: "Light", Icon: Sun },
  dark: { label: "Dark", Icon: Moon },
} as const;

function isThemeMode(value: string): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
}

export function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const { label, Icon } = THEME_META[mode];

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    const initialMode: ThemeMode =
      stored === "light" || stored === "dark" || stored === "system"
        ? stored
        : "system";

    setMode(initialMode);
    applyTheme(initialMode);
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => {
      if (mode === "system") {
        applyTheme("system");
      }
    };

    media.addEventListener("change", handleMediaChange);
    return () => media.removeEventListener("change", handleMediaChange);
  }, [mode]);

  useEffect(() => {
    applyTheme(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  return (
    <Select
      value={mode}
      onValueChange={(value) => value !== null && isThemeMode(value) && setMode(value)}
    >
      <SelectTrigger size="sm" className="w-[8.5rem]" aria-label="Theme mode">
        <span className="flex items-center gap-1.5">
          <Icon className="size-4" />
          <span>{label}</span>
        </span>
      </SelectTrigger>
      <SelectContent align="end" className="min-w-0">
        <SelectItem value="system">
          <Eclipse className="size-4" />
          System
        </SelectItem>
        <SelectItem value="light">
          <Sun className="size-4" />
          Light
        </SelectItem>
        <SelectItem value="dark">
          <Moon className="size-4" />
          Dark
        </SelectItem>
      </SelectContent>
    </Select>
  );
}
