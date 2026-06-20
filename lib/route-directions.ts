import type { Bus, RouteInfo, RoutePattern } from "@/lib/types";

export interface RouteDirection {
  key: string;
  destination: string;
  label: string;
  patternIds: string[];
}

function getLastStopName(pattern: RoutePattern) {
  for (let index = pattern.points.length - 1; index >= 0; index -= 1) {
    const stopName = pattern.points[index].stop?.name.trim();
    if (stopName) return stopName;
  }

  return pattern.displayDirection.trim() || pattern.direction.trim();
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

  const directions = new Map<string, RouteDirection>();

  for (const pattern of routeInfo.patterns) {
    const destination = formatDirectionDestination(getLastStopName(pattern));
    const key = getDestinationKey(destination);
    if (!key) continue;

    const existingDirection = directions.get(key);
    if (existingDirection) {
      existingDirection.patternIds.push(pattern.id);
      continue;
    }

    directions.set(key, {
      key,
      destination,
      label: `To ${destination}`,
      patternIds: [pattern.id],
    });
  }

  return Array.from(directions.values());
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

  return buses.filter(
    (bus) =>
      patternIds.has(bus.patternId) ||
      getDestinationKey(bus.destination) === direction.key
  );
}
