import * as Api from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import type * as Activity from './types.ts';

/**
 * Extended Activity class for the App package.
 *
 * This class wraps an Api.Activity with application-specific
 * functionality such as filtering and region detection.
 */
export class ActivityItem extends Api.Activity {
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
  filter(filter: Activity.FilterOpts): boolean {
    // Check commute filter
    if (filter.commuteOnly && !this.commute) {
      return false;
    }
    if (filter.nonCommuteOnly && this.commute) {
      return false;
    }

    // Check exclude filter
    if (_.isArray(filter.exclude)) {
      if (filter.exclude.includes(this.type as Schema.Types.ActivityType)) {
        return false;
      }
    }

    // Check include filter
    if (_.isArray(filter.include)) {
      if (!filter.include.includes(this.type as Schema.Types.ActivityType)) {
        return false;
      }
    }

    // Check region filter
    if (_.isNonEmptyArray(filter.regions) && _.isNonEmptyArray(filter.regions)) {
      const startLatLng = this.data.start_latlng;
      if (!startLatLng || startLatLng.length < 2) {
        // No location data, can't match region filter
        return false;
      }
      const [lat, lng] = startLatLng;

      // Find the region for this activity
      const matchingRegion = filter.regions.find((region) =>
        filter.regions!.includes(region.id as Activity.RegionCode) &&
        isPointInRegion(lat, lng, region)
      );

      if (!matchingRegion) {
        return false;
      }
    }

    return true;
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
  getRegion(): RegionResult {
    const startLatLng = this.data.start_latlng;
    if (!startLatLng || startLatLng.length < 2) {
      return WORLD_REGION;
    }

    const [lat, lng] = startLatLng;
    return getRegionResultForLatLng(lat, lng, regions);
  }

  /**
   * Returns a string representation of the activity.
   */
  override toString(): string {
    return this.toString();
  }
}
