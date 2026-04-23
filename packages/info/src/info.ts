import type { DateRanges } from '@epdoc/daterange';
import type { DateTime } from '@epdoc/datetime';
import * as App from '@epdoc/strava-app';
import type { Ctx } from '@epdoc/strava-core';
import * as Table from '@epdoc/table';
import { bold, rgb24 } from '@std/fmt/colors';

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
  region?: boolean;
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

      if (this.opts.region) {
        this.log.debug.text('Listing regions').emit();
        await this.#outputRegions();
        return;
      }

      const activities = new App.Activity.Collection(this.ctx);
      await activities.getForDateRange(this.opts.date);

      if (activities.activities.length === 0) {
        this.log.info.text('No activities found for the specified date range.').emit();
        return;
      }

      // Extract and display region information
      activities.getRegions();
      await this.#displayRegions(activities);

      if (this.ctx.format === 'json') {
        for (const activity of activities.activities) {
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
   * Displays region information from activities in a formatted table.
   *
   * @param activities The activities collection to extract region info from
   */
  async #displayRegions(activities: App.Activity.Collection): Promise<void> {
    if (activities.length === 0) {
      this.log.info.text('No activities found.').emit();
      return;
    }

    const unit = this.ctx.imperial ? 'mi' : 'km';
    const distanceMultiplier = this.ctx.imperial ? 1 / 1.609344 : 0.001;

    type RegionStats = {
      code: string;
      name: string;
      activityCount: number;
      totalDistance: number;
      minDate: DateTime;
      maxDate: DateTime;
      activityTypes: Set<string>;
    };

    // Aggregate statistics per region
    const regionStatsMap: Map<string, RegionStats> = new Map();

    for (const activity of activities.activities) {
      const region = await activity.getRegion();
      const regionCode = region.id;
      const regionName = region.name;

      const existingStats = regionStatsMap.get(regionCode);
      const activityDate = activity.startDateAsDateTime;
      const activityDistance = activity.distance;
      const activityType = activity.type;

      if (existingStats) {
        // Update existing stats
        existingStats.activityCount++;
        existingStats.totalDistance += activityDistance;
        if (activityDate.epochMilliseconds < existingStats.minDate.epochMilliseconds) {
          existingStats.minDate = activityDate;
        }
        if (activityDate.epochMilliseconds > existingStats.maxDate.epochMilliseconds) {
          existingStats.maxDate = activityDate;
        }
        existingStats.activityTypes.add(activityType);
      } else {
        // Create new stats entry
        regionStatsMap.set(regionCode, {
          code: regionCode,
          name: regionName,
          activityCount: 1,
          totalDistance: activityDistance,
          minDate: activityDate,
          maxDate: activityDate,
          activityTypes: new Set([activityType]),
        });
      }
    }

    type RegionStatsRow = {
      code: string;
      name: string;
      activities: number;
      distance: string;
      dateRange: string;
      types: string;
    };

    // Build rows from aggregated stats
    const rows: RegionStatsRow[] = Array.from(regionStatsMap.values()).map((stats) => ({
      code: stats.code,
      name: stats.name || 'Unknown',
      activities: stats.activityCount,
      distance: `${(stats.totalDistance * distanceMultiplier).toFixed(1)} ${unit}`,
      dateRange: stats.minDate.toISOString() === stats.maxDate.toISOString()
        ? stats.minDate.toISOString()
        : `${stats.minDate.toISOString()} to ${stats.maxDate.toISOString()}`,
      types: Array.from(stats.activityTypes).join(', '),
    }));

    const columns: Table.ColumnRegistry<RegionStatsRow> = {
      code: { header: 'Code', align: 'left' },
      name: { header: 'Name', align: 'left', maxWidth: 25 },
      activities: { header: 'Activities', align: 'right' },
      distance: { header: 'Distance', align: 'right' },
      dateRange: { header: 'Date Range', align: 'left', maxWidth: 28 },
      types: { header: 'Types', align: 'left', maxWidth: 30 },
    };

    const table = new Table.Renderer({
      columns: Table.buildColumns(
        ['code', 'name', 'activities', 'distance', 'dateRange', 'types'],
        columns,
      ),
      data: rows,
      padding: 2,
      headerStyle: (s) => bold(rgb24(s, 0x58d1eb)),
      rowStyles: [(s) => rgb24(s, 0xcccccc), null],
      borders: {
        enabled: true,
        style: 'light',
        color: 0x666666,
      },
    });

    this.log.info.emit();
    this.log.info.h2('Activity Regions:').emit();
    table.print();
    this.log.info.emit();
  }

  /**
   * Outputs configured regions in a formatted table.
   *
   * @param regions The regions to display
   */
  async #outputRegions(): Promise<void> {
    const regions = await App.Activity.Region.db.regions();
    if (regions.length === 0) {
      this.log.info.text('No regions configured.').emit();
      return;
    }

    // Flatten regions with multiple rectangles into rows
    type RegionRow = {
      id: string;
      name: string;
      minLat: number;
      maxLat: number;
      minLng: number;
      maxLng: number;
    };

    const rows: RegionRow[] = [];
    for (const region of regions) {
      for (const rect of region.rectangles) {
        rows.push({
          id: region.id,
          name: region.name,
          minLat: rect.minLat,
          maxLat: rect.maxLat,
          minLng: rect.minLng,
          maxLng: rect.maxLng,
        });
      }
    }

    const columns: Table.ColumnRegistry<RegionRow> = {
      id: { header: 'ID', align: 'left' },
      name: { header: 'Name', align: 'left', maxWidth: 30 },
      minLat: { header: 'Min Lat', align: 'right', formatter: (v) => (v as number).toFixed(2) },
      maxLat: { header: 'Max Lat', align: 'right', formatter: (v) => (v as number).toFixed(2) },
      minLng: { header: 'Min Lng', align: 'right', formatter: (v) => (v as number).toFixed(2) },
      maxLng: { header: 'Max Lng', align: 'right', formatter: (v) => (v as number).toFixed(2) },
    };

    const table = new Table.Renderer({
      columns: Table.buildColumns(['id', 'name', 'minLat', 'maxLat', 'minLng', 'maxLng'], columns),
      data: rows,
      padding: 2,
      headerStyle: (s) => bold(rgb24(s, 0x58d1eb)),
      rowStyles: [(s) => rgb24(s, 0xcccccc), null],
      borders: {
        enabled: true,
        style: 'light',
        color: 0x666666,
      },
    });

    this.log.info.emit();
    this.log.info.h2('Configured Regions:').emit();
    table.print();
    this.log.info.emit();
    this.log.info.text('Total:').count(regions.length).text('region').text('with')
      .count(rows.length).text('rectangle').emit();
    this.log.info.emit();
  }
}
