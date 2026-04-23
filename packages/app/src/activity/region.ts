import type * as Schema from '@epdoc/strava-schema';
import config from '../consts.ts';

export type Code = string;

/**
 * A rectangular boundary defined by min/max lat/lng.
 */
export type Rect = {
  minLat: Schema.Types.Latitude;
  maxLat: Schema.Types.Latitude;
  minLng: Schema.Types.Longitude;
  maxLng: Schema.Types.Longitude;
};

/**
 * Result of region detection for an activity.
 */
export type Result = {
  id: string;
  name: string;
};

/**
 * A geographic region with one or more bounding rectangles.
 */
export type Def = {
  id: Code;
  name: string;
  skip: boolean;
  rectangles: Rect[];
};

/**
 * Structure of the user.regions.json configuration file.
 */
export type File = {
  description: string;
  lastModified: string;
  regions: Def[];
};

export class Region {
  #regions: Def[] = [];

  readonly WORLD: Result = {
    id: 'WORLD',
    name: 'World',
  };

  async regions(): Promise<Def[]> {
    if (!this.#regions) {
      await this.load();
    }
    return this.#regions;
  }

  /**
   * Loads regions from a RegionsFile, filtering out skipped regions.
   *
   * @param file - The regions file data
   * @returns Array of active (non-skipped) regions
   */
  async load(): Promise<void> {
    const contents = await config.paths.userRegions.readJson<File>();
    // const contents = await this.#file.readJson<File>();
    this.#regions = contents.regions;
  }

  async choices(): Promise<Code[]> {
    const regions = await this.regions();
    return regions.map((region) => {
      return region.id;
    });
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

  async findForLatLng(
    lat: Schema.Types.Latitude,
    lng: Schema.Types.Longitude,
  ): Promise<Def | undefined> {
    const regions = await this.regions();
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
  async findResultForLatLng(
    lat: Schema.Types.Latitude,
    lng: Schema.Types.Longitude,
  ): Promise<Result> {
    const region = await this.findForLatLng(lat, lng);
    if (region) {
      return { id: region.id, name: region.name };
    }
    return this.WORLD;
  }
}

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
  rect: Rect,
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
  region: Def,
): boolean {
  return region.rectangles.some((rect) => isPointInRect(lat, lng, rect));
}

export const db = new Region();
