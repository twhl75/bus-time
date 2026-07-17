import { describe, expect, it } from "vitest";
import { getRouteDirections } from "./route-directions";
import {
  getPatternRouteLine,
  getPointDistanceMeters,
  getRouteGeometry,
} from "./route-geometry";
import type { RouteInfo, RoutePattern, RoutePoint } from "./types";

function point(lat: number, lon: number, stopId?: string, stopName?: string) {
  const routePoint: RoutePoint = { lat, lon };
  if (stopId && stopName) {
    routePoint.stop = { id: stopId, name: stopName };
  }
  return routePoint;
}

function pattern(
  id: string,
  direction: string,
  points: RoutePoint[]
): RoutePattern {
  return { id, direction, displayDirection: direction, points };
}

function route5(): RouteInfo {
  return {
    id: "5",
    shortName: "5",
    name: "Dundas",
    color: "#f28a3b",
    patterns: [
      pattern("7746", "EAST", [
        point(43.485887, -79.719198, "3233", "Uptown Core Terminal"),
        point(43.50438, -79.70143),
        point(43.50798, -79.69752),
        point(43.516758, -79.691072, "3173", "Vega + Laird"),
        point(43.5168, -79.6914),
        point(43.51767, -79.69061),
        point(43.507903, -79.697396, "2211", "Dundas St East + 9th Line"),
        point(43.50798, -79.69752),
        point(43.5107, -79.69461),
        point(43.5155, -79.68938),
        point(43.51667, -79.69117),
        point(43.516758, -79.691072, "3173", "Vega + Laird"),
      ]),
      pattern("7747", "EAST", [
        point(
          43.388579,
          -79.829729,
          "2206",
          "Dundas St + Highway 407 GO Carpool"
        ),
        point(43.45, -79.76),
        point(43.485887, -79.719198, "3233", "Uptown Core Terminal"),
      ]),
      pattern("7749", "WEST", [
        point(43.485887, -79.719198, "3233", "Uptown Core Terminal"),
        point(43.45, -79.76),
        point(
          43.388579,
          -79.829729,
          "2206",
          "Dundas St + Highway 407 GO Carpool"
        ),
      ]),
    ],
  };
}

function route5WithWestExtension(): RouteInfo {
  const routeInfo = route5();

  return {
    ...routeInfo,
    patterns: [
      pattern("7754", "WEST", [
        point(43.516758, -79.691072, "3173", "Laird + Ridgeway"),
        point(43.5107, -79.69461),
        point(43.485887, -79.719198, "3233", "Uptown Core Terminal"),
      ]),
      routeInfo.patterns[1],
      routeInfo.patterns[2],
    ],
  };
}

function getBounds(lines: RoutePoint[][]) {
  const points = lines.flat();
  return {
    minLat: Math.min(...points.map((item) => item.lat)),
    maxLat: Math.max(...points.map((item) => item.lat)),
    minLon: Math.min(...points.map((item) => item.lon)),
    maxLon: Math.max(...points.map((item) => item.lon)),
  };
}

describe("getPatternRouteLine", () => {
  it("removes a sparse terminal detour when the detailed approach follows", () => {
    const [malformedPattern] = route5().patterns;
    const line = getPatternRouteLine(malformedPattern);

    expect(line).not.toContainEqual(point(43.51767, -79.69061));
    expect(
      line.some(
        (item, index) =>
          index > 0 &&
          line[index - 1].lat > 43.5 &&
          getPointDistanceMeters(line[index - 1], item) > 1000
      )
    ).toBe(false);
    expect(line.at(-1)?.stop?.name).toBe("Vega + Laird");
  });
});

describe("getRouteGeometry", () => {
  it("completes route 5 westbound with the cleaned reverse eastern leg", () => {
    const routeInfo = route5();
    const directions = getRouteDirections(routeInfo);
    const east = directions.find((direction) => direction.key === "east") ?? null;
    const west = directions.find((direction) => direction.key === "west") ?? null;
    const eastLines = getRouteGeometry(routeInfo, east);
    const westLines = getRouteGeometry(routeInfo, west);

    expect(eastLines).toHaveLength(2);
    expect(westLines).toHaveLength(2);
    expect(westLines[1][0].stop?.name).toBe("Vega + Laird");
    expect(westLines[1].at(-1)?.stop?.name).toBe("Uptown Core Terminal");
    expect(getBounds(westLines)).toEqual(getBounds(eastLines));
  });

  it("completes eastbound when the feed assigns the eastern leg westbound", () => {
    const routeInfo = route5WithWestExtension();
    const directions = getRouteDirections(routeInfo);
    const east = directions.find((direction) => direction.key === "east") ?? null;
    const west = directions.find((direction) => direction.key === "west") ?? null;
    const eastLines = getRouteGeometry(routeInfo, east);
    const westLines = getRouteGeometry(routeInfo, west);

    expect(eastLines).toHaveLength(2);
    expect(westLines).toHaveLength(2);
    expect(eastLines[1][0].stop?.name).toBe("Uptown Core Terminal");
    expect(eastLines[1].at(-1)?.stop?.name).toBe("Laird + Ridgeway");
    expect(getBounds(eastLines)).toEqual(getBounds(westLines));
  });

  it("does not duplicate equivalent eastern legs with different stop names", () => {
    const oldFeed = route5();
    const currentFeed = route5WithWestExtension();
    const routeInfo = {
      ...oldFeed,
      patterns: [
        oldFeed.patterns[0],
        currentFeed.patterns[0],
        oldFeed.patterns[1],
        oldFeed.patterns[2],
      ],
    };
    const directions = getRouteDirections(routeInfo);
    const east = directions.find((direction) => direction.key === "east") ?? null;
    const west = directions.find((direction) => direction.key === "west") ?? null;

    expect(getRouteGeometry(routeInfo, east)).toHaveLength(2);
    expect(getRouteGeometry(routeInfo, west)).toHaveLength(2);
  });

  it("does not add completion geometry to other routes", () => {
    const routeInfo = {
      ...route5(),
      id: "14",
    };
    const [east] = getRouteDirections(routeInfo);

    expect(getRouteGeometry(routeInfo, east)).toHaveLength(2);
  });
});
