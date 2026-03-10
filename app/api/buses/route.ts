import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { Bus } from "@/lib/types";

const parser = new XMLParser();

export async function GET(request: NextRequest) {
  const route = request.nextUrl.searchParams.get("route");
  if (!route || !/^[a-zA-Z0-9]+$/.test(route)) {
    return NextResponse.json({ error: "Invalid route" }, { status: 400 });
  }

  const url = `https://busfinder.oakvilletransit.ca/bustime/map/getBusesForRoute.jsp?route=${encodeURIComponent(route)}&key=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch bus data" }, { status: 502 });
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);

  const busesRaw = parsed?.buses?.bus;
  if (!busesRaw) {
    return NextResponse.json([]);
  }

  const busArray = Array.isArray(busesRaw) ? busesRaw : [busesRaw];

  const buses: Bus[] = busArray.map((b: Record<string, unknown>) => ({
    id: String(b.id ?? ""),
    lat: Number(b.lat),
    lon: Number(b.lon),
    direction: String(b.d ?? ""),
    directionDisplay: String(b.dd ?? ""),
    directionCode: String(b.dn ?? ""),
    destination: String(b.fs ?? ""),
    routeId: String(b.rt ?? ""),
    routeDisplay: String(b.rtdd ?? ""),
    patternId: String(b.pid ?? ""),
    run: String(b.run ?? ""),
  }));

  return NextResponse.json(buses);
}
