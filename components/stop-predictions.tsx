"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import type { StopInfo } from "@/lib/types";

interface StopPredictionsProps {
  stop: StopInfo | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loading?: boolean;
}

export function StopPredictions({
  stop,
  open,
  onOpenChange,
  loading,
}: StopPredictionsProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="mx-auto max-h-[65vh] max-w-3xl rounded-t-3xl border-x border-t"
      >
        <SheetHeader className="border-b border-border pb-5 pr-16">
          <SheetTitle>{stop?.name ?? "Stop Predictions"}</SheetTitle>
        </SheetHeader>
        <div className="overflow-y-auto px-6 pb-8 pt-5">
          {loading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              Loading predictions...
            </div>
          ) : !stop || stop.predictions.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              No upcoming arrivals at this stop
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border">
              {stop.predictions.map((pred, i) => (
                <div
                  key={`${pred.vehicleId}-${i}`}
                  className="flex min-h-20 items-center justify-between gap-4 border-b border-border p-4 last:border-b-0"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{pred.destination}</div>
                    <div className="text-xs text-muted-foreground">
                      Route {pred.routeNumber} · Vehicle #{pred.vehicleId}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={pred.scheduled ? "outline" : "default"}
                      className="text-sm"
                    >
                      {pred.time}
                    </Badge>
                    {pred.scheduled && (
                      <Badge variant="secondary" className="text-xs">
                        Scheduled
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
