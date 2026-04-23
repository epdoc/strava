import type { Seconds } from '@epdoc/duration';
import type * as Api from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';
import { BaseClass, type Ctx, type RegionCode } from '@epdoc/strava-core';
import type { Integer } from '@epdoc/type';
import { isPointInRegion, type Region } from './region.ts';

/**
 * Filter options for activities.
 */
export type ActivityFilterOpts = {
  /** Whether to include only commute activities. */
  commuteOnly?: boolean;
  /** Whether to include only non-commute activities. */
  nonCommuteOnly?: boolean;
  /** An array of activity types to include. If not specified, all types are included. */
  include?: Schema.Types.ActivityType[];
  /** An array of activity types to exclude. */
  exclude?: Schema.Types.ActivityType[];
  /** An array of region codes to filter by. If specified, only activities starting in these regions are included. */
  regions?: RegionCode[];
};

/**
 * Extended Activity class for the App package.
 *
 * This class wraps an Api.Activity with application-specific
 * functionality such as filtering and region detection.
 */
export class ActivityItem extends BaseClass {
  readonly apiActivity: Api.Activity;
  readonly data: Api.Activity['data'];

  constructor(ctx: Ctx.Context, apiActivity: Api.Activity) {
    super(ctx);
    this.apiActivity = apiActivity;
    this.data = apiActivity.data;
  }

  /**
   * Proxied property: The unique identifier of the activity.
   */
  get id(): Schema.Activity.Id {
    return this.apiActivity.id;
  }

  /**
   * Proxied property: The name of the activity.
   */
  get name(): string {
    return this.apiActivity.name;
  }

  /**
   * Proxied property: The type of the activity (e.g., 'Ride', 'Run').
   */
  get type(): string {
    return this.apiActivity.type;
  }

  /**
   * Proxied property: Indicates if the activity was marked as a commute.
   */
  get commute(): boolean {
    return this.apiActivity.commute;
  }

  /**
   * Proxied property: The geographical coordinates of the activity.
   */
  get coordinates(): Api.TrackPoint[] {
    return this.apiActivity.coordinates;
  }

  /**
   * Proxied property: The gear ID used for the activity.
   */
  get gearId(): string | null | undefined {
    return this.apiActivity.gearId;
  }

  /**
   * Proxied property: The moving time of the activity in seconds.
   */
  get movingTime(): Seconds {
    return this.apiActivity.movingTime;
  }

  /**
   * Proxied property: The elapsed time of the activity in seconds.
   */
  get elapsedTime(): Seconds {
    return this.apiActivity.elapsedTime;
  }

  /**
   * Proxied property: The total elevation gain of the activity in meters.
   */
  get totalElevationGain(): number {
    return this.apiActivity.totalElevationGain;
  }

  /**
   * Proxied method: Returns the distance in kilometers, rounded to 2 decimal places.
   */
  distanceRoundedKm(): number {
    return this.apiActivity.distanceRoundedKm();
  }

  /**
   * Proxied method: Checks if the activity is a ride or e-bike ride.
   */
  isRide(): boolean {
    return this.apiActivity.isRide();
  }

  /**
   * Proxied method: Creates a timezone-aware DateTime for a specific time during the activity.
   * @param delta Time offset in seconds from activity start.
   */
  startDateEx(delta?: Seconds): import('@epdoc/datetime').DateTime {
    return this.apiActivity.startDateEx(delta);
  }

  /**
   * Proxied property: The start date of the activity as a DateTime object with timezone set.
   */
  get startDateAsDateTime(): import('@epdoc/datetime').DateTime {
    return this.apiActivity.startDateAsDateTime;
  }

  /**
   * Proxied property: The start date in the local timezone in YYYY-MM-DD format.
   */
  get startDateLocal(): string {
    return this.apiActivity.startDateLocal;
  }

  /**
   * Proxied property: The start datetime of the activity in the local timezone, in ISO 8601 format.
   */
  get startDatetimeLocal(): string {
    return this.apiActivity.startDatetimeLocal;
  }

  /**
   * Proxied property: The segment efforts associated with the activity.
   */
  get segments(): Api.SegmentData[] {
    return this.apiActivity.segments;
  }

  /**
   * Proxied property: The distance of the activity in meters.
   */
  get distance(): number {
    return this.apiActivity.distance;
  }

  /**
   * Proxied method: Checks if the activity has track points.
   */
  hasTrackPoints(): boolean {
    return this.apiActivity.hasTrackPoints();
  }

  /**
   * Proxied method: Checks if the activity has way points.
   */
  hasWaypoints(): boolean {
    return this.apiActivity.hasWaypoints();
  }

  /**
   * Proxied method: Fetches detailed activity data from the Strava API.
   */
  async getDetailed(): Promise<void> {
    return this.apiActivity.getDetailed();
  }

  /**
   * Proxied method: Fetches track points (coordinates) for the activity.
   * @param streamTypes Array of stream types to fetch.
   */
  async getTrackPoints(streamTypes: Schema.Consts.StreamType[]): Promise<void> {
    return this.apiActivity.getTrackPoints(streamTypes);
  }

  /**
   * Proxied method: Filters track points to remove duplicates and blackout zones.
   * @param dedup Whether to remove duplicate points.
   * @param blackoutZones Optional array of blackout zone rectangles.
   */
  filterTrackPoints(dedup: boolean, blackoutZones?: Api.LatLngRect[]): void {
    return this.apiActivity.filterTrackPoints(dedup, blackoutZones);
  }

  /**
   * Proxied method: Attaches starred segment efforts to this activity.
   * @param starredSegments Map of segment IDs to segment names.
   * @returns Number of starred segment efforts found and attached.
   */
  attachStarredSegments(starredSegments: Api.StarredSegmentDict): Integer {
    return this.apiActivity.attachStarredSegments(starredSegments);
  }

  /**
   * Checks if the activity should be included based on the provided filter.
   *
   * This method evaluates the activity against various filter criteria:
   * - Commute status (commuteOnly, nonCommuteOnly)
   * - Activity type (include, exclude arrays)
   * - Geographic region (regions array)
   *
   * @param filter The filter options to apply.
   * @param regions Optional array of regions for geographic filtering.
   * @returns `true` if the activity should be included, `false` otherwise.
   */
  include(filter: ActivityFilterOpts, regions?: Region[]): boolean {
    // Check commute filter
    if (filter.commuteOnly && !this.commute) {
      return false;
    }
    if (filter.nonCommuteOnly && this.commute) {
      return false;
    }

    // Check exclude filter
    if (Array.isArray(filter.exclude)) {
      if (filter.exclude.includes(this.type as Schema.Types.ActivityType)) {
        return false;
      }
    }

    // Check include filter
    if (Array.isArray(filter.include)) {
      if (!filter.include.includes(this.type as Schema.Types.ActivityType)) {
        return false;
      }
    }

    // Check region filter
    if (Array.isArray(filter.regions) && filter.regions.length > 0 && regions && regions.length > 0) {
      const startLatLng = this.data.start_latlng;
      if (!startLatLng || startLatLng.length < 2) {
        // No location data, can't match region filter
        return false;
      }
      const [lat, lng] = startLatLng;

      // Find the region for this activity
      const matchingRegion = regions.find((region) =>
        filter.regions!.includes(region.id as RegionCode) &&
        isPointInRegion(lat, lng, region)
      );

      if (!matchingRegion) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a string representation of the activity.
   */
  override toString(): string {
    return this.apiActivity.toString();
  }
}
