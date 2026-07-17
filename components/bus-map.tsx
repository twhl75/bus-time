"use client";

import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { BusFront } from "lucide-react";
import maplibregl, {
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
} from "maplibre-gl";
import type { FeatureCollection, LineString, Point } from "geojson";
import type { RouteLine } from "@/lib/route-geometry";
import type { Bus, RouteInfo, BusStop } from "@/lib/types";

import "maplibre-gl/dist/maplibre-gl.css";
import "./bus-map.css";

const OPENFREEMAP_STYLE_BY_THEME = {
  light: "https://tiles.openfreemap.org/styles/positron",
  dark: "https://tiles.openfreemap.org/styles/dark",
} as const;
const OAKVILLE_CENTER: [number, number] = [-79.68, 43.45];
const DEFAULT_ROUTE_COLOR = "#333";
const ROUTE_SOURCE_ID = "route-patterns";
const ROUTE_LAYER_ID = "route-patterns-line";
const STOPS_SOURCE_ID = "route-stops";
const STOPS_LAYER_ID = "route-stops-circle";
const BUS_PULSE_SOURCE_ID = "bus-pulses";
const BUS_PULSE_LAYER_ID = "bus-pulses-circle";
const THEME_STORAGE_KEY = "theme-preference";
const EMPTY_LINE_COLLECTION: FeatureCollection<LineString> = {
  type: "FeatureCollection",
  features: [],
};

const EMPTY_POINT_COLLECTION: FeatureCollection<Point> = {
  type: "FeatureCollection",
  features: [],
};

interface BusMapProps {
  routeInfo: RouteInfo | null;
  routeLines: RouteLine[];
  buses: Bus[];
  onStopClick: (stop: BusStop, routeId: string) => void;
}

function getStops(routeInfo: RouteInfo | null) {
  if (!routeInfo) return [];

  const seen = new Set<string>();
  const stops: { stop: BusStop; lat: number; lon: number }[] = [];

  for (const pattern of routeInfo.patterns) {
    for (const pt of pattern.points) {
      if (pt.stop && !seen.has(pt.stop.id)) {
        seen.add(pt.stop.id);
        stops.push({ stop: pt.stop, lat: pt.lat, lon: pt.lon });
      }
    }
  }

  return stops;
}

function createBusMarkerElement(color: string, label: string) {
  const marker = document.createElement("div");
  marker.className = "bus-marker";
  marker.style.background = color;
  marker.setAttribute("aria-label", `Bus ${label}`);
  marker.innerHTML = renderToStaticMarkup(
    <BusFront className="bus-marker-icon" aria-hidden="true" />
  );

  return marker;
}

function createBusPopup(bus: Bus) {
  const container = document.createElement("div");
  container.className = "text-sm";

  const title = document.createElement("div");
  title.className = "font-bold";
  title.textContent = `Bus #${bus.id}`;

  const direction = document.createElement("div");
  direction.textContent = bus.direction;

  const destination = document.createElement("div");
  destination.textContent = bus.destination;

  container.append(title, direction, destination);

  return container;
}

function collapseInitialAttribution(map: MapLibreMap) {
  requestAnimationFrame(() => {
    const attribution = map
      .getContainer()
      .querySelector("details.maplibregl-ctrl-attrib.maplibregl-compact");

    attribution?.classList.remove("maplibregl-compact-show");
    attribution?.removeAttribute("open");
  });
}

function fitBounds(
  map: MapLibreMap,
  routeLines: RouteLine[],
  buses: Bus[]
) {
  const bounds = new LngLatBounds();
  let hasPoints = false;

  for (const line of routeLines) {
    for (const pt of line) {
      bounds.extend([pt.lon, pt.lat]);
      hasPoints = true;
    }
  }

  for (const bus of buses) {
    bounds.extend([bus.lon, bus.lat]);
    hasPoints = true;
  }

  if (hasPoints) {
    const isDesktop = window.innerWidth >= 1024;
    map.fitBounds(bounds, {
      padding: isDesktop
        ? { top: 96, right: 400, bottom: 48, left: 48 }
        : { top: 96, right: 36, bottom: Math.min(320, window.innerHeight * 0.38), left: 36 },
      maxZoom: 15,
      duration: 500,
    });
  }
}

function getGeoJsonSource(map: MapLibreMap, id: string) {
  return map.getSource(id) as GeoJSONSource | undefined;
}

function getIsDarkThemeSnapshot() {
  if (typeof window === "undefined") return false;

  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return storedTheme === "dark" || (storedTheme !== "light" && prefersDark);
}

function subscribeToThemeChange(onChange: () => void) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  window.addEventListener("storage", onChange);
  window.addEventListener("theme-preference-change", onChange);
  media.addEventListener("change", onChange);

  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("theme-preference-change", onChange);
    media.removeEventListener("change", onChange);
  };
}

function getMapStyle(isDark: boolean) {
  return isDark
    ? OPENFREEMAP_STYLE_BY_THEME.dark
    : OPENFREEMAP_STYLE_BY_THEME.light;
}

function addMapOverlays(map: MapLibreMap, isDark: boolean) {
  if (!map.getSource(ROUTE_SOURCE_ID)) {
    map.addSource(ROUTE_SOURCE_ID, {
      type: "geojson",
      data: EMPTY_LINE_COLLECTION,
    });
  }

  if (!map.getLayer(ROUTE_LAYER_ID)) {
    map.addLayer({
      id: ROUTE_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: {
        "line-cap": "round",
        "line-join": "round",
      },
      paint: {
        "line-color": DEFAULT_ROUTE_COLOR,
        "line-opacity": 0.75,
        "line-width": 4,
      },
    });
  }

  if (!map.getSource(STOPS_SOURCE_ID)) {
    map.addSource(STOPS_SOURCE_ID, {
      type: "geojson",
      data: EMPTY_POINT_COLLECTION,
    });
  }

  if (!map.getLayer(STOPS_LAYER_ID)) {
    map.addLayer({
      id: STOPS_LAYER_ID,
      type: "circle",
      source: STOPS_SOURCE_ID,
      paint: {
        "circle-color": isDark ? "#222220" : "#ffffff",
        "circle-radius": 5,
        "circle-stroke-color": isDark ? "#f7f7f4" : "#666666",
        "circle-stroke-width": 2,
      },
    });
  }

  if (!map.getSource(BUS_PULSE_SOURCE_ID)) {
    map.addSource(BUS_PULSE_SOURCE_ID, {
      type: "geojson",
      data: EMPTY_POINT_COLLECTION,
    });
  }

  if (!map.getLayer(BUS_PULSE_LAYER_ID)) {
    map.addLayer({
      id: BUS_PULSE_LAYER_ID,
      type: "circle",
      source: BUS_PULSE_SOURCE_ID,
      paint: {
        "circle-color": DEFAULT_ROUTE_COLOR,
        "circle-opacity": 0.18,
        "circle-radius": 18,
        "circle-stroke-color": DEFAULT_ROUTE_COLOR,
        "circle-stroke-opacity": 0.3,
        "circle-stroke-width": 1,
      },
    });
  }
}

export default function BusMap({
  routeInfo,
  routeLines,
  buses,
  onStopClick,
}: BusMapProps) {
  const isDarkTheme = useSyncExternalStore(
    subscribeToThemeChange,
    getIsDarkThemeSnapshot,
    () => false
  );
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busMarkersRef = useRef<Marker[]>([]);
  const onStopClickRef = useRef(onStopClick);
  const routeInfoRef = useRef(routeInfo);
  const updateMapDataRef = useRef<(() => void) | null>(null);
  const styleUrlRef = useRef<string | null>(null);
  const styleReadyRef = useRef(false);
  const stops = useMemo(() => getStops(routeInfo), [routeInfo]);

  useEffect(() => {
    onStopClickRef.current = onStopClick;
  }, [onStopClick]);

  useEffect(() => {
    routeInfoRef.current = routeInfo;
  }, [routeInfo]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const initialStyle = getMapStyle(getIsDarkThemeSnapshot());
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: OAKVILLE_CENTER,
      zoom: 13,
      attributionControl: false,
    });
    styleUrlRef.current = initialStyle;
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );
    collapseInitialAttribution(map);
    map.once("load", () => collapseInitialAttribution(map));
    map.once("idle", () => collapseInitialAttribution(map));
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    const handleStyleLoad = () => {
      styleReadyRef.current = true;
      addMapOverlays(map, getIsDarkThemeSnapshot());
      updateMapDataRef.current?.();
    };

    map.on("style.load", handleStyleLoad);

    map.on("load", () => {
      handleStyleLoad();

      map.on("click", STOPS_LAYER_ID, (event) => {
        const feature = event.features?.[0];
        const stopId = feature?.properties?.id;
        if (typeof stopId !== "string") return;

        const route = routeInfoRef.current;
        const stop = getStops(route).find((item) => item.stop.id === stopId);
        if (stop && route) {
          new maplibregl.Popup({ offset: 8 })
            .setLngLat(event.lngLat)
            .setText(stop.stop.name)
            .addTo(map);
          onStopClickRef.current(stop.stop, route.id);
        }
      });

      map.on("mouseenter", STOPS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", STOPS_LAYER_ID, () => {
        map.getCanvas().style.cursor = "";
      });
    });

    mapRef.current = map;

    return () => {
      busMarkersRef.current.forEach((marker) => marker.remove());
      busMarkersRef.current = [];
      map.remove();
      mapRef.current = null;
      styleUrlRef.current = null;
      styleReadyRef.current = false;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const nextStyle = getMapStyle(isDarkTheme);
    if (styleUrlRef.current === nextStyle) return;

    styleReadyRef.current = false;
    map.setStyle(nextStyle);
    styleUrlRef.current = nextStyle;
  }, [isDarkTheme]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateMapData = () => {
      if (!styleReadyRef.current) return;

      addMapOverlays(map, getIsDarkThemeSnapshot());

      const routeColor = routeInfo?.color || DEFAULT_ROUTE_COLOR;
      const routeSource = getGeoJsonSource(map, ROUTE_SOURCE_ID);
      const stopsSource = getGeoJsonSource(map, STOPS_SOURCE_ID);
      const busPulseSource = getGeoJsonSource(map, BUS_PULSE_SOURCE_ID);

      routeSource?.setData({
        type: "FeatureCollection",
        features: routeLines.map((line) => ({
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: line.map((point) => [point.lon, point.lat]),
          },
        })),
      });

      stopsSource?.setData({
        type: "FeatureCollection",
        features: stops.map(({ stop, lat, lon }) => ({
          type: "Feature",
          properties: {
            id: stop.id,
            name: stop.name,
          },
          geometry: {
            type: "Point",
            coordinates: [lon, lat],
          },
        })),
      });

      busPulseSource?.setData({
        type: "FeatureCollection",
        features: buses.map((bus) => ({
          type: "Feature",
          properties: {
            id: bus.id,
          },
          geometry: {
            type: "Point",
            coordinates: [bus.lon, bus.lat],
          },
        })),
      });

      if (map.getLayer(ROUTE_LAYER_ID)) {
        map.setPaintProperty(ROUTE_LAYER_ID, "line-color", routeColor);
      }
      if (map.getLayer(BUS_PULSE_LAYER_ID)) {
        map.setPaintProperty(BUS_PULSE_LAYER_ID, "circle-color", routeColor);
        map.setPaintProperty(
          BUS_PULSE_LAYER_ID,
          "circle-stroke-color",
          routeColor
        );
      }

      busMarkersRef.current.forEach((marker) => marker.remove());
      busMarkersRef.current = buses.map((bus) =>
        new maplibregl.Marker({
          element: createBusMarkerElement(routeColor, bus.id),
          anchor: "center",
        })
          .setLngLat([bus.lon, bus.lat])
          .setPopup(
            new maplibregl.Popup({ offset: 18 }).setDOMContent(
              createBusPopup(bus)
            )
          )
          .addTo(map)
      );

      fitBounds(map, routeLines, buses);
    };

    updateMapDataRef.current = updateMapData;

    if (styleReadyRef.current) {
      updateMapData();
    }
  }, [routeInfo, routeLines, stops, buses]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ minHeight: "400px" }}
    />
  );
}
