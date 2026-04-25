import { DateRange, type DateRanges } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import * as FS from '@epdoc/fs/fs';
import type { Api } from '@epdoc/strava-api';
import * as Strava from '@epdoc/strava-api';
import { BaseClass, type Ctx } from '@epdoc/strava-core';
import type * as Schema from '@epdoc/strava-schema';
import { _, type Integer } from '@epdoc/type';
import { assert } from '@std/assert/assert';
import type { Main as App } from '../app.ts';
import { ActivityItem } from './item.ts';
import type { FilterOpts, ResolveFileOpts } from './types.ts';

const REG = {
  validExt: new RegExp(/([^\/.]+)\.(gpx|kml|xml)$/i),
};

export type GetActivitiesOpts = {
  detailed?: boolean;
  streams?: Schema.Stream.StreamKey[];
  coordinates?: boolean;
  starredSegments?: boolean;
  dedup?: boolean;
  blackoutZones?: Strava.LatLngRect[];
};

export class ActivityCollection extends BaseClass {
  private _activities: ActivityItem[] = [];
  private _suggestedFilename?: string;
  private _lastFilterOpts?: FilterOpts;

  constructor(ctx: Ctx.Context) {
    super(ctx);
  }

  get app(): App {
    assert(this.ctx.app);
    return this.ctx.app as App;
  }

  get api(): Api {
    return this.app.api;
  }

  get athlete(): Schema.Athlete.Detailed | undefined {
    return this.app.athlete;
    // return this.#athlete;
  }

  get length(): Integer {
    return this._activities.length;
  }

  get activities(): ActivityItem[] {
    return this._activities;
  }

  /**
   * Gets the suggested filename for the collection.
   * This is auto-generated from the date range of activities and filter options.
   * @returns The suggested filename base (without extension), or undefined if no activities.
   */
  getSuggestedFilename(): string | undefined {
    assert(this._suggestedFilename, 'Suggested filename has not been generated yet');
    return this._suggestedFilename;
  }

  /**
   * Fetches activities for a given set of date ranges.
   *
   * This method retrieves activities from the Strava API within one or more
   * specified date ranges. It can optionally fetch detailed information,
   * track points, and attach starred segment data to the activities.
   *
   * @param ctx - The application context for logging.
   * @param date - The date ranges to fetch activities for.
   * @param [opts={}] - Options for fetching activities.
   * @param [opts.detailed=false] - Whether to fetch detailed information for each activity.
   * @param [opts.coordinates=false] - Whether to fetch track points for each activity.
   * @param [opts.starredSegments=false] - Whether to attach starred segment information to each activity.
   * @param [opts.filter] - A filter to apply to the activities.
   * @returns A promise that resolves to an array of activities.
   */
  async getForDateRange(date: DateRanges): Promise<void> {
    this._activities = [];
    this._suggestedFilename = undefined;

    // await this.api.refreshToken();

    this.log.info.text('Retrieving activities ...').dateRange(date).start();

    const athleteId: Schema.Athlete.Id = (this.athlete && Strava.isStravaId(this.athlete.id))
      ? this.athlete.id
      : 0;

    // Get activities for each date range
    for (const dateRange of date.ranges) {
      const apiOpts: Strava.ActivityOpts = {
        athleteId,
        query: {
          per_page: 200,
          after: Math.floor(
            (dateRange.after
              ? dateRange.after.epochMilliseconds
              : new DateTime(0).epochMilliseconds) /
              1000,
          ),
          before: Math.floor(
            ((dateRange.before && !dateRange.before.isNearMax())
              ? dateRange.before.epochMilliseconds
              : DateTime.now().add({ days: 7 }).epochMilliseconds) / 1000,
          ),
        },
      };

      const apiActivities = await this.api.getActivities(apiOpts, ActivityItem);
      for (const activity of apiActivities) {
        this._activities.push(activity);
      }
    }
    this.sort();
    this._generateSuggestedFilename();

    this.log.info.icheck().text('Retrieved a list of').count(this.length)
      .text('Strava activity', 'Strava activities').dateRange(date).stop();
  }

  /**
   * Sorts activities by start date.
   * @param ascending - If true (default), sorts oldest first. If false, sorts newest first.
   */
  sort(ascending: boolean = true): void {
    this._activities.sort((a, b) => {
      const comparison = a.startDateAsDateTime < b.startDateAsDateTime
        ? -1
        : a.startDateAsDateTime > b.startDateAsDateTime
        ? 1
        : 0;
      return ascending ? comparison : -comparison;
    });
  }

  /**
   * Returns a DateRange covering the start dates of all activities.
   * Assumes activities have been sorted (e.g., after calling getForDateRange).
   * @returns DateRange from first to last activity, or undefined if no activities.
   */
  getDateRange(): DateRange | undefined {
    if (this._activities.length === 0) {
      return undefined;
    }
    const first = this._activities[0].startDateAsDateTime;
    const last = this._activities[this._activities.length - 1].startDateAsDateTime;
    return new DateRange(first, last);
  }

  /**
   * Filters the activity collection based on specified criteria.
   *
   * Applies filters to exclude activities that don't match the criteria:
   * - **Commute status**: Include only commutes, only non-commutes, or both
   * - **Activity type**: Include only specific activity types (Ride, Run, etc.)
   * - **Geographic region**: Include only activities starting within specified regions
   *
   * This method modifies the collection in-place. After filtering, the suggested
   * filename is regenerated to reflect the new activity set.
   *
   * @param filter - Filter criteria to apply
   * @param filter.commuteOnly - If true, include only commute activities
   * @param filter.nonCommuteOnly - If true, include only non-commute activities
   * @param filter.include - Array of activity types to include (e.g., ['Ride', 'Run'])
   * @param filter.exclude - Array of activity types to exclude
   * @param filter.regions - Array of region codes to filter by (e.g., ['CR', 'BC'])
   *
   * @example
   * ```ts
   * // Filter to only non-commute rides in Costa Rica
   * activities.filter({
   *   commuteOnly: false,
   *   nonCommuteOnly: true,
   *   include: ['Ride'],
   *   regions: ['CR']
   * });
   * ```
   */
  async filter(filter: FilterOpts = {}): Promise<void> {
    const results = await Promise.all(this._activities.map((a) => a.filter(filter)));
    this._activities = this._activities.filter((_, i) => results[i]);
    this._lastFilterOpts = filter;
    this._generateSuggestedFilename();
  }

  /**
   * Fetches detailed activity data from the Strava API for all activities in the collection.
   *
   * Detailed data includes additional fields not present in summary activities:
   * - **Laps**: Information about when the athlete pressed the lap button
   * - **Segment efforts**: The athlete's performance on Strava segments during this activity
   * - **Description and private notes**: Full activity descriptions
   *
   * This data is required for:
   * - Generating lap waypoints in GPX/KML output (when `--laps` flag is used)
   * - PDF/XML generation with activity descriptions
   * - Segment effort analysis
   *
   * **Note**: This makes an API call for each activity in the collection. For large
   * date ranges, this can be time-consuming and subject to Strava API rate limits.
   *
   * @param opts - Options for fetching detailed data
   * @param opts.detailed - If true, fetches detailed activity data (laps, description, etc.)
   * @param opts.starredSegments - If true, attaches starred segment efforts to activities
   *
   * @example
   * ```ts
   * // Fetch detailed data needed for lap waypoints
   * await activities.getDetailsAndSegments({ detailed: true });
   *
   * // Now activities have lap data for waypoint generation
   * for (const activity of activities.activities) {
   *   if ('laps' in activity.data) {
   *     console.log(`Activity has ${activity.data.laps.length} laps`);
   *   }
   * }
   * ```
   */
  async getDetailsAndSegments(
    opts: GetActivitiesOpts = {},
  ): Promise<void> {
    if (this.length && (opts.detailed || opts.starredSegments)) {
      this.log.info.h2('Retrieving activity details from Strava:').emit();
      this.log.indent();
      const jobs: Promise<void>[] = [];
      this._activities.forEach((activity) => {
        jobs.push(activity.getDetailed());
      });
      await Promise.all(jobs);
      this.log.outdent();
    }
  }

  /**
   * Fetches GPS **track points** for all activities in the collection from the Strava API.
   *
   * **What are track points?**
   * Track points are the individual GPS coordinates that make up an activity's route -
   * the actual path the athlete traveled. Each track point contains:
   * - **Latitude and longitude**: Position on Earth
   * - **Elevation**: Altitude above sea level (when requested)
   * - **Timestamp**: Seconds since activity start (when requested)
   *
   * **Track points vs Segments:**
   * - **Track points**: The raw GPS path of *this specific activity* (where the athlete went)
   * - **Segments**: Pre-defined favorite sections of road/trail that athletes time themselves on
   *   (independent of any single activity)
   *
   * The track points are fetched from Strava's **streams API**, which provides the underlying
   * data recorded by the athlete's GPS device.
   *
   * **Post-processing options:**
   * - **Deduplication** (`dedup: true`): Removes intermediate points where consecutive
   *   coordinates have identical lat/lng (reduces file size without affecting route shape)
   * - **Blackout zones** (`blackoutZones`): Removes coordinates within specified rectangular
   *   regions (e.g., home location for privacy)
   *
   * @param opts - Options for fetching track points
   * @param opts.streams - Array of stream types to fetch from Strava. Use the
   *   `Schema.Consts.StreamKeys` constants:
   *   - `LatLng`: Required for all output formats (latitude/longitude coordinates)
   *   - `Altitude`: Required for GPX output (elevation data)
   *   - `Time`: Required for GPX output (timestamps)
   * @param opts.dedup - If true, removes duplicate intermediate track points
   * @param opts.blackoutZones - Array of rectangular regions to exclude from output
   *
   * @example
   * ```ts
   * // Fetch coordinates for KML output (lat/lng only)
   * await activities.getTrackPoints({
   *   streams: [Schema.Consts.StreamKeys.LatLng]
   * });
   *
   * // Fetch coordinates for GPX output (lat/lng + altitude + time)
   * await activities.getTrackPoints({
   *   streams: [
   *     Schema.Consts.StreamKeys.LatLng,
   *     Schema.Consts.StreamKeys.Altitude,
   *     Schema.Consts.StreamKeys.Time
   *   ],
   *   dedup: true,
   *   blackoutZones: [[[9.10, -83.65], [9.11, -83.64]]] // Home area
   * });
   * ```
   */
  async getTrackPoints(
    opts: GetActivitiesOpts = {},
  ): Promise<void> {
    if (this.length) {
      if (_.isNonEmptyArray(opts.streams)) {
        this.log.info.h2('Retrieving track points from Strava:').emit();
        const jobs: Promise<void>[] = [];
        const streams = opts.streams; // Extract to non-null variable
        this.log.indent();
        this._activities.forEach((activity) => {
          jobs.push(activity.getTrackPoints(streams));
        });
        await Promise.all(jobs);
        this.log.outdent();
        const verbs: string[] = opts.dedup ? ['Redundant'] : [];
        if (_.isNonEmptyArray(opts.blackoutZones)) verbs.push('Blacked-out');
        if (verbs.length) {
          this.log.info.h2('Filtering').h2(verbs.join('and')).h2('track points:').emit();
          this.log.indent();
          this._activities.forEach((activity) => {
            activity.filterTrackPoints(opts.dedup === true, opts.blackoutZones);
          });
          this.log.outdent();
        }
        // this.log.info.text('Retrieved track points for').count(activities.length)
        //   .text('activity', 'activities').emit();
      }
    }
  }

  /**
   * Attaches starred segment efforts to activities.
   * @param starredSegmentDict Dictionary of starred segment IDs to names.
   */
  attachStarredSegments(starredSegmentDict: Strava.StarredSegmentDict): void {
    if (Object.keys(starredSegmentDict).length === 0) {
      return;
    }
    this.log.info.text('Processing segment efforts for').count(this.length)
      .text('activity:', 'activities:').emit();
    this.log.indent();
    this._activities.forEach((activity) => {
      const count = activity.attachStarredSegments(starredSegmentDict);
      if (count > 0) {
        this.log.info.text('Found').count(count)
          .text('starred segment effort').text('for').activity(activity).emit();
      }
    });
    this.log.outdent();
  }

  /**
   * Generates a suggested filename based on the activities' date range and filter options.
   * Format: YYYYMMDD-YYYYMMDD[_regions][_{type}][_commute|_noncommute]
   *
   * Examples:
   * - 20240101-20240131
   * - 20240101-20240131_CR
   * - 20240101-20240131_CR_Ride_commute
   *
   * Note: Assumes activities are sorted by start date (oldest first).
   */
  private _generateSuggestedFilename(): void {
    if (this._activities.length === 0) {
      this._suggestedFilename = undefined;
      return;
    }

    // Activities are sorted by start date, so first is oldest and last is newest
    const minDate = this._activities[0].startDateAsDateTime;
    const maxDate = this._activities[this._activities.length - 1].startDateAsDateTime;

    // Format as YYYYMMDD
    const formatDate = (date: DateTime): string => {
      return date.format('yyyyMMdd');
    };

    const startStr = minDate ? formatDate(minDate) : '';
    const endStr = maxDate ? formatDate(maxDate) : '';

    const parts: string[] = [];
    if (startStr && endStr && startStr !== endStr) {
      parts.push(`${startStr}-${endStr}`);
    } else if (startStr) {
      parts.push(startStr);
    } else {
      parts.push('activities');
    }

    // Add filter suffixes
    const filter = this._lastFilterOpts;
    if (filter) {
      // Add region codes
      if (_.isNonEmptyArray(filter.regions)) {
        parts.push(filter.regions.join('+'));
      }

      // Add activity type
      if (_.isNonEmptyArray(filter.include)) {
        parts.push(filter.include.join('+'));
      }

      // Add commute suffix
      if (filter.commuteOnly) {
        parts.push('commute');
      } else if (filter.nonCommuteOnly) {
        parts.push('noncommute');
      }
    }

    this._suggestedFilename = parts.join('_');
  }

  /**
   * Calculates the region for all activities in the collection.
   */
  async getRegions(): Promise<void> {
    for (const activity of this._activities) {
      await activity.getRegion();
    }
  }

  /**
   * Resolves the output file path based on user input and defaults.
   *
   * Rules:
   * - If output is specified and it is just a filename (no path) and it ends with the extension, use it as
   *   filename in defaultFolder
   * - If output is specified and it is a path (contains directories) and it ends with the extension, use it
   *   by creating a new FS.File(output)
   * - If output is specified and it does not end with an extension, treat it as a path, generate
   *   a new filename for a file to put in that folder. Test that the path is a folder that exists.
   *   If it does not then throw an error that the folder does not exist.
   * - Otherwise, use suggestedFilename in defaultFolder
   * - If no defaultFolder in settings, return undefined
   *
   * @param opts - Options for resolving the output file
   * @param opts.output - User-specified output path or filename (optional)
   * @param opts.outputType - Type of output ('kml', 'gpx', or 'pdf') to determine extension and default folder
   * @param opts.defaultFolder - Default folder path for output (optional, will be derived from outputType if not provided)
   * @returns The resolved FS.File, or undefined if it cannot be determined
   */
  resolveOutputFile(opts: ResolveFileOpts): FS.File | undefined {
    const output = opts.output;
    const outputType = opts.type; // 'kml', 'gpx', or 'acroforms'
    let defaultFolder = opts.defaultFolder ? new FS.Folder(opts.defaultFolder) : undefined;

    const fileSettings = this.app.getFileSettings(outputType);

    // Determine extension from outputType
    const extWithDot = `.${fileSettings.ext || 'xml'}`;

    // Determine defaultFolder from outputType if not provided
    if (!defaultFolder && FS.isFolderPath(fileSettings.folder)) {
      defaultFolder = new FS.Folder(fileSettings.folder);
    }
    if (!defaultFolder && FS.isFilePath(fileSettings.file)) {
      defaultFolder = new FS.File(fileSettings.file).parentFolder();
    }
    if (!defaultFolder) {
      defaultFolder = FS.Folder.cwd(); // Fallback to current working directory if no folder specified
    }

    // The suggested filename (generated from activities' date range and filters)
    const suggestedFilename = this._suggestedFilename;

    if (output) {
      // Check if output matches the pattern: optional path + filename + .gpx/.kml
      const match = output.match(REG.validExt);
      if (match) {
        // Output has the correct extension (.gpx or .kml)
        const pathPart = match[1]; // e.g., "folder/" or undefined
        const filenameOnly = match[2]; // e.g., "rides"
        const extPart = match[3]; // e.g., "gpx" or "kml"

        if (!pathPart) {
          // Just a filename (no directory) - use in defaultFolder
          if (defaultFolder) {
            return new FS.File(defaultFolder, `${filenameOnly}.${extPart}`);
          }
          // No defaultFolder, use as relative path from cwd
          return FS.File.cwd(`${filenameOnly}.${extPart}`);
        }
        // It's a path with extension - use as-is
        return new FS.File(output);
      }
      // Output specified but no .gpx/.kml extension - treat as folder path
      const folder = new FS.Folder(output);
      if (!folder.exists()) {
        throw new Error(`Output folder does not exist: ${output}`);
      }
      // Use suggestedFilename or fallback in this folder
      const filename = suggestedFilename
        ? `${suggestedFilename}${extWithDot}`
        : `activities${extWithDot}`;
      return new FS.File(folder, filename);
    }

    // No output specified - use suggestedFilename in defaultFolder
    if (defaultFolder) {
      const filename = suggestedFilename
        ? `${suggestedFilename}${extWithDot}`
        : `activities${extWithDot}`;
      return new FS.File(defaultFolder, filename);
    }

    // No output and no defaultFolder - cannot determine path
    return undefined;
  }
}
