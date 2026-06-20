"use client";

import { Badge } from "@/components/ui/badge";
import { BusFront, MapPin } from "lucide-react";
import type { Bus } from "@/lib/types";

interface BusListProps {
  buses: Bus[];
  routeColor?: string;
}

export function BusList({ buses, routeColor }: BusListProps) {
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
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      {buses.map((bus) => (
        <article
          key={bus.id}
          className="group flex min-h-24 items-start gap-3 border-b border-border p-4 transition-colors last:border-b-0 hover:bg-muted/70"
        >
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-md border bg-card"
            style={{ borderColor: routeColor || "#cfcfcb" }}
          >
            <BusFront className="size-5" style={{ color: routeColor || "#171717" }} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="truncate font-semibold text-foreground">
                  Bus #{bus.id}
                </h3>
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {bus.destination}
                </p>
              </div>
              <Badge variant="secondary">{bus.directionCode}</Badge>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" />
              <span className="truncate">{bus.direction}</span>
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}
