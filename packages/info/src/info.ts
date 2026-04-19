import type { DateRanges } from '@epdoc/daterange';
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

      // Fetch activities
      this.log.info.h2('Retrieving Data ...').dateRange(this.opts.date).emit();
      const activities = await app.getActivitiesForDateRange(this.opts.date, {});
      if (activities.length === 0) {
        return;
      }

      // Extract and display region information
      const regions = this.#extractRegions(activities);
      this.#displayRegions(regions);

      if (this.opts.format === 'json') {
        console.log(JSON.stringify(activities, null, 2));
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
   * This is a placeholder implementation that groups activities by
   * the country/region inferred from activity coordinates or names.
   *
   * @param activities The activities to analyze
   * @returns Array of region information
   */
  #extractRegions(activities: Strava.Activity[]): RegionInfo[] {
    // Group activities by location
    // For now, we'll use a simple placeholder that groups by activity name patterns
    // In the future, this could use reverse geocoding of coordinates

    const regionMap = new Map<string, RegionInfo>();

    for (const activity of activities) {
      // Try to extract region from activity name or location
      const regionCode = this.#detectRegion(activity);

      if (!regionMap.has(regionCode)) {
        regionMap.set(regionCode, {
          code: regionCode,
          name: this.#getRegionName(regionCode),
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
   * Attempts to detect the region for an activity.
   * This is a placeholder that uses simple heuristics.
   * Future implementation could use coordinate-based geocoding.
   *
   * @param activity The activity to analyze
   * @returns Region code
   */
  #detectRegion(activity: Strava.Activity): string {
    const name = activity.name.toLowerCase();

    // Simple heuristics based on common activity name patterns
    // These would be replaced with proper geocoding in a real implementation
    if (name.includes('costa rica') || name.includes('cr:') || name.includes('(cr)')) {
      return 'CR';
    }
    if (name.includes('europe') || name.includes('eu:') || name.includes('(eu)')) {
      return 'EU';
    }
    if (
      name.includes('ontario') || name.includes('on:') || name.includes('(on)') ||
      name.includes('toronto')
    ) {
      return 'ON';
    }
    if (
      name.includes('british columbia') || name.includes('bc:') || name.includes('(bc)') ||
      name.includes('vancouver')
    ) {
      return 'BC';
    }
    if (name.includes('california') || name.includes('ca:') || name.includes('(ca)')) {
      return 'CA';
    }
    if (name.includes('colorado') || name.includes('co:') || name.includes('(co)')) {
      return 'CO';
    }

    // Default: unknown region
    return 'UNKNOWN';
  }

  /**
   * Gets a friendly name for a region code.
   *
   * @param code The region code
   * @returns The region name
   */
  #getRegionName(code: string): string {
    const names: Record<string, string> = {
      'CR': 'Costa Rica',
      'EU': 'Europe',
      'ON': 'Ontario, Canada',
      'BC': 'British Columbia, Canada',
      'CA': 'California, USA',
      'CO': 'Colorado, USA',
      'UNKNOWN': 'Unknown Region',
    };
    return names[code] || code;
  }

  /**
   * Displays region information in a formatted table.
   *
   * @param regions The regions to display
   */
  #displayRegions(regions: RegionInfo[]): void {
    this.log.info.h2('\nRegions found:').emit();
    this.log.indent();

    const unit = this.opts.imperial ? 'mi' : 'km';
    const distanceMultiplier = this.opts.imperial ? 1 / 1.609344 : 0.001;

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
