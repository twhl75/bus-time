import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { RouteInfo, RoutePattern, RoutePoint } from "@/lib/types";

const parser = new XMLParser();

export async function GET(request: NextRequest) {
  const route = request.nextUrl.searchParams.get("route");
  if (!route || !/^[a-zA-Z0-9]+$/.test(route)) {
    return NextResponse.json({ error: "Invalid route" }, { status: 400 });
  }

  const url = `https://busfinder.oakvilletransit.ca/bustime/map/getRoutePoints.jsp?route=${encodeURIComponent(route)}&key=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch route data" }, { status: 502 });
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const r = parsed?.route;

  if (!r) {
    return NextResponse.json({ error: "Route not found" }, { status: 404 });
  }

  const patternsRaw = r.pas?.pa;
  const patternArray = !patternsRaw
    ? []
    : Array.isArray(patternsRaw)
      ? patternsRaw
      : [patternsRaw];

  const patterns: RoutePattern[] = patternArray.map(
    (pa: Record<string, unknown>) => {
      const pointsRaw = (pa as Record<string, Record<string, unknown>>).pt;
      const pointArray = !pointsRaw
        ? []
        : Array.isArray(pointsRaw)
          ? pointsRaw
          : [pointsRaw];

      const points: RoutePoint[] = pointArray.map(
        (pt: Record<string, unknown>) => {
          const point: RoutePoint = {
            lat: Number(pt.lat),
            lon: Number(pt.lon),
          };
          const bs = pt.bs as Record<string, unknown> | undefined;
          if (bs) {
            point.stop = {
              id: String(bs.id ?? ""),
              name: String(bs.st ?? ""),
            };
          }
          return point;
        }
      );

      return {
        id: String(pa.id ?? ""),
        direction: String(pa.d ?? ""),
        displayDirection: String(pa.dd ?? ""),
        points,
      };
    }
  );

  const routeInfo: RouteInfo = {
    id: String(r.id ?? ""),
    shortName: String(r.sn ?? ""),
    name: String(r.nm ?? ""),
    color: String(r.c ?? "#333333"),
    patterns,
  };

  return NextResponse.json(routeInfo);
}
