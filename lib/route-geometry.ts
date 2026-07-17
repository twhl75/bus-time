import { getDestinationKey } from "./route-directions";
import type { RouteDirection } from "./route-directions";
import type { RouteInfo, RoutePattern, RoutePoint } from "./types";

export type RouteLine = RoutePoint[];

interface GeometryCompletion {
  sourceDirection: string;
  sourceOrigin: string;
  sourceDestination: string;
  reverse: boolean;
}

const ROUTE_GEOMETRY_COMPLETIONS: Record<
  string,
  Record<string, GeometryCompletion[]>
> = {
  "5": {
    east: [
      {
        sourceDirection: "west",
        sourceOrigin: "Laird + Ridgeway",
        sourceDestination: "Uptown Core Terminal",
        reverse: true,
      },
    ],
    west: [
      {
        sourceDirection: "east",
        sourceOrigin: "Uptown Core Terminal",
        sourceDestination: "Vega + Laird",
        reverse: true,
      },
    ],
  },
};

const ROUTE_STOP_LINE_POINT_THRESHOLD_METERS = 35;
const RETURNED_ANCHOR_THRESHOLD_METERS = 50;
const MIN_DETOUR_LENGTH_METERS = 500;
const EQUIVALENT_ENDPOINT_THRESHOLD_METERS = 200;

export function getPointDistanceMeters(a: RoutePoint, b: RoutePoint) {
  const earthRadiusMeters = 6371000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latA = toRadians(a.lat);
  const latB = toRadians(b.lat);
  const latDelta = toRadians(b.lat - a.lat);
  const lonDelta = toRadians(b.lon - a.lon);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(latA) * Math.cos(latB) * Math.sin(lonDelta / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

function getLineLength(points: RoutePoint[], start: number, end: number) {
  let length = 0;

  for (let index = start; index < end; index += 1) {
    length += getPointDistanceMeters(points[index], points[index + 1]);
  }

  return length;
}

function getStopIds(points: RoutePoint[]) {
  return new Set(
    points
      .map((point) => point.stop?.id.trim())
      .filter((stopId): stopId is string => Boolean(stopId))
  );
}

function removeReturnedDetours(points: RoutePoint[]) {
  let cleaned = [...points];
  let removedDetour = true;

  while (removedDetour) {
    removedDetour = false;

    for (let returnIndex = 3; returnIndex < cleaned.length; returnIndex += 1) {
      for (
        let anchorIndex = returnIndex - 3;
        anchorIndex >= 0;
        anchorIndex -= 1
      ) {
        if (
          getPointDistanceMeters(
            cleaned[anchorIndex],
            cleaned[returnIndex]
          ) > RETURNED_ANCHOR_THRESHOLD_METERS
        ) {
          continue;
        }

        if (
          getPointDistanceMeters(
            cleaned[returnIndex - 1],
            cleaned[returnIndex]
          ) < MIN_DETOUR_LENGTH_METERS
        ) {
          continue;
        }

        if (
          getLineLength(cleaned, anchorIndex, returnIndex) <
          MIN_DETOUR_LENGTH_METERS
        ) {
          continue;
        }

        const detourStopIds = getStopIds(
          cleaned.slice(anchorIndex + 1, returnIndex)
        );
        const remainingStopIds = getStopIds(cleaned.slice(returnIndex));
        const repeatsAStopLater = Array.from(detourStopIds).some((stopId) =>
          remainingStopIds.has(stopId)
        );

        if (!repeatsAStopLater) continue;

        // The feed occasionally inserts a sparse terminal approach, returns to
        // an earlier anchor, then supplies the detailed approach. Connecting
        // that sequence as one line creates long diagonal chords on the map.
        cleaned = [
          ...cleaned.slice(0, anchorIndex + 1),
          ...cleaned.slice(returnIndex),
        ];
        removedDetour = true;
        break;
      }

      if (removedDetour) break;
    }
  }

  return cleaned;
}

function shouldIncludeStopInRouteLine(
  points: RoutePoint[],
  index: number
) {
  const point = points[index];
  if (!point.stop) return true;

  const previousPoint = points[index - 1];
  const nextPoint = points[index + 1];
  if (!previousPoint || !nextPoint) return true;

  return (
    getPointDistanceMeters(previousPoint, point) >
      ROUTE_STOP_LINE_POINT_THRESHOLD_METERS ||
    getPointDistanceMeters(point, nextPoint) >
      ROUTE_STOP_LINE_POINT_THRESHOLD_METERS
  );
}

export function getPatternRouteLine(pattern: RoutePattern): RouteLine {
  const cleanedPoints = removeReturnedDetours(pattern.points);

  return cleanedPoints.filter((_, index) =>
    shouldIncludeStopInRouteLine(cleanedPoints, index)
  );
}

function getFirstStopName(pattern: RoutePattern) {
  return (
    pattern.points.find((point) => point.stop?.name.trim())?.stop?.name ?? ""
  );
}

function getFirstStopPoint(pattern: RoutePattern) {
  return pattern.points.find((point) => point.stop?.name.trim()) ?? null;
}

function getLastStopName(pattern: RoutePattern) {
  for (let index = pattern.points.length - 1; index >= 0; index -= 1) {
    const stopName = pattern.points[index].stop?.name.trim();
    if (stopName) return stopName;
  }

  return "";
}

function getLastStopPoint(pattern: RoutePattern) {
  for (let index = pattern.points.length - 1; index >= 0; index -= 1) {
    if (pattern.points[index].stop?.name.trim()) return pattern.points[index];
  }

  return null;
}

function getPatternDirectionKey(pattern: RoutePattern) {
  return getDestinationKey(
    pattern.displayDirection.trim() || pattern.direction.trim()
  );
}

function matchesCompletion(
  pattern: RoutePattern,
  completion: GeometryCompletion
) {
  return (
    getPatternDirectionKey(pattern) === completion.sourceDirection &&
    getDestinationKey(getFirstStopName(pattern)) ===
      getDestinationKey(completion.sourceOrigin) &&
    getDestinationKey(getLastStopName(pattern)) ===
      getDestinationKey(completion.sourceDestination)
  );
}

function hasEquivalentCoverage(
  patterns: RoutePattern[],
  sourcePattern: RoutePattern
) {
  const sourceOrigin = getDestinationKey(getFirstStopName(sourcePattern));
  const sourceDestination = getDestinationKey(getLastStopName(sourcePattern));
  const sourceOriginPoint = getFirstStopPoint(sourcePattern);
  const sourceDestinationPoint = getLastStopPoint(sourcePattern);

  return patterns.some((pattern) => {
    const origin = getDestinationKey(getFirstStopName(pattern));
    const destination = getDestinationKey(getLastStopName(pattern));
    const originPoint = getFirstStopPoint(pattern);
    const destinationPoint = getLastStopPoint(pattern);
    const matchesSpatially =
      sourceOriginPoint &&
      sourceDestinationPoint &&
      originPoint &&
      destinationPoint &&
      ((getPointDistanceMeters(originPoint, sourceOriginPoint) <=
        EQUIVALENT_ENDPOINT_THRESHOLD_METERS &&
        getPointDistanceMeters(destinationPoint, sourceDestinationPoint) <=
          EQUIVALENT_ENDPOINT_THRESHOLD_METERS) ||
        (getPointDistanceMeters(originPoint, sourceDestinationPoint) <=
          EQUIVALENT_ENDPOINT_THRESHOLD_METERS &&
          getPointDistanceMeters(destinationPoint, sourceOriginPoint) <=
            EQUIVALENT_ENDPOINT_THRESHOLD_METERS));

    return (
      (origin === sourceOrigin && destination === sourceDestination) ||
      (origin === sourceDestination && destination === sourceOrigin) ||
      matchesSpatially
    );
  });
}

export function getRouteGeometry(
  routeInfo: RouteInfo | null,
  direction: RouteDirection | null
): RouteLine[] {
  if (!routeInfo) return [];

  const patternIds = direction ? new Set(direction.patternIds) : null;
  const selectedPatterns = routeInfo.patterns.filter(
    (pattern) => !patternIds || patternIds.has(pattern.id)
  );
  const lines = selectedPatterns
    .map(getPatternRouteLine)
    .filter((line) => line.length >= 2);

  if (!direction) return lines;

  const completions =
    ROUTE_GEOMETRY_COMPLETIONS[routeInfo.id]?.[direction.key] ?? [];

  for (const completion of completions) {
    const sourcePattern = routeInfo.patterns.find((pattern) =>
      matchesCompletion(pattern, completion)
    );
    if (
      !sourcePattern ||
      hasEquivalentCoverage(selectedPatterns, sourcePattern)
    ) {
      continue;
    }

    const sourceLine = getPatternRouteLine(sourcePattern);
    if (sourceLine.length < 2) continue;

    lines.push(completion.reverse ? [...sourceLine].reverse() : sourceLine);
  }

  return lines;
}
