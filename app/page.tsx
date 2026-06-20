"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { RouteSelector } from "@/components/route-selector";
import { DirectionToggle } from "@/components/direction-toggle";
import { BusList } from "@/components/bus-list";
import { StopPredictions } from "@/components/stop-predictions";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { BusFront, RefreshCw, Route } from "lucide-react";
import {
  filterBusesByDirection,
  filterRouteInfoByDirection,
  getRouteDirections,
} from "@/lib/route-directions";
import type { Bus, RouteInfo, StopInfo, BusStop } from "@/lib/types";

const BusMap = dynamic(() => import("@/components/bus-map"), { ssr: false });

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDirection, setSelectedDirection] = useState<string | null>(
    null
  );

  const [stopInfo, setStopInfo] = useState<StopInfo | null>(null);
  const [stopSheetOpen, setStopSheetOpen] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  const directions = useMemo(() => getRouteDirections(routeInfo), [routeInfo]);
  const activeDirection = useMemo(
    () =>
      directions.find((direction) => direction.key === selectedDirection) ??
      null,
    [directions, selectedDirection]
  );
  const visibleRouteInfo = useMemo(
    () => filterRouteInfoByDirection(routeInfo, activeDirection),
    [routeInfo, activeDirection]
  );
  const visibleBuses = useMemo(
    () => filterBusesByDirection(buses, activeDirection),
    [buses, activeDirection]
  );

  const fetchBuses = useCallback(async (route: string) => {
    const res = await fetch(`/api/buses?route=${route}`);
    if (res.ok) {
      const data: Bus[] = await res.json();
      setBuses(data);
    }
  }, []);

  const fetchRouteInfo = useCallback(async (route: string) => {
    const res = await fetch(`/api/route-points?route=${route}`);
    if (res.ok) {
      const data: RouteInfo = await res.json();
      const defaultDirection = getRouteDirections(data)[0];

      setSelectedDirection(defaultDirection?.key ?? null);
      setRouteInfo(data);
    }
  }, []);

  const handleRouteChange = useCallback(
    async (route: string) => {
      setSelectedRoute(route);
      setLoading(true);
      setBuses([]);
      setRouteInfo(null);
      setSelectedDirection(null);
      setStopSheetOpen(false);
      try {
        await Promise.all([fetchRouteInfo(route), fetchBuses(route)]);
      } finally {
        setLoading(false);
      }
    },
    [fetchRouteInfo, fetchBuses]
  );

  const handleRefresh = useCallback(() => {
    if (selectedRoute) {
      fetchBuses(selectedRoute);
    }
  }, [selectedRoute, fetchBuses]);

  const handleStopClick = useCallback(
    async (stop: BusStop, routeId: string) => {
      setStopSheetOpen(true);
      setStopLoading(true);
      setStopInfo(null);
      try {
        const res = await fetch(
          `/api/predictions?stop=${stop.id}&route=${routeId}`
        );
        if (res.ok) {
          const data: StopInfo = await res.json();
          setStopInfo(data);
        }
      } finally {
        setStopLoading(false);
      }
    },
    []
  );

  return (
    <main className="relative h-dvh w-screen overflow-hidden bg-background">
      <div className="absolute inset-0">
        <BusMap
          routeInfo={visibleRouteInfo}
          buses={visibleBuses}
          onStopClick={handleStopClick}
        />
      </div>

      <header className="soft-signal-panel absolute top-3 right-3 left-3 z-20 flex items-center gap-2 rounded-xl border border-border bg-card/95 p-2 backdrop-blur-md sm:top-4 sm:right-auto sm:left-4 sm:w-auto sm:gap-3">
        <span
          className="relative flex size-12 shrink-0 items-center justify-center rounded-md border border-border bg-card"
          aria-label="Bus Time"
        >
          <Image
            src={logoLight}
            alt=""
            fill
            priority
            sizes="48px"
            className="object-contain p-2.5 dark:hidden"
          />
          <Image
            src={logoDark}
            alt=""
            fill
            priority
            sizes="48px"
            className="hidden object-contain p-2.5 dark:block"
          />
        </span>

        <div className="min-w-0 flex-1 sm:w-80 sm:flex-none">
          <RouteSelector
            value={selectedRoute}
            onValueChange={handleRouteChange}
            disabled={loading}
          />
        </div>

        <DirectionToggle
          directions={directions}
          value={activeDirection?.key ?? null}
          onValueChange={setSelectedDirection}
        />

        <Button
          variant="secondary"
          size="icon"
          onClick={handleRefresh}
          disabled={!selectedRoute || loading}
          aria-label="Refresh bus positions"
          title="Refresh"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>

        <ThemeToggle />
      </header>

      <aside className="soft-signal-panel absolute right-3 bottom-3 left-3 z-10 flex h-[36vh] flex-col overflow-hidden rounded-2xl border border-border bg-card/95 p-4 backdrop-blur-md lg:top-4 lg:right-4 lg:bottom-4 lg:left-auto lg:h-auto lg:w-[360px] lg:p-5">
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold tracking-[-0.02em]">
              Active buses
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {selectedRoute
                ? `${visibleBuses.length} vehicle${visibleBuses.length === 1 ? "" : "s"} reporting${activeDirection ? ` · ${activeDirection.label}` : ""}`
                : "Choose a route to begin"}
            </p>
          </div>
          <span className="flex size-10 items-center justify-center rounded-md bg-muted">
            <BusFront className="size-5" />
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {!selectedRoute ? (
            <div className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-border px-6 text-center sm:min-h-48">
              <Route className="size-6 text-muted-foreground" />
              <div>
                <p className="font-semibold">No route selected</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick a route to see its active fleet.
                </p>
              </div>
            </div>
          ) : loading ? (
            <div className="flex min-h-36 items-center justify-center gap-2 text-muted-foreground sm:min-h-48">
              <RefreshCw className="size-4 animate-spin" />
              Loading buses…
            </div>
          ) : (
            <BusList buses={visibleBuses} routeColor={routeInfo?.color} />
          )}
        </div>
      </aside>

      <StopPredictions
        stop={stopInfo}
        open={stopSheetOpen}
        onOpenChange={setStopSheetOpen}
        loading={stopLoading}
      />
    </main>
  );
}
