"use client";

import type { CSSProperties } from "react";
import Image from "next/image";
import { BusFront } from "lucide-react";
import { getBusPositionLabel } from "@/lib/bus-position";
import { cn } from "@/lib/utils";
import type { Bus, RouteInfo } from "@/lib/types";

interface BusListProps {
  buses: Bus[];
  routeInfo?: RouteInfo | null;
  selectedBusId?: string | null;
  onBusSelect?: (bus: Bus) => void;
}

export function BusList({
  buses,
  routeInfo,
  selectedBusId,
  onBusSelect,
}: BusListProps) {
  if (buses.length === 0) {
    return (
      <div className="flex min-h-48 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 text-center">
        <span className="flex size-11 items-center justify-center rounded-md bg-muted text-muted-foreground">
          <BusFront className="size-5" />
        </span>
        <div>
          <p className="font-semibold text-foreground">No active buses</p>
          <p className="mt-1 text-sm text-muted-foreground">
            There are no vehicles reporting on this route right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-card py-1">
      {buses.map((bus, index) => {
        const selected = selectedBusId === bus.id;
        const position = getBusPositionLabel(bus, routeInfo);
        const routeColor = routeInfo?.color ?? "#64748b";

        return (
          <button
            type="button"
            key={bus.id}
            className={cn(
              "group relative flex min-h-28 w-full items-center gap-3 rounded-xl px-2 py-3 text-left transition-[background-color,box-shadow,transform] duration-200 focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ring sm:gap-4 sm:px-3",
              selected
                ? "selected-bus-card my-1 -translate-y-px last:mb-0"
                : "hover:bg-muted/55 active:scale-[0.99]"
            )}
            style={
              selected
                ? ({ "--bus-route-color": routeColor } as CSSProperties)
                : undefined
            }
            onClick={() => onBusSelect?.(bus)}
            aria-pressed={selected}
            aria-label={`Bus ${bus.id}, ${position}`}
          >
            <span
              className="relative size-[88px] shrink-0"
              aria-hidden="true"
            >
              <Image
                src="/images/bus-3d.png"
                alt=""
                fill
                sizes="88px"
                loading={index === 0 ? "eager" : "lazy"}
                className="object-contain drop-shadow-[0_7px_7px_rgba(17,17,17,0.16)] transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:scale-[1.03]"
              />
            </span>
            <span className="min-w-0 flex-1 py-1">
              <span
                className={cn(
                  "block truncate text-base font-semibold tracking-[-0.015em]",
                  selected ? "text-current" : "text-foreground"
                )}
              >
                Bus {bus.id}
              </span>
              <span
                className={cn(
                  "mt-1 block line-clamp-2 text-sm leading-5",
                  selected ? "text-current opacity-80" : "text-muted-foreground"
                )}
              >
                {position}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
