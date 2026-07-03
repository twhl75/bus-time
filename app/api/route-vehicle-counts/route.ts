import { NextResponse } from "next/server";
import { XMLParser } from "fast-xml-parser";
import { ROUTES } from "@/lib/routes";

const parser = new XMLParser();

async function getVehicleCount(route: string) {
  const url = `https://busfinder.oakvilletransit.ca/bustime/map/getBusesForRoute.jsp?route=${encodeURIComponent(route)}&key=${Date.now()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    return 0;
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);
  const busesRaw = parsed?.buses?.bus;

  if (!busesRaw) {
    return 0;
  }

  return Array.isArray(busesRaw) ? busesRaw.length : 1;
}

export async function GET() {
  const counts = await Promise.all(
    ROUTES.map(async (route) => [
      route.id,
      await getVehicleCount(route.id),
    ])
  );

  return NextResponse.json(Object.fromEntries(counts));
}
