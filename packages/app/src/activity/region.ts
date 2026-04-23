import type * as Schema from '@epdoc/strava-schema';
import type { Activity } from '@epdoc/strava-api';

/**
 * A rectangular boundary defined by min/max lat/lng.
 */
export type RegionRect = {
  minLat: Schema.Types.Latitude;
  maxLat: Schema.Types.Latitude;
  minLng: Schema.Types.Longitude;
  maxLng: Schema.Types.Longitude;
};

/**
 * A geographic region with one or more bounding rectangles.
 */
export type Region = {
  id: string;
  name: string;
  skip: boolean;
  rectangles: RegionRect[];
};

/**
 * Structure of the user.regions.json configuration file.
 */
export type RegionsFile = {
  description: string;
  lastModified: string;
  regions: Region[];
};

/**
 * Result of region detection for an activity.
 */
export type RegionResult = {
  id: string;
  name: string;
};

/** Default region when no matching region is found. */
export const WORLD_REGION: RegionResult = {
  id: 'WORLD',
  name: 'World',
};

/**
 * Checks if a lat/lng point falls within a rectangle.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param rect - Rectangle bounds
 * @returns `true` if the point is inside the rectangle
 */
export function isPointInRect(
  lat: Schema.Types.Latitude,
  lng: Schema.Types.Longitude,
  rect: RegionRect,
): boolean {
  return lat >= rect.minLat &&
    lat <= rect.maxLat &&
    lng >= rect.minLng &&
    lng <= rect.maxLng;
}

/**
 * Checks if a lat/lng point falls within any rectangle of a region.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param region - Region to check against
 * @returns `true` if the point is inside any of the region's rectangles
 */
export function isPointInRegion(
  lat: Schema.Types.Latitude,
  lng: Schema.Types.Longitude,
  region: Region,
): boolean {
  return region.rectangles.some((rect) => isPointInRect(lat, lng, rect));
}

/**
 * Gets the first matching region for a lat/lng point.
 * Skips regions with `skip: true`.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param regions - Array of regions to check
 * @returns The matching region or `undefined` if no match
 */
export function getRegionForLatLng(
  lat: Schema.Types.Latitude,
  lng: Schema.Types.Longitude,
  regions: Region[],
): Region | undefined {
  for (const region of regions) {
    if (!region.skip && isPointInRegion(lat, lng, region)) {
      return region;
    }
  }
  return undefined;
}

/**
 * Gets the region result for a lat/lng point.
 * Returns WORLD_REGION if no matching region is found.
 *
 * @param lat - Latitude of the point
 * @param lng - Longitude of the point
 * @param regions - Array of regions to check
 * @returns RegionResult with id and name
 */
export function getRegionResultForLatLng(
  lat: Schema.Types.Latitude,
  lng: Schema.Types.Longitude,
  regions: Region[],
): RegionResult {
  const region = getRegionForLatLng(lat, lng, regions);
  if (region) {
    return { id: region.id, name: region.name };
  }
  return WORLD_REGION;
}

/**
 * Gets the region for an activity based on its start location.
 * Returns WORLD_REGION if:
 * - Activity has no start_latlng
 * - No matching region is found
 *
 * @param activity - The activity to get region for
 * @param regions - Array of regions to check
 * @returns RegionResult with id and name
 */
export function getRegionForActivity(
  activity: Activity,
  regions: Region[],
): RegionResult {
  const startLatLng = activity.data.start_latlng;
  if (!startLatLng || startLatLng.length < 2) {
    return WORLD_REGION;
  }

  const [lat, lng] = startLatLng;
  return getRegionResultForLatLng(lat, lng, regions);
}

/**
 * Loads regions from a RegionsFile, filtering out skipped regions.
 *
 * @param file - The regions file data
 * @returns Array of active (non-skipped) regions
 */
export function loadRegions(file: RegionsFile): Region[] {
  return file.regions.filter((region) => !region.skip);
}
