import type { DateRanges } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import * as FS from '@epdoc/fs/fs';
import type { Ctx, RegionCode } from '@epdoc/strava-core';
import * as App from '@epdoc/strava-app';
import * as Strava from '@epdoc/strava-api';

/**
 * Options for GPX generation
 */
export type GpxOptions = {
  /** Athlete ID (optional, defaults to authenticated user) */
  athleteId?: string;
  /** Date range for activities (required) */
  date: DateRanges;
  /** Output filename (optional, defaults to date range in gpxFolder) */
  output?: string;
  /** Include lap waypoints */
  laps?: boolean;
  /** Suppress track output (only output waypoints) */
  noTracks?: boolean;
  /** Filter by commute: yes|no|all (default: all) */
  commute?: 'yes' | 'no' | 'all';
  /** Filter by activity types (empty array = all types) */
  type?: string[];
  /** Apply user's blackout zones */
  blackout?: boolean;
  /** Allow duplicate intermediate track points */
  allowDups?: boolean;
  /** Filter activities by region code */
  region?: RegionCode;
  /** Use imperial units */
  imperial?: boolean;
};

/**
 * Tool for generating GPX files from Strava activities.
 *
 * This tool creates GPX files with support for:
 * - Single file output with all activities (default behavior)
 * - Track points with lat/lon, elevation, and timezone-aware timestamps
 * - Lap waypoints showing where lap button was pressed (--laps flag)
 * - Waypoints-only mode with --laps --no-tracks
 * - Activity type filtering (--type)
 * - Commute filtering (--commute yes|no|all)
 * - Date range filtering (--date, required)
 * - Region filtering (--region)
 *
 * Output behavior:
 * - By default, all GPX data is written to a single file
 * - The default filename is based on the date range (YYYYMMDD-YYYYMMDD.gpx)
 * - Files are saved to the gpxFolder from user settings
 * - Use -o to specify a custom filename (relative to gpxFolder)
 *
 * @example
 * ```bash
 * # Generate GPX for all activities in date range (single file)
 * strava-gpx --date 20240101-20240131
 *
 * # Generate GPX with custom filename
 * strava-gpx --date 20240101-20240131 --output rides.gpx
 *
 * # Generate GPX for Costa Rica activities only
 * strava-gpx --date 20240101-20241231 --region CR
 *
 * # Generate GPX with lap markers for rides only
 * strava-gpx --date 20240101-20241231 --type Ride --laps
 * ```
 */
export class GpxTool extends App.BaseClass {
  private opts: GpxOptions;

  constructor(ctx: Ctx.Context, opts: GpxOptions) {
    super(ctx);
    this.opts = opts;
  }

  /**
   * Executes the GPX generation.
   *
   * This method:
   * 1. Validates required options (date)
   * 2. Initializes the app with Strava API and user settings
   * 3. Determines the output path (default or custom)
   * 4. Fetches activities and applies filters
   * 5. Generates the GPX file
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
      await app.init({ strava: true, userSettings: true });

      // Determine output path
      const outputPath = this.#resolveOutputPath();
      if (!outputPath) {
        throw new Error(
          'Output path could not be determined. Specify --output or set gpxFolder in user settings.',
        );
      }

      this.log.info.h2('Generating GPX file').fs(outputPath).emit();

      // Build track options
      const trackOpts: App.Track.Opts = {
        activities: true,
        date: this.opts.date,
        output: outputPath as FS.Path,
        laps: this.opts.laps,
        noTracks: this.opts.noTracks,
        commute: this.opts.commute ?? 'all',
        type: (this.opts.type ?? []) as Strava.Schema.ActivityType[],
        imperial: this.opts.imperial ?? false,
        blackout: this.opts.blackout ?? false,
        allowDups: this.opts.allowDups ?? false,
      };

      // Generate GPX
      await this.app.getTrack(trackOpts);

      this.log.info.h2('GPX file generated successfully').fs(outputPath).emit();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      this.log.error.error(`Failed to generate GPX: ${errorMsg}`).emit();
      throw err;
    }
  }

  /**
   * Resolves the output path for the GPX file.
   *
   * Rules:
   * - If --output is specified, use it relative to gpxFolder
   * - Otherwise, use date range as filename in gpxFolder
   * - If no gpxFolder in settings, return undefined
   *
   * @returns The resolved output path, or undefined if it cannot be determined
   */
  #resolveOutputPath(): string | undefined {
    const gpxFolder = this.app.userSettings?.gpxFolder;

    if (!gpxFolder) {
      // No gpxFolder in settings - must specify output
      if (this.opts.output) {
        return this.opts.output;
      }
      return undefined;
    }

    // Generate default filename from date range
    const defaultFilename = this.#generateFilenameFromDateRange();

    // Use specified output or default filename
    const filename = this.opts.output ?? defaultFilename;

    // Ensure filename has .gpx extension
    const filenameWithExt = filename.endsWith('.gpx') ? filename : `${filename}.gpx`;

    // Combine with gpxFolder
    const fsFile = new FS.File(gpxFolder, filenameWithExt);
    return fsFile.path;
  }

  /**
   * Generates a filename based on the date range.
   * Format: YYYYMMDD-YYYYMMDD.gpx (without time component)
   *
   * @returns The generated filename
   */
  #generateFilenameFromDateRange(): string {
    const ranges = this.opts.date.ranges;

    if (ranges.length === 0) {
      return 'activities.gpx';
    }

    // Get the overall date span across all ranges
    let minDate: DateTime | undefined;
    let maxDate: DateTime | undefined;

    for (const range of ranges) {
      if (!minDate || range.afterDateTime.epochMilliseconds < minDate.epochMilliseconds) {
        minDate = range.afterDateTime;
      }
      if (!maxDate || range.beforeDateTime.epochMilliseconds > maxDate.epochMilliseconds) {
        maxDate = range.beforeDateTime;
      }
    }

    // Format as YYYYMMDD
    const formatDate = (date: DateTime): string => {
      return date.format('yyyyMMdd');
    };

    const startStr = minDate ? formatDate(minDate) : '';
    const endStr = maxDate ? formatDate(maxDate) : '';

    if (startStr && endStr && startStr !== endStr) {
      return `${startStr}-${endStr}`;
    } else if (startStr) {
      return startStr;
    } else {
      return 'activities';
    }
  }

  /**
   * Filters activities by region if specified.
   * This is a placeholder for future region detection based on coordinates.
   *
   * @param activities The activities to filter
   * @returns Filtered activities
   */
  filterByRegion(activities: Strava.Activity[]): Strava.Activity[] {
    if (!this.opts.region) {
      return activities;
    }

    // TODO: Implement region detection based on activity coordinates
    // For now, this is a placeholder that returns all activities
    this.log.warn.warn(`Region filtering not yet implemented for region: ${this.opts.region}`)
      .emit();
    return activities;
  }
}
