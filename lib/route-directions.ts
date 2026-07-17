import type { Bus, RouteInfo, RoutePattern } from "@/lib/types";

export interface RouteDirection {
  key: string;
  destination: string;
  label: string;
  patternIds: string[];
}

const ROUTE_DIRECTION_DESTINATIONS: Record<string, Record<string, string>> = {
  "5": {
    east: "Laird & Winston Churchill",
    west: "Dundas/Highway 407 GO Carpool",
  },
};

function getFirstStopName(pattern: RoutePattern) {
  for (const point of pattern.points) {
    const stopName = point.stop?.name.trim();
    if (stopName) return stopName;
  }

  return "";
}

function getLastStopName(pattern: RoutePattern) {
  for (let index = pattern.points.length - 1; index >= 0; index -= 1) {
    const stopName = pattern.points[index].stop?.name.trim();
    if (stopName) return stopName;
  }

  return pattern.displayDirection.trim() || pattern.direction.trim();
}

function getDirectionKey(pattern: RoutePattern) {
  return getDestinationKey(
    pattern.displayDirection.trim() ||
      pattern.direction.trim() ||
      getLastStopName(pattern)
  );
}

function getDirectionDestination(patterns: RoutePattern[]) {
  const originKeys = new Set(
    patterns.map((pattern) => getDestinationKey(getFirstStopName(pattern)))
  );

  // Some feeds split one through-direction into consecutive patterns. An
  // endpoint that is also another pattern's origin is a transfer point, not a
  // separate direction (for example, Uptown Core on route 5).
  for (const pattern of patterns) {
    const destination = formatDirectionDestination(getLastStopName(pattern));
    if (destination && !originKeys.has(getDestinationKey(destination))) {
      return destination;
    }
  }

  return formatDirectionDestination(getLastStopName(patterns[0]));
}

export function formatDirectionDestination(value: string) {
  return value
    .trim()
    .replace(/\s+station$/i, "")
    .replace(/^to\s+/i, "");
}

export function getDestinationKey(value: string) {
  return formatDirectionDestination(value)
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, "");
}

export function getRouteDirections(routeInfo: RouteInfo | null) {
  if (!routeInfo) return [];

  const directionPatterns = new Map<string, RoutePattern[]>();

  for (const pattern of routeInfo.patterns) {
    const key = getDirectionKey(pattern);
    if (!key) continue;

    const patterns = directionPatterns.get(key) ?? [];
    patterns.push(pattern);
    directionPatterns.set(key, patterns);
  }

  return Array.from(directionPatterns, ([key, patterns]) => {
    const destination =
      ROUTE_DIRECTION_DESTINATIONS[routeInfo.id]?.[key] ??
      getDirectionDestination(patterns);

    return {
      key,
      destination,
      label: `To ${destination}`,
      patternIds: patterns.map((pattern) => pattern.id),
    };
  });
}

export function filterRouteInfoByDirection(
  routeInfo: RouteInfo | null,
  direction: RouteDirection | null
) {
  if (!routeInfo || !direction) return routeInfo;

  const patternIds = new Set(direction.patternIds);

  return {
    ...routeInfo,
    patterns: routeInfo.patterns.filter((pattern) =>
      patternIds.has(pattern.id)
    ),
  };
}

export function filterBusesByDirection(
  buses: Bus[],
  direction: RouteDirection | null
) {
  if (!direction) return buses;

  const patternIds = new Set(direction.patternIds);
  const destinationKey = getDestinationKey(direction.destination);

  return buses.filter(
    (bus) =>
      patternIds.has(bus.patternId) ||
      getDestinationKey(bus.directionDisplay) === direction.key ||
      getDestinationKey(bus.destination) === destinationKey
  );
}
