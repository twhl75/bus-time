"use client";

import { useEffect, useSyncExternalStore } from "react";
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

function updateFavicons(mode: ThemeMode) {
  const darkFavicon = document.querySelector<HTMLLinkElement>(
    'link[rel="icon"][data-app-favicon="dark"]',
  );
  const lightFavicon = document.querySelector<HTMLLinkElement>(
    'link[rel="icon"][data-app-favicon="light"]',
  );

  if (!darkFavicon || !lightFavicon) {
    return;
  }

  if (mode === "dark") {
    darkFavicon.media = "all";
    lightFavicon.media = "not all";
    return;
  }

  if (mode === "light") {
    darkFavicon.media = "not all";
    lightFavicon.media = "all";
    return;
  }

  darkFavicon.media = "(prefers-color-scheme: dark)";
  lightFavicon.media = "(prefers-color-scheme: light)";
}

function isThemeMode(value: string): value is ThemeMode {
  return value === "system" || value === "light" || value === "dark";
}

function getThemeModeSnapshot(): ThemeMode {
  if (typeof window === "undefined") {
    return "system";
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  const storedTheme = stored ?? "";
  if (isThemeMode(storedTheme)) {
    return storedTheme;
  }

  return "system";
}

function getThemeModeServerSnapshot(): ThemeMode {
  return "system";
}

function subscribeToThemeMode(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("theme-preference-change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("theme-preference-change", onChange);
  };
}

function setThemeMode(mode: ThemeMode) {
  localStorage.setItem(STORAGE_KEY, mode);
  window.dispatchEvent(new Event("theme-preference-change"));
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = mode === "dark" || (mode === "system" && prefersDark);

  root.classList.toggle("dark", isDark);
  root.style.colorScheme = isDark ? "dark" : "light";
  updateFavicons(mode);
}

export function ThemeToggle() {
  const mode = useSyncExternalStore(
    subscribeToThemeMode,
    getThemeModeSnapshot,
    getThemeModeServerSnapshot,
  );
  const { label, Icon } = THEME_META[mode];

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
  }, [mode]);

  return (
    <Select
      value={mode}
      onValueChange={(value) => value !== null && isThemeMode(value) && setThemeMode(value)}
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
