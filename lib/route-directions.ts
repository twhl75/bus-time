import type { Bus, RouteInfo, RoutePattern, RoutePoint } from "@/lib/types";

export interface RouteDirection {
  key: string;
  destination: string;
  label: string;
  patternIds: string[];
  unavailable?: boolean;
}

export interface RouteTerminus {
  label: string;
  lat: number;
  lon: number;
  stopId: string;
}

export interface RouteTermini {
  origin: RouteTerminus;
  destination: RouteTerminus;
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

function getFirstStopPoint(pattern: RoutePattern) {
  return (
    pattern.points.find((point) => point.stop?.name.trim()) ?? null
  );
}

function getLastStopName(pattern: RoutePattern) {
  for (let index = pattern.points.length - 1; index >= 0; index -= 1) {
    const stopName = pattern.points[index].stop?.name.trim();
    if (stopName) return stopName;
  }

  return pattern.displayDirection.trim() || pattern.direction.trim();
}

function getLastStopPoint(pattern: RoutePattern) {
  for (let index = pattern.points.length - 1; index >= 0; index -= 1) {
    const point = pattern.points[index];
    if (point.stop?.name.trim()) return point;
  }

  return null;
}

function toTerminus(point: RoutePoint, label: string): RouteTerminus | null {
  if (!point.stop) return null;

  return {
    label: formatDirectionDestination(label),
    lat: point.lat,
    lon: point.lon,
    stopId: point.stop.id,
  };
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

function getDirectionOrigin(patterns: RoutePattern[]) {
  const destinationKeys = new Set(
    patterns.map((pattern) => getDestinationKey(getLastStopName(pattern)))
  );

  for (const pattern of patterns) {
    const origin = formatDirectionDestination(getFirstStopName(pattern));
    if (origin && !destinationKeys.has(getDestinationKey(origin))) {
      return origin;
    }
  }

  return formatDirectionDestination(getFirstStopName(patterns[0]));
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

  const directions: RouteDirection[] = Array.from(
    directionPatterns,
    ([key, patterns]) => {
      const destination =
        ROUTE_DIRECTION_DESTINATIONS[routeInfo.id]?.[key] ??
        getDirectionDestination(patterns);

      return {
        key,
        destination,
        label: `To ${destination}`,
        patternIds: patterns.map((pattern) => pattern.id),
      };
    }
  );

  if (directions.length !== 1) return directions;

  const currentDirection = directions[0];
  const patterns = directionPatterns.get(currentDirection.key) ?? [];
  const configuredOpposite = Object.entries(
    ROUTE_DIRECTION_DESTINATIONS[routeInfo.id] ?? {}
  ).find(([key]) => key !== currentDirection.key);
  const destination =
    configuredOpposite?.[1] ?? getDirectionOrigin(patterns);
  const destinationKey = getDestinationKey(destination);

  if (!destination || destinationKey === currentDirection.key) {
    return directions;
  }

  directions.push({
    key: configuredOpposite?.[0] ?? destinationKey,
    destination,
    label: `To ${destination}`,
    // Reuse the available shape and stops for the reverse view. Vehicle
    // filtering treats this as unavailable and therefore returns no buses.
    patternIds: currentDirection.patternIds,
    unavailable: true,
  });

  return directions;
}

export function getDirectionTermini(
  routeInfo: RouteInfo | null,
  direction: RouteDirection | null,
  directions: RouteDirection[]
): RouteTermini | null {
  if (!routeInfo || !direction) return null;

  const patternIds = new Set(direction.patternIds);
  const patterns = routeInfo.patterns.filter((pattern) =>
    patternIds.has(pattern.id)
  );
  if (patterns.length === 0) return null;

  const firstStops = patterns
    .map(getFirstStopPoint)
    .filter((point): point is RoutePoint => Boolean(point?.stop));
  const lastStops = patterns
    .map(getLastStopPoint)
    .filter((point): point is RoutePoint => Boolean(point?.stop));
  const firstStopKeys = new Set(
    firstStops.map((point) => getDestinationKey(point.stop?.name ?? ""))
  );
  const lastStopKeys = new Set(
    lastStops.map((point) => getDestinationKey(point.stop?.name ?? ""))
  );

  const originPoint =
    firstStops.find(
      (point) => !lastStopKeys.has(getDestinationKey(point.stop?.name ?? ""))
    ) ?? firstStops[0];
  const destinationPoint =
    lastStops.find(
      (point) => !firstStopKeys.has(getDestinationKey(point.stop?.name ?? ""))
    ) ?? lastStops.at(-1);

  if (!originPoint || !destinationPoint) return null;

  const oppositeDirection =
    directions.length === 2
      ? directions.find((item) => item.key !== direction.key)
      : null;
  const configuredOppositeDestination = Object.entries(
    ROUTE_DIRECTION_DESTINATIONS[routeInfo.id] ?? {}
  ).find(([key]) => key !== direction.key)?.[1];
  const originLabel =
    oppositeDirection?.destination ??
    configuredOppositeDestination ??
    originPoint.stop?.name ??
    "";
  const origin = toTerminus(
    direction.unavailable ? destinationPoint : originPoint,
    originLabel
  );
  const destination = toTerminus(
    direction.unavailable ? originPoint : destinationPoint,
    direction.destination
  );

  return origin && destination ? { origin, destination } : null;
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
  if (direction.unavailable) return [];

  const patternIds = new Set(direction.patternIds);
  const destinationKey = getDestinationKey(direction.destination);

  return buses.filter(
    (bus) =>
      patternIds.has(bus.patternId) ||
      getDestinationKey(bus.directionDisplay) === direction.key ||
      getDestinationKey(bus.destination) === destinationKey
  );
}
