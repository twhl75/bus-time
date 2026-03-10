import { NextRequest, NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import type { StopInfo, StopPrediction } from "@/lib/types";

const parser = new XMLParser();

export async function GET(request: NextRequest) {
  const stop = request.nextUrl.searchParams.get("stop");
  const route = request.nextUrl.searchParams.get("route");

  if (!stop || !/^[0-9]+$/.test(stop)) {
    return NextResponse.json({ error: "Invalid stop ID" }, { status: 400 });
  }
  if (!route || !/^[a-zA-Z0-9]+$/.test(route)) {
    return NextResponse.json({ error: "Invalid route" }, { status: 400 });
  }

  const url = `https://busfinder.oakvilletransit.ca/bustime/map/getStopPredictions.jsp?stop=${encodeURIComponent(stop)}&route=${encodeURIComponent(route)}&key=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: "Failed to fetch predictions" }, { status: 502 });
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const s = parsed?.stop;

  if (!s) {
    return NextResponse.json({ error: "Stop not found" }, { status: 404 });
  }

  const predsRaw = s.pre;
  const predArray = !predsRaw
    ? []
    : Array.isArray(predsRaw)
      ? predsRaw
      : [predsRaw];

  const predictions: StopPrediction[] = predArray.map(
    (p: Record<string, unknown>) => ({
      time: String(p.pt ?? ""),
      destination: String(p.fd ?? ""),
      vehicleId: String(p.v ?? ""),
      scheduled: p.scheduled === true || p.scheduled === "true",
      routeNumber: String(p.rn ?? ""),
    })
  );

  const stopInfo: StopInfo = {
    id: String(s.id ?? ""),
    name: String(s.nm ?? ""),
    predictions,
  };

  return NextResponse.json(stopInfo);
}
