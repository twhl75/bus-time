import { describe, expect, it } from "vitest";
import { getBusPositionLabel } from "./bus-position";
import type { Bus, RouteInfo } from "./types";

const bus: Bus = {
  id: "1702",
  lat: 43.45,
  lon: -79.7,
  direction: "East Bound",
  directionDisplay: "East",
  directionCode: "E",
  destination: "Oakville GO",
  routeId: "5",
  routeDisplay: "5",
  patternId: "east-pattern",
  run: "1",
};

const routeInfo: RouteInfo = {
  id: "5",
  shortName: "5",
  name: "Dundas",
  color: "#d6a619",
  patterns: [
    {
      id: "east-pattern",
      direction: "East",
      displayDirection: "East",
      points: [
        {
          lat: 43.4502,
          lon: -79.7001,
          stop: { id: "near", name: "Dundas St W at Neyagawa Blvd" },
        },
        {
          lat: 43.48,
          lon: -79.75,
          stop: { id: "far", name: "Dundas St W at Bronte Rd" },
        },
      ],
    },
  ],
};

describe("getBusPositionLabel", () => {
  it("uses the closest stop on the bus pattern", () => {
    expect(getBusPositionLabel(bus, routeInfo)).toBe(
      "Near Dundas St W at Neyagawa Blvd"
    );
  });

  it("returns a calm fallback when route geometry is unavailable", () => {
    expect(getBusPositionLabel(bus, null)).toBe("Position unavailable");
  });
});
