"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Bus } from "@/lib/types";

interface BusListProps {
  buses: Bus[];
  routeColor?: string;
}

export function BusList({ buses, routeColor }: BusListProps) {
  if (buses.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        No buses currently running on this route
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {buses.map((bus) => (
        <Card key={bus.id} className="gap-0 py-0">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-3 w-3 rounded-full"
                  style={{ backgroundColor: routeColor || "#333" }}
                />
                Bus #{bus.id}
              </span>
              <Badge variant="secondary" className="text-xs">
                {bus.directionCode}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4 pt-0">
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-foreground">
                  {bus.destination}
                </span>
              </div>
              <div>{bus.direction}</div>
              <div className="text-xs font-mono">
                {bus.lat.toFixed(5)}, {bus.lon.toFixed(5)}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
