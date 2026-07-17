import { describe, expect, it } from "vitest";
import {
  filterBusesByDirection,
  getRouteDirections,
} from "./route-directions";
import type { Bus, RouteInfo, RoutePattern } from "./types";

function pattern(
  id: string,
  direction: string,
  firstStop: string,
  lastStop: string
): RoutePattern {
  return {
    id,
    direction,
    displayDirection: direction,
    points: [
      { lat: 0, lon: 0, stop: { id: `${id}-first`, name: firstStop } },
      { lat: 0, lon: 0, stop: { id: `${id}-last`, name: lastStop } },
    ],
  };
}

function route(id: string, patterns: RoutePattern[]): RouteInfo {
  return {
    id,
    shortName: id,
    name: `Route ${id}`,
    color: "#000000",
    patterns,
  };
}

describe("getRouteDirections", () => {
  it("combines route 5's chained eastbound patterns into one direction", () => {
    const directions = getRouteDirections(
      route("5", [
        pattern("7746", "EAST", "Uptown Core Terminal", "Vega + Laird"),
        pattern(
          "7747",
          "EAST",
          "Dundas St + Highway 407 GO Carpool",
          "Uptown Core Terminal"
        ),
        pattern(
          "7749",
          "WEST",
          "Uptown Core Terminal",
          "Dundas St + Highway 407 GO Carpool"
        ),
      ])
    );

    expect(directions).toEqual([
      {
        key: "east",
        destination: "Laird & Winston Churchill",
        label: "To Laird & Winston Churchill",
        patternIds: ["7746", "7747"],
      },
      {
        key: "west",
        destination: "Dundas/Highway 407 GO Carpool",
        label: "To Dundas/Highway 407 GO Carpool",
        patternIds: ["7749"],
      },
    ]);
  });

  it("combines chained route 14 patterns into two through-directions", () => {
    const directions = getRouteDirections(
      route("14", [
        pattern("7562", "14-WEST", "Oakville GO Station", "South Oakville Centre"),
        pattern("7565", "14-EAST", "Appleby GO Station", "South Oakville Centre"),
        pattern("7568", "14-EAST", "South Oakville Centre", "Oakville GO Station"),
        pattern("7570", "14-WEST", "South Oakville Centre", "Appleby GO Station"),
      ])
    );

    expect(directions.map(({ label, patternIds }) => ({ label, patternIds }))).toEqual([
      { label: "To Appleby GO", patternIds: ["7562", "7570"] },
      { label: "To Oakville GO", patternIds: ["7565", "7568"] },
    ]);
  });
});

describe("filterBusesByDirection", () => {
  it("uses the feed direction when a vehicle's pattern id is unavailable", () => {
    const [east] = getRouteDirections(
      route("5", [pattern("7746", "EAST", "Uptown Core Terminal", "Vega + Laird")])
    );
    const buses = [
      {
        id: "2025",
        patternId: "unknown",
        directionDisplay: "EAST",
        destination: "Winston Churchill & Dundas",
      },
      {
        id: "1401",
        patternId: "7749",
        directionDisplay: "WEST",
        destination: "Dundas/407 Carpool",
      },
    ] as Bus[];

    expect(filterBusesByDirection(buses, east).map((bus) => bus.id)).toEqual([
      "2025",
    ]);
  });
});
