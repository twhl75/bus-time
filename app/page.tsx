"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { RouteSelector } from "@/components/route-selector";
import { BusList } from "@/components/bus-list";
import { StopPredictions } from "@/components/stop-predictions";
import { Button } from "@/components/ui/button";
import type { Bus, RouteInfo, StopInfo, BusStop } from "@/lib/types";

const BusMap = dynamic(() => import("@/components/bus-map"), { ssr: false });

const REFRESH_INTERVAL = 30_000;

export default function Home() {
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const [stopInfo, setStopInfo] = useState<StopInfo | null>(null);
  const [stopSheetOpen, setStopSheetOpen] = useState(false);
  const [stopLoading, setStopLoading] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchBuses = useCallback(async (route: string) => {
    const res = await fetch(`/api/buses?route=${route}`);
    if (res.ok) {
      const data: Bus[] = await res.json();
      setBuses(data);
      setLastUpdated(new Date());
    }
  }, []);

  const fetchRouteInfo = useCallback(async (route: string) => {
    const res = await fetch(`/api/route-points?route=${route}`);
    if (res.ok) {
      const data: RouteInfo = await res.json();
      setRouteInfo(data);
    }
  }, []);

  const handleRouteChange = useCallback(
    async (route: string) => {
      setSelectedRoute(route);
      setLoading(true);
      setBuses([]);
      setRouteInfo(null);
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

  // Auto-refresh bus positions
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoRefresh && selectedRoute) {
      intervalRef.current = setInterval(() => {
        fetchBuses(selectedRoute);
      }, REFRESH_INTERVAL);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoRefresh, selectedRoute, fetchBuses]);

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
    <div className="flex h-screen flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg font-semibold whitespace-nowrap">
            🚌 Oakville Bus Tracker
          </h1>
          <RouteSelector
            value={selectedRoute}
            onValueChange={handleRouteChange}
            disabled={loading}
          />
          <div className="flex items-center gap-2 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={!selectedRoute || loading}
            >
              ↻ Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
            >
              Auto {autoRefresh ? "ON" : "OFF"}
            </Button>
            {lastUpdated && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        {routeInfo && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <span
              className="inline-block h-3 w-3 rounded-full"
              style={{ backgroundColor: routeInfo.color }}
            />
            <span className="font-medium text-foreground">
              {routeInfo.shortName} — {routeInfo.name}
            </span>
            <span>·</span>
            <span>
              {buses.length} bus{buses.length !== 1 ? "es" : ""} active
            </span>
          </div>
        )}
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Map */}
        <div className="flex-1 relative isolate">
          {!selectedRoute ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Select a route to see bus locations
            </div>
          ) : loading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              Loading route data...
            </div>
          ) : (
            <BusMap
              routeInfo={routeInfo}
              buses={buses}
              onStopClick={handleStopClick}
            />
          )}
        </div>

        {/* Sidebar - bus list */}
        {selectedRoute && (
          <aside className="w-80 shrink-0 overflow-y-auto border-l bg-card p-3 hidden lg:block">
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">
              Active Buses
            </h2>
            {loading ? (
              <div className="flex items-center justify-center py-8 text-muted-foreground">
                Loading...
              </div>
            ) : (
              <BusList buses={buses} routeColor={routeInfo?.color} />
            )}
          </aside>
        )}
      </div>

      {/* Stop predictions sheet */}
      <StopPredictions
        stop={stopInfo}
        open={stopSheetOpen}
        onOpenChange={setStopSheetOpen}
        loading={stopLoading}
      />
    </div>
  );
}
