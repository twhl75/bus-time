"use client";

import { useEffect, useMemo, useRef } from "react";
import maplibregl, {
  GeoJSONSource,
  LngLatBounds,
  Map as MapLibreMap,
  Marker,
} from "maplibre-gl";
import type { FeatureCollection, LineString, Point } from "geojson";
import type { Bus, RouteInfo, BusStop } from "@/lib/types";

import "maplibre-gl/dist/maplibre-gl.css";

const OPENFREEMAP_POSITRON_STYLE =
  "https://tiles.openfreemap.org/styles/positron";
const OAKVILLE_CENTER: [number, number] = [-79.68, 43.45];
const DEFAULT_ROUTE_COLOR = "#333";
const ROUTE_SOURCE_ID = "route-patterns";
const ROUTE_LAYER_ID = "route-patterns-line";
const STOPS_SOURCE_ID = "route-stops";
const STOPS_LAYER_ID = "route-stops-circle";
const BUS_PULSE_SOURCE_ID = "bus-pulses";
const BUS_PULSE_LAYER_ID = "bus-pulses-circle";

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

function createBusMarkerElement(color: string) {
  const marker = document.createElement("div");
  marker.className = "bus-marker";
  marker.style.background = color;
  marker.textContent = "🚌";

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
  destination.textContent = `→ ${bus.destination}`;

  container.append(title, direction, destination);

  return container;
}

function fitBounds(
  map: MapLibreMap,
  routeInfo: RouteInfo | null,
  buses: Bus[]
) {
  const bounds = new LngLatBounds();
  let hasPoints = false;

  if (routeInfo) {
    for (const pattern of routeInfo.patterns) {
      for (const pt of pattern.points) {
        bounds.extend([pt.lon, pt.lat]);
        hasPoints = true;
      }
    }
  }

  for (const bus of buses) {
    bounds.extend([bus.lon, bus.lat]);
    hasPoints = true;
  }

  if (hasPoints) {
    map.fitBounds(bounds, { padding: 30, maxZoom: 15, duration: 500 });
  }
}

function getGeoJsonSource(map: MapLibreMap, id: string) {
  return map.getSource(id) as GeoJSONSource | undefined;
}

export default function BusMap({
  routeInfo,
  buses,
  onStopClick,
}: BusMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const busMarkersRef = useRef<Marker[]>([]);
  const onStopClickRef = useRef(onStopClick);
  const routeInfoRef = useRef(routeInfo);
  const stops = useMemo(() => getStops(routeInfo), [routeInfo]);

  useEffect(() => {
    onStopClickRef.current = onStopClick;
  }, [onStopClick]);

  useEffect(() => {
    routeInfoRef.current = routeInfo;
  }, [routeInfo]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_POSITRON_STYLE,
      center: OAKVILLE_CENTER,
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-right"
    );
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }));

    map.on("load", () => {
      map.addSource(ROUTE_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_LINE_COLLECTION,
      });
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

      map.addSource(STOPS_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_POINT_COLLECTION,
      });
      map.addLayer({
        id: STOPS_LAYER_ID,
        type: "circle",
        source: STOPS_SOURCE_ID,
        paint: {
          "circle-color": "#ffffff",
          "circle-radius": 5,
          "circle-stroke-color": "#666666",
          "circle-stroke-width": 2,
        },
      });

      map.addSource(BUS_PULSE_SOURCE_ID, {
        type: "geojson",
        data: EMPTY_POINT_COLLECTION,
      });
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
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const updateMapData = () => {
      const routeColor = routeInfo?.color || DEFAULT_ROUTE_COLOR;
      const routeSource = getGeoJsonSource(map, ROUTE_SOURCE_ID);
      const stopsSource = getGeoJsonSource(map, STOPS_SOURCE_ID);
      const busPulseSource = getGeoJsonSource(map, BUS_PULSE_SOURCE_ID);

      routeSource?.setData({
        type: "FeatureCollection",
        features:
          routeInfo?.patterns.map((pattern) => ({
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: pattern.points.map((pt) => [pt.lon, pt.lat]),
            },
          })) ?? [],
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
          element: createBusMarkerElement(routeColor),
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

      fitBounds(map, routeInfo, buses);
    };

    if (map.loaded()) {
      updateMapData();
      return;
    }

    map.once("load", updateMapData);
  }, [routeInfo, stops, buses]);

  return (
    <div
      ref={mapContainerRef}
      className="h-full w-full"
      style={{ minHeight: "400px" }}
    />
  );
}
