"use client";

import { ArrowLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { RouteDirection } from "@/lib/route-directions";

interface DirectionToggleProps {
  directions: RouteDirection[];
  value: string | null;
  onValueChange: (value: string) => void;
  className?: string;
}

export function DirectionToggle({
  directions,
  value,
  onValueChange,
  className,
}: DirectionToggleProps) {
  const currentIndex = Math.max(
    0,
    directions.findIndex((direction) => direction.key === value)
  );
  const currentDirection = directions[currentIndex];

  if (!currentDirection) return null;

  const nextDirection =
    directions[(currentIndex + 1) % directions.length] ?? currentDirection;
  const canToggle = directions.length > 1;

  return (
    <Button
      variant="secondary"
      onClick={() => onValueChange(nextDirection.key)}
      disabled={!canToggle}
      className={cn("min-w-12 px-0 sm:max-w-52 sm:px-4", className)}
      aria-label={
        canToggle
          ? `Showing ${currentDirection.label}. Switch to ${nextDirection.label}.`
          : `Showing ${currentDirection.label}.`
      }
      title={
        canToggle
          ? `Switch to ${nextDirection.label}`
          : currentDirection.label
      }
    >
      <ArrowLeftRight />
      <span className="hidden min-w-0 truncate sm:inline" aria-live="polite">
        {currentDirection.label}
      </span>
    </Button>
  );
}
