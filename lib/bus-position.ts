import type { Bus, RouteInfo, RoutePoint } from "./types";

function distanceSquared(bus: Bus, point: RoutePoint) {
  const latitudeScale = Math.cos((bus.lat * Math.PI) / 180);
  const latitudeDelta = point.lat - bus.lat;
  const longitudeDelta = (point.lon - bus.lon) * latitudeScale;

  return latitudeDelta * latitudeDelta + longitudeDelta * longitudeDelta;
}

export function getBusPositionLabel(bus: Bus, routeInfo?: RouteInfo | null) {
  if (!routeInfo) return "Position unavailable";

  const matchingPatterns = routeInfo.patterns.filter(
    (pattern) => pattern.id === bus.patternId
  );
  const patterns = matchingPatterns.length > 0 ? matchingPatterns : routeInfo.patterns;
  let closestPoint: RoutePoint | null = null;
  let closestDistance = Number.POSITIVE_INFINITY;

  for (const pattern of patterns) {
    for (const point of pattern.points) {
      if (!point.stop) continue;

      const distance = distanceSquared(bus, point);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    }
  }

  return closestPoint?.stop ? `Near ${closestPoint.stop.name}` : "Position unavailable";
}
