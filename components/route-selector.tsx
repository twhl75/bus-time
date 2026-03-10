"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  return (
    <Select value={value} onValueChange={(v) => v && onValueChange(v)} disabled={disabled}>
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Select a route" />
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
