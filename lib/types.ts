export interface Bus {
  id: string;
  lat: number;
  lon: number;
  direction: string;
  directionDisplay: string;
  directionCode: string;
  destination: string;
  routeId: string;
  routeDisplay: string;
  patternId: string;
  run: string;
}

export interface BusStop {
  id: string;
  name: string;
}

export interface RoutePoint {
  lat: number;
  lon: number;
  stop?: BusStop;
}

export interface RoutePattern {
  id: string;
  direction: string;
  displayDirection: string;
  points: RoutePoint[];
}

export interface RouteInfo {
  id: string;
  shortName: string;
  name: string;
  color: string;
  patterns: RoutePattern[];
}

export interface StopPrediction {
  time: string;
  destination: string;
  vehicleId: string;
  scheduled: boolean;
  routeNumber: string;
}

export interface StopInfo {
  id: string;
  name: string;
  predictions: StopPrediction[];
}
