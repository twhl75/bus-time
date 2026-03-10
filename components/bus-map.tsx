"use client";

import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Bus, RouteInfo, BusStop } from "@/lib/types";

import "leaflet/dist/leaflet.css";

const OAKVILLE_CENTER: [number, number] = [43.45, -79.68];

function createBusIcon(color: string) {
  return L.divIcon({
    className: "bus-marker",
    html: `<div style="
      background: ${color};
      color: white;
      border: 2px solid white;
      border-radius: 50%;
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    ">🚌</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const stopIcon = L.divIcon({
  className: "stop-marker",
  html: `<div style="
    background: white;
    border: 2px solid #666;
    border-radius: 50%;
    width: 10px;
    height: 10px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.2);
  "></div>`,
  iconSize: [10, 10],
  iconAnchor: [5, 5],
});

function FitBounds({
  routeInfo,
  buses,
}: {
  routeInfo: RouteInfo | null;
  buses: Bus[];
}) {
  const map = useMap();

  useEffect(() => {
    const points: [number, number][] = [];

    if (routeInfo) {
      for (const pattern of routeInfo.patterns) {
        for (const pt of pattern.points) {
          points.push([pt.lat, pt.lon]);
        }
      }
    }

    for (const bus of buses) {
      points.push([bus.lat, bus.lon]);
    }

    if (points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [map, routeInfo, buses]);

  return null;
}

interface BusMapProps {
  routeInfo: RouteInfo | null;
  buses: Bus[];
  onStopClick: (stop: BusStop, routeId: string) => void;
}

export default function BusMap({
  routeInfo,
  buses,
  onStopClick,
}: BusMapProps) {
  const busIcon = useMemo(
    () => createBusIcon(routeInfo?.color || "#333"),
    [routeInfo?.color]
  );

  const stops = useMemo(() => {
    if (!routeInfo) return [];
    const seen = new Set<string>();
    const result: { stop: BusStop; lat: number; lon: number }[] = [];
    for (const pattern of routeInfo.patterns) {
      for (const pt of pattern.points) {
        if (pt.stop && !seen.has(pt.stop.id)) {
          seen.add(pt.stop.id);
          result.push({ stop: pt.stop, lat: pt.lat, lon: pt.lon });
        }
      }
    }
    return result;
  }, [routeInfo]);

  return (
    <MapContainer
      center={OAKVILLE_CENTER}
      zoom={13}
      className="h-full w-full rounded-lg"
      style={{ minHeight: "400px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FitBounds routeInfo={routeInfo} buses={buses} />

      {routeInfo?.patterns.map((pattern) => (
        <Polyline
          key={pattern.id}
          positions={pattern.points.map((pt) => [pt.lat, pt.lon])}
          pathOptions={{
            color: routeInfo.color,
            weight: 4,
            opacity: 0.7,
          }}
        />
      ))}

      {stops.map(({ stop, lat, lon }) => (
        <Marker
          key={stop.id}
          position={[lat, lon]}
          icon={stopIcon}
          eventHandlers={{
            click: () => onStopClick(stop, routeInfo?.id ?? ""),
          }}
        >
          <Popup>{stop.name}</Popup>
        </Marker>
      ))}

      {buses.map((bus) => (
        <Marker key={bus.id} position={[bus.lat, bus.lon]} icon={busIcon}>
          <Popup>
            <div className="text-sm">
              <div className="font-bold">Bus #{bus.id}</div>
              <div>{bus.direction}</div>
              <div>→ {bus.destination}</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {buses.map((bus) => (
        <CircleMarker
          key={`pulse-${bus.id}`}
          center={[bus.lat, bus.lon]}
          radius={18}
          pathOptions={{
            color: routeInfo?.color || "#333",
            fillColor: routeInfo?.color || "#333",
            fillOpacity: 0.15,
            weight: 1,
            opacity: 0.3,
          }}
        />
      ))}
    </MapContainer>
  );
}
