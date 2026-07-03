"use client";

import {
  useCallback,
  useState,
  type CSSProperties,
  type UIEvent,
} from "react";
import { ArrowDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ROUTES } from "@/lib/routes";
import { cn } from "@/lib/utils";

interface RouteSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  triggerClassName?: string;
}

export function RouteSelector({
  value,
  onValueChange,
  disabled,
  triggerClassName,
}: RouteSelectorProps) {
  const selectedLabel = ROUTES.find((route) => route.id === value);
  const [hasRoutesBelow, setHasRoutesBelow] = useState(true);
  const [vehicleCounts, setVehicleCounts] = useState<Record<string, number>>(
    {}
  );

  const fetchVehicleCounts = useCallback(async () => {
    const res = await fetch("/api/route-vehicle-counts");
    if (!res.ok) {
      return;
    }

    const data = (await res.json()) as Record<string, number>;
    setVehicleCounts(data);
  }, []);

  function handleRouteListScroll(event: UIEvent<HTMLDivElement>) {
    const list = event.currentTarget;
    const isAtBottom =
      list.scrollTop + list.clientHeight >= list.scrollHeight - 2;

    setHasRoutesBelow(!isAtBottom);
  }

  return (
    <Select
      value={value}
      onValueChange={(v) => v && onValueChange(v)}
      onOpenChange={(open) => {
        if (open) {
          setHasRoutesBelow(true);
          fetchVehicleCounts();
        }
      }}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", triggerClassName)}>
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
      <SelectContent
        align="start"
        alignItemWithTrigger={false}
        sideOffset={8}
        className={cn(
          "route-select-content w-[min(22rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border-border/90 bg-popover/95 p-0 shadow-[0_2px_8px_rgba(17,17,17,0.08),0_22px_58px_rgba(17,17,17,0.16)] backdrop-blur-md",
          !hasRoutesBelow && "route-select-content-at-bottom"
        )}
        listClassName="route-select-list max-h-[min(calc(100vh-7rem),32.5rem)] overflow-y-auto overscroll-contain p-0"
        listProps={{ onScroll: handleRouteListScroll }}
        showScrollButtons={false}
        floatingContent={
          hasRoutesBelow ? (
            <span className="route-scroll-hint" aria-hidden="true">
              <ArrowDown className="size-4" />
            </span>
          ) : null
        }
      >
        {ROUTES.map((route, index) => {
          const vehicleCount = vehicleCounts[route.id];
          const hasVehicleCount = vehicleCount !== undefined;
          const hasActiveVehicles = hasVehicleCount && vehicleCount > 0;

          return (
            <SelectItem
              key={route.id}
              value={route.id}
              className="route-option min-h-12 rounded-none border-b border-border/80 py-0 pr-0 pl-0 last:border-b-0 focus:bg-muted/70"
              style={{ "--route-index": index } as CSSProperties}
            >
              <span className="flex h-14 min-w-0 flex-1 items-center gap-3 px-4">
                <span
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                  style={{
                    backgroundColor: route.color,
                    color: route.foreground,
                  }}
                  aria-hidden="true"
                >
                  {route.id}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-foreground">
                    {route.name}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <span
                      className={cn(
                        "size-1.5 rounded-full",
                        !hasVehicleCount
                          ? "bg-muted-foreground/40"
                          : hasActiveVehicles
                            ? "bg-[#137a4b]"
                            : "bg-destructive"
                      )}
                      aria-hidden="true"
                    />
                    {hasVehicleCount
                      ? `${vehicleCount} active vehicle${vehicleCount === 1 ? "" : "s"}`
                      : "Checking active vehicles"}
                  </span>
                </span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
