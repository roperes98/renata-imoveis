
interface Point {
  lat: number;
  lng: number;
}

/**
 * Checks if a point is inside a polygon using the Ray Casting algorithm.
 * @param point The point to check {lat, lng}
 * @param polygon Array of points defining the polygon [{lat, lng}, ...]
 * @returns boolean
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  if (!polygon || polygon.length < 3) return false;

  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat,
      yi = polygon[i].lng;
    const xj = polygon[j].lat,
      yj = polygon[j].lng;

    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculates the distance (in meters) between a point and a polygon's closest edge.
 * Returns 0 if the point is inside the polygon.
 */
export function getDistanceFromPolygon(point: Point, polygon: Point[]): number {
  if (isPointInPolygon(point, polygon)) return 0;

  let minDistance = Infinity;

  for (let i = 0; i < polygon.length; i++) {
    const p1 = polygon[i];
    const p2 = polygon[(i + 1) % polygon.length];
    const dist = getDistanceFromSegment(point, p1, p2);
    if (dist < minDistance) minDistance = dist;
  }

  return minDistance;
}

function getDistanceFromSegment(p: Point, v: Point, w: Point): number {
  const l2 = getDistanceSquared(v, w);
  if (l2 === 0) return getDistanceInMeters(p, v);

  let t = ((p.lat - v.lat) * (w.lat - v.lat) + (p.lng - v.lng) * (w.lng - v.lng)) / l2;
  t = Math.max(0, Math.min(1, t));

  const projection = {
    lat: v.lat + t * (w.lat - v.lat),
    lng: v.lng + t * (w.lng - v.lng),
  };

  return getDistanceInMeters(p, projection);
}

function getDistanceSquared(p1: Point, p2: Point): number {
  return Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2);
}

function getDistanceInMeters(p1: Point, p2: Point): number {
  const R = 6371e3; // metres
  const φ1 = (p1.lat * Math.PI) / 180;
  const φ2 = (p2.lat * Math.PI) / 180;
  const Δφ = ((p2.lat - p1.lat) * Math.PI) / 180;
  const Δλ = ((p2.lng - p1.lng) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}
