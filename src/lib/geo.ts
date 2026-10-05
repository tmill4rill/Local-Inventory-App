export type Coord = { lat: number; lng: number };
export type DistanceUnit = 'mi' | 'km';

const EARTH_RADIUS_MI = 3958.8;
const KM_PER_MI = 1.609344;

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** Great-circle distance in miles (haversine). */
export function distanceMiles(a: Coord, b: Coord): number {
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.min(1, Math.sqrt(h)));
}

export const milesToKm = (mi: number) => mi * KM_PER_MI;

/** Format a distance given in miles for the user's preferred unit. */
export function formatDistance(mi: number, unit: DistanceUnit): string {
  const value = unit === 'km' ? milesToKm(mi) : mi;
  const rounded = value < 10 ? Math.round(value * 10) / 10 : Math.round(value);
  return `${rounded} ${unit}`;
}

export const directionsUrl = (c: Coord) => `https://www.google.com/maps/dir/?api=1&destination=${c.lat},${c.lng}`;
