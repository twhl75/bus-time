"use client";

import {
  useState,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import logoDark from "@/assets/logo-dark.png";
import logoLight from "@/assets/logo-light.png";
import { RouteSelector } from "@/components/route-selector";
import { DirectionToggle } from "@/components/direction-toggle";
import { BusList } from "@/components/bus-list";
import { StopPredictions } from "@/components/stop-predictions";
import { Button } from "@/components/ui/button";
import {
  ArrowLeftRight,
  BusFront,
  RefreshCw,
  Route,
} from "lucide-react";
import { ROUTES } from "@/lib/routes";
import {
  filterBusesByDirection,
  filterRouteInfoByDirection,
  getRouteDirections,
} from "@/lib/route-directions";
import { getRouteGeometry } from "@/lib/route-geometry";
import type { Bus, RouteInfo, StopInfo, BusStop } from "@/lib/types";

const BusMap = dynamic(() => import("@/components/bus-map"), { ssr: false });

export default function Home() {
  const viewportRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const busDrawerRef = useRef<HTMLElement | null>(null);
  const busDrawerContentRef = useRef<HTMLDivElement | null>(null);
  const busDrawerDragRef = useRef<{
    pointerId: number;
    startY: number;
    startHeight: number;
    minHeight: number;
    maxHeight: number;
  } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(false);
  const [busDrawerOpen, setBusDrawerOpen] = useState(false);
  const [busDrawerContentScrollable, setBusDrawerContentScrollable] =
    useState(false);
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
  const visibleRouteLines = useMemo(
    () => getRouteGeometry(routeInfo, activeDirection),
    [routeInfo, activeDirection]
  );
  const visibleBuses = useMemo(
    () => filterBusesByDirection(buses, activeDirection),
    [buses, activeDirection]
  );
  const currentDirectionLabel = activeDirection?.label;

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
      const routeDetails = ROUTES.find((item) => item.id === route);
      const routeData = routeDetails
        ? { ...data, color: routeDetails.color }
        : data;
      const defaultDirection = getRouteDirections(routeData)[0];

      setSelectedDirection(defaultDirection?.key ?? null);
      setRouteInfo(routeData);
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

  const handleDrawerPointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const viewport = viewportRef.current;
      const drawer = busDrawerRef.current;
      if (!viewport || !drawer || window.innerWidth >= 1024) return;

      const styles = getComputedStyle(viewport);
      const minHeight = Number.parseFloat(
        styles.getPropertyValue("--active-buses-drawer-collapsed-height")
      );
      const maxHeight = Math.max(
        minHeight,
        viewport.getBoundingClientRect().height * 0.36
      );

      busDrawerDragRef.current = {
        pointerId: event.pointerId,
        startY: event.clientY,
        startHeight: drawer.getBoundingClientRect().height,
        minHeight,
        maxHeight,
      };
      drawer.dataset.dragging = "true";
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    []
  );

  const handleDrawerPointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = busDrawerDragRef.current;
      const drawer = busDrawerRef.current;
      const viewport = viewportRef.current;
      if (
        !drag ||
        !drawer ||
        !viewport ||
        drag.pointerId !== event.pointerId
      )
        return;

      const nextHeight = Math.min(
        drag.maxHeight,
        Math.max(drag.minHeight, drag.startHeight - (event.clientY - drag.startY))
      );
      viewport.style.setProperty("--active-buses-drawer-height", `${nextHeight}px`);
    },
    []
  );

  const finishDrawerDrag = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      const drag = busDrawerDragRef.current;
      const drawer = busDrawerRef.current;
      const viewport = viewportRef.current;
      if (
        !drag ||
        !drawer ||
        !viewport ||
        drag.pointerId !== event.pointerId
      )
        return;

      const currentHeight = drawer.getBoundingClientRect().height;
      const midpoint = (drag.minHeight + drag.maxHeight) / 2;
      setBusDrawerOpen(currentHeight >= midpoint);
      busDrawerDragRef.current = null;
      drawer.dataset.dragging = "false";

      requestAnimationFrame(() => {
        viewport.style.removeProperty("--active-buses-drawer-height");
      });
    },
    []
  );

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

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    const header = headerRef.current;
    if (!viewport || !header) return;

    const updateControlPosition = () => {
      const viewportTop = viewport.getBoundingClientRect().top;
      const headerBottom = header.getBoundingClientRect().bottom;
      const top = Math.max(88, Math.ceil(headerBottom - viewportTop + 12));

      viewport.style.setProperty("--map-mobile-controls-top", `${top}px`);
    };

    updateControlPosition();

    const resizeObserver = new ResizeObserver(updateControlPosition);
    resizeObserver.observe(header);
    window.addEventListener("resize", updateControlPosition);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateControlPosition);
    };
  }, []);

  useEffect(() => {
    const drawer = busDrawerRef.current;
    if (!drawer) return;

    let lastTouchY: number | null = null;

    const handleTouchStart = (event: TouchEvent) => {
      lastTouchY = event.touches[0]?.clientY ?? null;
    };

    const handleTouchMove = (event: TouchEvent) => {
      const touchY = event.touches[0]?.clientY;
      if (touchY === undefined || lastTouchY === null) return;

      const deltaY = touchY - lastTouchY;
      lastTouchY = touchY;
      const target = event.target;
      const scrollArea =
        target instanceof Element
          ? (target.closest("#active-buses-content") as HTMLElement | null)
          : null;

      if (!scrollArea) {
        event.preventDefault();
        return;
      }

      const hasOverflow = scrollArea.scrollHeight > scrollArea.clientHeight + 1;
      const isAtTop = scrollArea.scrollTop <= 0;
      const isAtBottom =
        scrollArea.scrollTop + scrollArea.clientHeight >=
        scrollArea.scrollHeight - 1;

      if (
        !hasOverflow ||
        (deltaY > 0 && isAtTop) ||
        (deltaY < 0 && isAtBottom)
      ) {
        event.preventDefault();
      }
    };

    const handleTouchEnd = () => {
      lastTouchY = null;
    };

    const handleWheel = (event: WheelEvent) => {
      const target = event.target;
      const scrollArea =
        target instanceof Element
          ? (target.closest("#active-buses-content") as HTMLElement | null)
          : null;

      if (!scrollArea) {
        event.preventDefault();
        return;
      }

      const hasOverflow = scrollArea.scrollHeight > scrollArea.clientHeight + 1;
      const isAtTop = scrollArea.scrollTop <= 0;
      const isAtBottom =
        scrollArea.scrollTop + scrollArea.clientHeight >=
        scrollArea.scrollHeight - 1;

      if (
        !hasOverflow ||
        (event.deltaY < 0 && isAtTop) ||
        (event.deltaY > 0 && isAtBottom)
      ) {
        event.preventDefault();
      }
    };

    drawer.addEventListener("touchstart", handleTouchStart, { passive: true });
    drawer.addEventListener("touchmove", handleTouchMove, { passive: false });
    drawer.addEventListener("touchend", handleTouchEnd);
    drawer.addEventListener("touchcancel", handleTouchEnd);
    drawer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      drawer.removeEventListener("touchstart", handleTouchStart);
      drawer.removeEventListener("touchmove", handleTouchMove);
      drawer.removeEventListener("touchend", handleTouchEnd);
      drawer.removeEventListener("touchcancel", handleTouchEnd);
      drawer.removeEventListener("wheel", handleWheel);
    };
  }, []);

  useEffect(() => {
    const lockViewportScroll = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
    };

    window.addEventListener("scroll", lockViewportScroll, { passive: true });

    return () => window.removeEventListener("scroll", lockViewportScroll);
  }, []);

  useLayoutEffect(() => {
    const content = busDrawerContentRef.current;
    if (!content) return;

    const updateScrollable = () => {
      setBusDrawerContentScrollable(
        content.scrollHeight > content.clientHeight + 1
      );
    };

    updateScrollable();
    const resizeObserver = new ResizeObserver(updateScrollable);
    resizeObserver.observe(content);

    return () => resizeObserver.disconnect();
  }, [busDrawerOpen, loading, selectedRoute, visibleBuses]);

  return (
    <main
      ref={viewportRef}
      className="map-viewport"
      data-bus-drawer-open={busDrawerOpen}
      style={{ inset: 0, position: "fixed" }}
    >
      <div className="map-canvas-layer">
        <BusMap
          routeInfo={visibleRouteInfo}
          routeLines={visibleRouteLines}
          buses={visibleBuses}
          onStopClick={handleStopClick}
        />
      </div>

      <header
        ref={headerRef}
        className="map-app-header absolute z-20 flex flex-wrap items-center gap-2 sm:gap-3"
      >
        <span
          className="nav-floating-control relative flex size-12 shrink-0 items-center justify-center rounded-full"
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

        <div className="nav-floating-control nav-floating-pill min-w-0 flex-1 sm:w-[22rem] sm:flex-none">
          <RouteSelector
            value={selectedRoute}
            onValueChange={handleRouteChange}
            disabled={loading}
            triggerClassName="h-12 rounded-full border-transparent bg-transparent px-4 shadow-none hover:bg-transparent focus-visible:bg-transparent"
          />
        </div>

        <DirectionToggle
          directions={directions}
          value={activeDirection?.key ?? null}
          onValueChange={setSelectedDirection}
          className="nav-floating-control rounded-full bg-card/95 text-foreground hover:bg-muted sm:max-w-40"
        />

        <Button
          variant="secondary"
          size="icon"
          onClick={handleRefresh}
          disabled={!selectedRoute || loading}
          className="nav-floating-control rounded-full bg-card/95 text-foreground hover:bg-muted disabled:bg-card/80"
          aria-label="Refresh bus positions"
          title="Refresh"
        >
          <RefreshCw className={loading ? "animate-spin" : ""} />
        </Button>
      </header>

      <aside
        ref={busDrawerRef}
        className="map-app-panel active-buses-drawer soft-signal-panel absolute z-10 flex flex-col overflow-hidden rounded-2xl border border-border bg-card/95 p-4 backdrop-blur-md lg:w-[360px] lg:p-5"
        aria-label="Active buses"
      >
        <div
          className="drawer-pull-handle absolute inset-x-0 top-0 flex h-6 items-center justify-center lg:hidden"
          onPointerDown={handleDrawerPointerDown}
          onPointerMove={handleDrawerPointerMove}
          onPointerUp={finishDrawerDrag}
          onPointerCancel={finishDrawerDrag}
          role="separator"
          aria-orientation="horizontal"
          aria-label="Resize active buses drawer"
        >
          <span className="h-1 w-10 rounded-full bg-border" aria-hidden="true" />
        </div>

        <div
          className="active-buses-drawer-header mb-4 mt-2 flex shrink-0 items-start justify-between gap-3 lg:mt-0"
          style={{ touchAction: "none" }}
        >
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-[-0.02em]">
              Active buses
            </h1>
            <p className="mt-1 flex min-w-0 flex-col items-start gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-1.5 sm:gap-y-1">
              {selectedRoute ? (
                <>
                  <span className="flex items-center gap-1.5">
                    <BusFront className="size-3.5 shrink-0" />
                    <span>
                      {visibleBuses.length} vehicle
                      {visibleBuses.length === 1 ? "" : "s"} reporting
                    </span>
                  </span>
                  {currentDirectionLabel ? (
                    <span className="flex w-full min-w-0 items-center gap-1.5 sm:w-auto">
                      <span className="hidden sm:inline" aria-hidden="true">
                        ·
                      </span>
                      <ArrowLeftRight className="size-3.5 shrink-0" />
                      <span className="truncate">{currentDirectionLabel}</span>
                    </span>
                  ) : null}
                </>
              ) : (
                "Choose a route to begin"
              )}
            </p>
          </div>
        </div>

        <div
          ref={busDrawerContentRef}
          id="active-buses-content"
          className="active-buses-drawer-content min-h-0 flex-1 overflow-y-auto"
          data-scrollable={busDrawerContentScrollable}
          style={{ touchAction: busDrawerContentScrollable ? "pan-y" : "none" }}
        >
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
