"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/routes";

interface RouteSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function RouteSelector({
  value,
  onValueChange,
  disabled,
}: RouteSelectorProps) {
  const selectedLabel = ROUTES.find((route) => route.id === value);

  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)} disabled={disabled}>
      <SelectTrigger className="w-full">
        <span
          className={
            selectedLabel
              ? "min-w-0 flex-1 truncate text-left text-foreground"
              : "min-w-0 flex-1 truncate text-left text-muted-foreground"
          }
        >
          {selectedLabel
            ? `${selectedLabel.id} — ${selectedLabel.name}`
            : "Select a route"}
        </span>
      </SelectTrigger>
      <SelectContent>
        {ROUTES.map((route) => (
          <SelectItem key={route.id} value={route.id}>
            {route.id} — {route.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
