import type { DateRanges } from '@epdoc/daterange';
import * as FS from '@epdoc/fs/fs';
import type * as Strava from '@epdoc/strava-api';
import * as App from '@epdoc/strava-app';
import type { Ctx } from '@epdoc/strava-core';

/**
 * Options for info queries
 */
export type InfoOptions = {
  /** Athlete ID (optional, defaults to authenticated user) */
  athleteId?: string;
  /** Date range for activities (required) */
  date: DateRanges;
  /** Use imperial units */
  imperial?: boolean;
  /** Output format */
  format?: 'json' | 'yaml' | 'text' | 'table';
};

/**
 * Region information extracted from activities
 */
export type RegionInfo = {
  /** Region code (e.g., 'CR', 'EU', 'ON') */
  code: string;
  /** Full region name (if available) */
  name?: string;
  /** Number of activities in this region */
  activityCount: number;
  /** Date range of activities in this region */
  dateRange: {
    start: string;
    end: string;
  };
  /** Total distance in this region (in km or miles depending on imperial setting) */
  totalDistance: number;
  /** Activity types found in this region */
  activityTypes: string[];
};

/**
 * Tool for querying Strava activity information.
 *
 * This tool provides information about:
 * - Regions where activities took place
 * - Activity statistics by region
 * - Date ranges for different regions
 *
 * @example
 * ```bash
 * # List all regions for activities in a date range
 * strava-info --date 20240101-20241231
 *
 * # List regions with imperial units
 * strava-info --date 20240101-20241231 --imperial
 * ```
 */
export class InfoTool extends App.BaseClass {
  private opts: InfoOptions;

  constructor(ctx: Ctx.Context, opts: InfoOptions) {
    super(ctx);
    this.opts = opts;
  }

  /**
   * Executes the info query.
   *
   * This method:
   * 1. Validates required options (date)
   * 2. Initializes the app with Strava API
   * 3. Fetches activities for the date range
   * 4. Extracts and displays region information
   */
  async run(): Promise<void> {
    try {
      // Validate required options
      if (!this.opts.date || !this.opts.date.hasRanges()) {
        throw new Error(
          '--date is required. Specify date range(s) (e.g., 20240101-20241231)',
        );
      }

      // Create and initialize the app
      const app = new App.Main(this.ctx);
      this.ctx.app = app;
      await app.init({ strava: true, userSettings: false });

      const activities: Strava.Activity[] = await app.getActivitiesForDateRange(this.opts.date, {
        detailed: true,
      });
      if (activities.length === 0) {
        return;
      }

      // Extract and display region information
      const regions = await this.#extractRegions(activities);
      this.#displayRegions(regions);

      if (this.ctx.format === 'json') {
        for (const activity of activities) {
          this.log.info.text(JSON.stringify(activity.data, null, 2)).emit();
        }
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.log.error.error(`Failed to query info: ${errorMsg}`).emit();
      throw err;
    }
  }

  /**
   * Extracts region information from activities.
   *
   * Groups activities by their geographic region based on start coordinates.
   * Activities that don't match any defined region are grouped under "WORLD".
   *
   * @param activities The activities to analyze
   * @returns Array of region information
   */
  async #extractRegions(activities: Strava.Activity[]): Promise<RegionInfo[]> {
    const regions = await this.#loadRegions();
    const regionMap = new Map<string, RegionInfo>();

    for (const activity of activities) {
      const regionCode = this.#detectRegion(activity, regions);

      if (!regionMap.has(regionCode)) {
        regionMap.set(regionCode, {
          code: regionCode,
          name: this.#getRegionName(regionCode, regions),
          activityCount: 0,
          dateRange: { start: activity.startDateLocal, end: activity.startDateLocal },
          totalDistance: 0,
          activityTypes: [],
        });
      }

      const region = regionMap.get(regionCode)!;
      region.activityCount++;
      region.totalDistance += activity.distance;

      // Update date range
      if (activity.startDateLocal < region.dateRange.start) {
        region.dateRange.start = activity.startDateLocal;
      }
      if (activity.startDateLocal > region.dateRange.end) {
        region.dateRange.end = activity.startDateLocal;
      }

      // Track activity types
      if (!region.activityTypes.includes(activity.type)) {
        region.activityTypes.push(activity.type);
      }
    }

    return Array.from(regionMap.values()).sort((a, b) => a.code.localeCompare(b.code));
  }

  /**
   * Loads regions from the user.regions.json configuration file.
   * Returns empty array if file doesn't exist or fails to load.
   *
   * @returns Array of active regions
   */
  async #loadRegions(): Promise<App.Region.Region[]> {
    const regionsFile = FS.File.config('epdoc', 'strava', 'user.regions.json');
    try {
      const isFile = await regionsFile.isFile();
      if (!isFile) {
        this.log.warn.text('Regions file not found:').fs(regionsFile).emit();
        return [];
      }
      const data = await regionsFile.readJson<App.Region.RegionsFile>();
      return App.Region.loadRegions(data);
    } catch (err) {
      this.log.warn.text('Failed to load regions file:').fs(regionsFile).emit();
      return [];
    }
  }

  /**
   * Detects the region for an activity based on its start coordinates.
   * Uses the user.regions.json configuration to determine region membership.
   * Falls back to "WORLD" if no matching region is found.
   *
   * @param activity The activity to analyze
   * @param regions Array of regions to check against
   * @returns Region code
   */
  #detectRegion(activity: Strava.Activity, regions: App.Region.Region[]): string {
    const regionResult = App.Region.getRegionForActivity(activity, regions);
    return regionResult.id;
  }

  /**
   * Gets a friendly name for a region code.
   * Looks up in loaded regions, falls back to WORLD default.
   *
   * @param code The region code
   * @param regions Array of loaded regions
   * @returns The region name
   */
  #getRegionName(code: string, regions: App.Region.Region[]): string {
    if (code === App.Region.WORLD_REGION.id) {
      return App.Region.WORLD_REGION.name;
    }
    const region = regions.find((r) => r.id === code);
    return region?.name || code;
  }

  /**
   * Displays region information in a formatted table.
   *
   * @param regions The regions to display
   */
  #displayRegions(regions: RegionInfo[]): void {
    this.log.info.h2('\nRegions found:').emit();
    this.log.indent();

    const unit = this.ctx.imperial ? 'mi' : 'km';
    const distanceMultiplier = this.ctx.imperial ? 1 / 1.609344 : 0.001;

    for (const region of regions) {
      const distance = (region.totalDistance * distanceMultiplier).toFixed(1);
      const types = region.activityTypes.join(', ');

      this.log.info
        .label('•')
        .value(region.code)
        .text('-')
        .text(region.name || 'Unknown')
        .emit();

      this.log.indent();
      this.log.info
        .text('  Activities:')
        .count(region.activityCount)
        .text('  Distance:')
        .value(`${distance} ${unit}`)
        .emit();
      this.log.info
        .text('  Date range:')
        .value(`${region.dateRange.start} to ${region.dateRange.end}`)
        .emit();
      this.log.info
        .text('  Types:')
        .value(types)
        .emit();
      this.log.outdent();
    }

    this.log.outdent();

    // Summary
    this.log.info.h2('\nSummary:').emit();
    this.log.indent();
    this.log.info.text('Total regions:').count(regions.length).emit();
    this.log.outdent();
  }
}
