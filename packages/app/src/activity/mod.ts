/**
 * Activity management module for the Strava app.
 *
 * This module provides classes for managing Strava activities with
 * application-specific functionality like filtering and region detection.
 *
 * @example
 * ```ts
 * import * as Activity from './activity/mod.ts';
 *
 * // Create a collection of activities
 * const activities = new Activity.Collection(ctx, api, athlete);
 * await activities.getForDateRange(dateRanges);
 *
 * // Filter activities
 * activities.filter({ commuteOnly: true, regions: ['USA'] });
 *
 * // Access individual items
 * for (const item of activities.activities) {
 *   console.log(item.name, item.type);
 * }
 * ```
 */

// Item - A single activity wrapper (ActivityItem class)
export { ActivityItem as Item, type ActivityFilterOpts } from './item.ts';

// Collection - A collection/manager for multiple activities (ActivityCollection class)
export { ActivityCollection as Collection, type GetActivitiesOpts } from './collection.ts';

// Region types and functions for geographic filtering
export {
  getRegionForActivity,
  getRegionForLatLng,
  getRegionResultForLatLng,
  isPointInRect,
  isPointInRegion,
  loadRegions,
  WORLD_REGION,
  type Region,
  type RegionRect,
  type RegionResult,
  type RegionsFile,
} from './region.ts';
