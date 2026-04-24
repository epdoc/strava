import * as Api from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import * as Region from './region.ts';
import type * as Activity from './types.ts';

/**
 * Extended Activity class for the App package.
 *
 * This class wraps an Api.Activity with application-specific
 * functionality such as filtering and region detection.
 */
export class ActivityItem extends Api.Activity {
  #region?: Region.Result;
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
  async filter(filter: Activity.FilterOpts): Promise<boolean> {
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
    if (_.isNonEmptyArray(filter.regions)) {
      // Find the region for this activity
      const activityRegion = await this.getRegion();
      const matchingRegion = filter.regions.find((regionCode) =>
        activityRegion.id.toLowerCase() === regionCode.toLowerCase()
      );
      if (_.isNullOrUndefined(matchingRegion)) {
        // this.log.info.activity(this).text('is not in region').value(filter.regions).emit();
        return false;
      }
      // this.log.info.activity(this).text('is in region').value(filter.regions).emit();
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
  async getRegion(): Promise<Region.Result> {
    if (!this.#region) {
      const startLatLng = this.data.start_latlng;
      if (_.isNonEmptyArray(startLatLng) && startLatLng.length >= 2) {
        this.#region = await Region.db.findResultForLatLng(startLatLng[0], startLatLng[1]);
      } else {
        this.#region = Region.db.WORLD;
      }
    }
    return this.#region;
  }

  override toString(): string {
    const d = Math.round(this.data.distance / 100) / 10;
    if (this.#region) {
      return `${this.startDateLocal}, ${this.type} ${d} km, ${this.name} (${this.#region.name})`;
    }
    return `${this.startDateLocal}, ${this.type} ${d} km, ${this.name}`;
  }
}
