import { SilentError } from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import type { ISODate } from '@epdoc/datetime';
import * as FS from '@epdoc/fs/fs';
import * as Strava from '@epdoc/strava-api';
import { BaseClass, type Ctx } from '@epdoc/strava-core';
import * as Schema from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import { assert } from '@std/assert/assert';
import * as Activity from './activity/mod.ts';
import * as BikeLog from './bikelog/mod.ts';
import config from './consts.ts';
import * as Segment from './segment/mod.ts';
import * as State from './state/mod.ts';
import type * as Stream from './track/mod.ts';
import type * as App from './types.ts';

assert(
  _.isDict(config) && 'paths' in config && _.isDict(config.paths),
  'Invalid application configuration',
);
const configPaths = config.paths;

/**
 * Main application class handling Strava API interactions and core business logic.
 *
 * This class serves as the central coordinator for all Strava-related operations,
 * implementing business logic that is independent of the user interface. It can be
 * used from CLI commands, web interfaces, or any other front-end.
 *
 * Key responsibilities:
 * - Strava API initialization and authentication
 * - Athlete profile retrieval
 * - Activity fetching with date range filtering
 * - KML file generation for Google Earth visualization
 * - Adobe Acroforms XML generation for bikelog PDF forms
 * - User settings and configuration management
 *
 * The class follows the pattern of delegating presentation concerns to commands while
 * containing all domain logic here for reusability.
 *
 * @example
 * ```ts
 * const app = new Main();
 * await app.init(ctx, { strava: true, userSettings: true });
 * await app.getAthlete(ctx);
 * await app.getKml(ctx, { activities: true, date: dateRanges, output: 'output.kml' });
 * ```
 */
export class Main extends BaseClass {
  #api: Strava.Api;
  #stateFile?: State.StateFile;
  #cachedSegments?: Segment.CacheMap;
  athlete?: Schema.Athlete.Detailed;
  userSettings?: App.UserSettings;
  notifyOffline = false;

  constructor(ctx: Ctx.Context) {
    super(ctx);
    // Initialize with defaults
    this.#api = new Strava.Api(ctx, configPaths.userCreds, [{ file: configPaths.clientCreds }, {
      env: true,
    }]);
  }

  /**
   * Gets the initialized Strava API client instance.
   *
   * @returns The API client configured with user credentials
   * @throws Error if API not initialized (should not happen in normal usage)
   */
  get api(): Strava.Api {
    if (!this.#api) {
      throw new Error('API not initialized. Call initClient() first.');
    }
    return this.#api;
  }

  /**
   * Initializes application services based on specified options.
   *
   * This method selectively initializes only the services needed for a given
   * operation, avoiding unnecessary initialization overhead. Services are
   * initialized in order:
   *
   * 1. Configuration files (if `opts.config` is true).
   * 2. Strava API with OAuth authentication (if `opts.strava` is true).
   * 3. User settings from `~/.strava/user.settings.json` (if `opts.userSettings` is true).
   * 4. State file from `~/.strava/user.state.json` (if `opts.state` is true).
   *
   * @param ctx - Application context with logging.
   * @param [opts={}] - Initialization options.
   * @param [opts.config] - When true, initializes configuration files.
   * @param [opts.strava] - When true, initializes the Strava API client with authentication.
   * @param [opts.userSettings] - When true, loads user settings (e.g. line styles, bikes).
   * @param [opts.state] - When true, loads the persistent state file.
   *
   * @example
   * ```ts
   * // Initialize only what's needed for an athlete command
   * await app.init(ctx, { strava: true, userSettings: true });
   *
   * // Initialize everything including state
   * await app.init(ctx, { config: true, strava: true, userSettings: true, state: true });
   * ```
   */
  async init(opts: App.Opts = {}): Promise<void> {
    if (opts.config) {
      // TODO: Load configuration files
    }

    if (opts.strava) {
      await this.#api.init();
    }

    if (opts.userSettings) {
      this.log.info.text('Loading user settings').relative(configPaths.userSettings.path).start();
      const rawSettings = await configPaths.userSettings.readJson<App.UserSettings>();
      this.userSettings = _.deepCopy(rawSettings, {
        replace: { 'HOME': FS.Folder.home().path },
        pre: '${',
        post: '}',
      }) as App.UserSettings;
      this.log.info.icheck().text('Loaded user settings').relative(configPaths.userSettings.path)
        .stop();
    }

    if (opts.state) {
      this.#stateFile = new State.StateFile(this.ctx, configPaths.userState);
      await this.#stateFile.load();
    }
  }

  /**
   * Gets the last updated timestamp for a specific output type from the state file.
   *
   * This method retrieves the timestamp of the most recent activity processed for
   * the given output type. This timestamp can be used to fetch only new activities
   * since the last run.
   *
   * @param type - The output type ('kml' or 'pdf')
   * @returns ISO date string of last update, or undefined if no state available
   */
  getLastUpdated(type: State.OutputType): ISODate | undefined {
    if (!this.#stateFile) {
      return undefined;
    }
    return this.#stateFile.getLastUpdated(type);
  }

  /**
   * Updates the state file with the latest activity timestamp for an output type.
   *
   * This method records the most recent activity date in the state file, which is
   * used to determine the default date range for subsequent runs (fetching only
   * new activities since the last update).
   *
   * @param type - The output type ('kml', 'gpx', or 'pdf')
   * @param activities - Array of activities to extract the latest timestamp from
   * @returns Promise that resolves when the state file is updated
   */
  async updateState(type: State.OutputType, activities: Activity.Item[]): Promise<void> {
    if (this.#stateFile && activities.length > 0) {
      await this.#stateFile.updateLastUpdated(type, activities);
    }
  }

  /**
   * Checks if internet access is available.
   *
   * @param _ctx - Application context (currently unused).
   * @returns A promise that resolves to `true` if online, `false` otherwise.
   * @todo Implement a more robust internet connectivity check.
   */
  checkInternetAccess(_ctx: Ctx.Context): Promise<boolean> {
    // Simple internet check - for now just return true
    // TODO: Implement actual internet connectivity check
    return Promise.resolve(true);
  }

  /**
   * Sets the athlete ID for API calls.
   *
   * @param _id - The athlete ID to set.
   * @todo Implement athlete ID storage and usage.
   */
  setAthleteId(_id: Schema.Athlete.Id): Promise<void> {
    // TODO: Implement athlete ID storage and usage
    return Promise.resolve();
  }

  /**
   * Retrieves athlete profile information from the Strava API.
   *
   * Fetches the authenticated athlete's profile (or a specific athlete if an ID
   * is provided) and stores it in the `athlete` property. The profile includes:
   *
   * - Name and location (city, state, country)
   * - Athlete ID
   * - A list of the athlete's bikes and shoes
   *
   * @param ctx - Application context for logging.
   * @param [athleteId] - Optional. The ID of a specific athlete. Defaults to the
   * authenticated user.
   *
   * @example
   * ```ts
   * await app.getAthlete(ctx);
   * console.log(app.athlete?.firstname, app.athlete?.bikes);
   * ```
   */
  async getAthlete(athleteId?: Schema.Athlete.Id): Promise<void> {
    try {
      this.log.info.text('Retrieving athlete information').start();
      this.athlete = await this.api.getAthlete(athleteId);
      if (!this.athlete) {
        this.log.info.ierror().text('Athlete is not defined').stop();
        throw new SilentError('Athlete is not defined');
      }
      this.log.info.icheck().text('Retrieved athlete:').value(this.athlete.firstname).value(
        this.athlete.lastname,
      ).stop();
    } catch (e) {
      const err = _.asError(e);
      this.log.info.ierror().text('Failed to get athelete').error(err.message).stop();
      throw new SilentError(err.message);
    }
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
   * @deprecated
   */
  // async getActivitiesForDateRange(
  //   date: DateRanges,
  //   opts: Activity.GetActivitiesOpts = {},
  // ): Promise<Activity.Collection> {
  //   const activities = new Activity.Collection(this.ctx, this.#api, this.athlete);

  //   await this.api.refreshToken();

  //   await activities.getForDateRange(date);
  //   await activities.getDetailsAndSegments(opts);
  //   await activities.getTrackPoints(opts);

  //   // Attach starred segments if requested
  //   if (opts.starredSegments) {
  //     const starredSegmentDict = await this.getStarredSegmentDict();
  //     activities.attachStarredSegments(starredSegmentDict);
  //   }

  //   return activities;
  // }

  /**
   * Generates a KML or GPX file from Strava activities or segments.
   *
   * This method orchestrates the complete track generation workflow:
   * 1. Initializes a track generator with user-configured line styles.
   * 2. Validates that activities or segments are requested.
   * 3. Fetches activities for the specified date ranges, applying filters.
   * 4. Optionally fetches detailed activity data for lap markers (if `streamOpts.laps` is true).
   * 5. Fetches track points for each activity from Strava streams.
   * 6. Applies commute filtering based on `streamOpts.commute`.
   * 7. Generates output file with appropriate styling and organization.
   * 8. Updates state file with the latest activity timestamp (if outputType provided).
   *
   * The generated file can include:
   * - Activity routes as color-coded tracks.
   * - Optional lap markers as waypoints.
   * - Segment routes organized by region.
   *
   * @param ctx - Application context for logging.
   * @param streamOpts - Track generation options.
   * @param [outputType] - Optional output type ('kml' or 'pdf') for state tracking.
   * @param [streamOpts.activities=false] - Whether to include activity paths in the output.
   * @param [streamOpts.date] - Date ranges for filtering activities. Required if `streamOpts.activities` is true.
   * @param [streamOpts.output='Activities.kml'] - The path for the output file.
   * @param [streamOpts.laps=false] - Whether to include lap markers.
   * @param [streamOpts.commute='all'] - Commute filter ('yes', 'no', or 'all').
   * @param [streamOpts.more=false] - Whether to include detailed descriptions.
   * @param [streamOpts.efforts=false] - Whether to include effort data.
   * @param [streamOpts.imperial=false] - Whether to use imperial units.
   * @throws If neither `streamOpts.activities` nor `streamOpts.segments` is true.
   *
   * @example
   * ```ts
   * await app.getTrack(ctx, {
   *   activities: true,
   *   laps: true,
   *   date: dateRanges,
   *   output: 'rides.kml',
   *   commute: 'no'
   * }, 'kml');
   * ```
   *
   * @deprecated Use the Handler-based approach instead:
   * ```ts
   * const streamTypes = Handler.getStreamTypes('gpx');
   * await activities.getTrackPoints({ streams: streamTypes });
   * const handler = new Handler(ctx, opts);
   * await handler.generate(outputPath, activities);
   * await app.updateState('gpx', activities.activities);
   * ```
   */
  // async getTrack(streamOpts: Stream.Opts, outputType?: State.OutputType): Promise<void> {
  //   // Validate that at least activities or segments is requested
  //   if (!streamOpts.activities && !streamOpts.segments) {
  //     throw new Error('When writing KML, select either segments, activities, or both');
  //   }

  //   // Initialize stream generator with options and line styles
  //   const handler = new Stream.Handler(this.ctx, streamOpts);
  //   assert(streamOpts.output, 'Output path is required for stream generation');
  //   const writer = await handler.initWriter(this.ctx, streamOpts.output);

  //   assert(writer, 'No stream writer could be generated for the given output path');

  //   if (writer instanceof KmlWriter && this.userSettings && this.userSettings.lineStyles) {
  //     writer.setLineStyles(this.userSettings.lineStyles);
  //   }

  //   let segments: Segment.Data[] = [];
  //   let activities: Activity.Collection | undefined = undefined;

  //   if (streamOpts.activities) {
  //     assert(streamOpts.date);

  //     const opts: Activity.GetActivitiesOpts = {
  //       detailed: streamOpts.laps === true || streamOpts.more || streamOpts.efforts,
  //       streams: writer?.streamTypes(),
  //       starredSegments: streamOpts.efforts,
  //       dedup: (streamOpts.allowDups === true) ? false : true,
  //     };
  //     // Filter activities based on commute option
  //     if (streamOpts.commute === 'yes') {
  //       opts.filter = { commuteOnly: true };
  //     } else if (streamOpts.commute === 'no') {
  //       opts.filter = { nonCommuteOnly: true };
  //     }
  //     if (streamOpts.blackout) {
  //       assert(this.userSettings, 'User settings have not been read');
  //       opts.blackoutZones = this.userSettings.blackoutZones;
  //     }

  //     activities = await this.getActivitiesForDateRange(streamOpts.date!, opts);
  //   }

  //   // Fetch segments because we are building a KML of all our segments
  //   if (streamOpts.segments) {
  //     segments = await this.getKmlSegments(streamOpts);
  //   }

  //   if (activities) {
  //     if (activities.length || segments.length) { // Generate KML or GPX files
  //       // We already asserted output is not undefined earlier
  //       const outputPath = streamOpts.output;

  //       await handler.outputData(outputPath, activities.activities, segments);

  //       // Update state file with the latest activity timestamp
  //       if (outputType && this.#stateFile && activities.length > 0) {
  //         await this.#stateFile.updateLastUpdated(outputType, activities.activities);
  //       }
  //     }
  //   } else {
  //     this.log.info.warn('No activities or segments found for the specified criteria').emit();
  //   }
  // }

  /**
   * Retrieves segments suitable for KML generation.
   *
   * This method fetches starred segments including their coordinates, but
   * without effort data, which is not needed for KML visualization.
   *
   * @param ctx - Application context for logging.
   * @param opts - Options for fetching KML segments, including date ranges.
   * @returns A promise that resolves to an array of segment data.
   */
  async getKmlSegments(
    opts: Stream.CommonOpts & Stream.StreamSegmentOpts,
  ): Promise<Segment.Data[]> {
    const result: Segment.Data[] = await this.getSegments({
      coordinates: true,
      efforts: false, // Don't fetch efforts for KML, just coordinates
      dateRanges: opts.date,
    });
    return result;
  }

  /**
   * Generates an Adobe Acroforms XML file for bikelog PDF forms.
   *
   * This method orchestrates the XML generation for bikelog PDFs:
   * 1. Validates that date ranges are specified.
   * 2. Fetches activities within the given date ranges.
   * 3. Fetches detailed data for each activity to access descriptions and private notes.
   * 4. Prepares a dictionary of the athlete's bikes from their profile.
   * 5. Generates an XML file containing daily activity summaries.
   * 6. Updates state file with the latest activity timestamp (if outputType provided).
   *
   * The generated XML can include:
   * - Up to two bike ride events per day (distance, bike, elevation, time).
   * - Activity notes parsed from descriptions and private notes.
   * - Custom properties and weight data extracted from descriptions.
   * - Non-bike activities (e.g., runs, swims) in the notes section.
   *
   * @param ctx - Application context for logging.
   * @param pdfOpts - PDF/XML generation options.
   * @param [outputType] - Optional output type ('pdf') for state tracking.
   * @param pdfOpts.date - The date ranges for activity filtering.
   * @param [pdfOpts.output='bikelog.xml'] - The path for the output file.
   *
   * @example
   * ```ts
   * await app.getPdf(ctx, {
   *   date: dateRanges,
   *   output: 'bikelog2024.xml'
   * }, 'pdf');
   * ```
   */
  async getPdf(
    pdfOpts: BikeLog.Opts,
    outputType?: State.OutputType,
  ): Promise<void> {
    // Fetch activities if we have date ranges
    if (!(pdfOpts.date && pdfOpts.date.hasRanges())) {
      this.log.warn.warn('No date ranges specified').emit();
      return;
    }

    this.log.info.text('Generating PDF/XML for Adobe Acrobat Forms').emit();

    const _opts: Activity.GetActivitiesOpts = {
      detailed: true,
      starredSegments: true,
    };

    const activities = new Activity.Collection(this.ctx);
    await activities.getForDateRange(pdfOpts.date);

    // Prepare bikes dict from athlete data
    const bikes: Record<string, Schema.Gear.Summary> = {};
    if (this.athlete && 'bikes' in this.athlete) {
      const athleteBikes = this.athlete.bikes;
      if (_.isArray(athleteBikes)) {
        athleteBikes.forEach((bike: Schema.Gear.Summary) => {
          if (bike && bike.id) {
            bikes[bike.id] = bike;
          }
        });
      }
    }

    // Create Bikelog instance with options
    const bikelogOpts: BikeLog.OutputOpts = {
      more: true, // pdfOpts.more,
      dates: pdfOpts.date,
      bikes,
    };

    const bikelog = new BikeLog.Bikelog(bikelogOpts);

    // Generate output file path
    const outputPath = typeof pdfOpts.output === 'string'
      ? pdfOpts.output
      : pdfOpts.output?.path
      ? pdfOpts.output.path
      : 'bikelog.xml';

    // if (pdfOpts.dryRun) {
    //   this.log.info.text(`Dry run: would generate XML file: ${outputPath}`).emit();
    //   this.log.info.text(`Would process ${activities.length} activities`).emit();
    //   return;
    // }

    this.log.info.text('Generating XML file').fs(outputPath).emit();
    await bikelog.outputData(this.ctx, outputPath, activities.activities);
    this.log.info.h2('PDF/XML file generated successfully').fs(outputPath).emit();

    // Update state file with the latest activity timestamp
    if (outputType && this.#stateFile && activities.length > 0) {
      await this.#stateFile.updateLastUpdated(outputType, activities.activities);
    }
  }

  /**
   * Refreshes the cache of the user's starred segments.
   *
   * This method forces an update of the local cache of starred segments by
   * fetching the latest data from the Strava API.
   */
  async refreshStarredSegments() {
    const segFile = new Segment.File(this.ctx, new FS.File(configPaths.userSegments));
    await segFile.get({ refresh: true });
    // Clear the in-memory cache so next call to getCachedSegments() gets fresh data
    this.#cachedSegments = undefined;
  }

  /**
   * Retrieves all starred segments from the cache, with optional efforts and coordinates.
   *
   * @remarks
   * This method returns all of the user's starred segments from the local
   * cache (`~/.strava/user.segments.json`), not just segments related to
   * specific activities. To filter and attach only the starred segments that
   * appear in specific activities, use {@link Main.getStarredSegmentDict} and
   * {@link Api.Activity.attachStarredSegments}.
   *
   * **Cache Behavior**:
   * - Segment metadata (ID, name, distance, country, state) is cached locally.
   * - Coordinates are **never** cached and are always fetched from the Strava
   *   API when requested.
   * - If the cache is empty, this method returns an empty array. The cache can
   *   be populated by running the `segments --refresh` command or by setting
   *   `opts.refresh` to `true`.
   * - The cache is only updated from the Strava API if `opts.refresh` is `true`.
   *
   * **Coordinates**:
   * When `opts.coordinates` is `true`, coordinates are fetched from the Strava
   * API for all starred segments. This may require a separate API call for each
   * segment and is subject to rate limits.
   *
   * **Efforts**:
   * When `opts.efforts` is `true`, personal effort data is fetched for all
   * starred segments within the specified date ranges.
   *
   * @param ctx - Application context for logging.
   * @param [opts={}] - Segment fetch options.
   * @param [opts.coordinates=false] - If true, fetches coordinates for all starred segments.
   * @param [opts.efforts=false] - If true, fetches personal efforts for all starred segments.
   * @param [opts.dateRanges] - Date ranges to filter efforts. Required if `opts.efforts` is true.
   * @param [opts.refresh=false] - If true, refreshes the metadata cache from the Strava API.
   * @returns A promise that resolves to an array of all starred segments, with
   * optional efforts and coordinates.
   *
   * @example
   * ```ts
   * // First run - populate the cache from Strava
   * await app.getSegments(ctx, { refresh: true });
   *
   * // Get all starred segments with coordinates for KML
   * const segmentsWithCoords = await app.getSegments(ctx, { coordinates: true });
   *
   * // Get all starred segments with effort data for analysis
   * const segmentsWithEfforts = await app.getSegments(ctx, {
   *   efforts: true,
   *   dateRanges: dateRanges
   * });
   * ```
   */
  async getSegments(
    opts: { efforts?: boolean; coordinates?: boolean; dateRanges?: DateRanges; refresh?: boolean } =
      {},
  ): Promise<Segment.Data[]> {
    const m0 = this.log.mark();

    // Load or refresh segment cache
    const segFile = new Segment.File(this.ctx, new FS.File(configPaths.userSegments));
    await segFile.get({ refresh: opts.refresh });

    // Clear in-memory cache if we refreshed from server
    if (opts.refresh) {
      this.#cachedSegments = undefined;
    }

    // Get all cached segments
    const cachedSegments = segFile.getAllSegments();
    this.log.info.text('Loaded').count(cachedSegments.length).text(
      'starred segment',
      'starred segments',
    )
      .text('from cache').ewt(m0);

    // Convert CacheEntry objects to SegmentData
    const segments: Segment.Data[] = [];
    for (const cached of cachedSegments) {
      if (!cached.id || !cached.name) {
        continue; // Skip invalid entries
      }

      // Create SegmentData from cached entry
      const segmentBase = new Segment.Base({
        id: cached.id,
        name: cached.name,
        distance: cached.distance || 0,
      });

      const segment = new Segment.Data(segmentBase);
      segment.id = cached.id;
      segment.name = cached.name;
      segment.elapsedTime = 0;
      segment.movingTime = 0;
      segment.distance = cached.distance || 0;
      segment.country = cached.country || '';
      segment.state = cached.state || '';
      segment.coordinates = []; // Never load coordinates from cache - fetch on demand only

      segments.push(segment);
    }

    // Fetch coordinates if requested and needed
    if (opts.coordinates && segments.length > 0) {
      // Find segments that need coordinates (not cached)
      const segmentsNeedingCoords = segments.filter((seg) =>
        !seg.coordinates || seg.coordinates.length === 0
      );

      if (segmentsNeedingCoords.length > 0) {
        this.log.info.text('Fetching coordinates for').count(segmentsNeedingCoords.length).text(
          'segment',
          'segments',
        )
          .emit();

        let rateLimitHit = false;
        for (const segment of segmentsNeedingCoords) {
          if (rateLimitHit) {
            break; // Stop fetching if we hit rate limit
          }

          try {
            const coords = await this.api.getStreamCoords(
              'segments',
              [Schema.Consts.StreamKeys.LatLng, Schema.Consts.StreamKeys.Altitude],
              segment.id,
              segment.name,
            );
            if (coords && coords.length > 0) {
              segment.coordinates = coords;
              // Update cache with fetched coordinates
              // segFile.updateCoordinates(segment.id, coords);
            }
          } catch (e) {
            const err = _.asError(e);
            // Check for rate limit (429) error
            if (err.message.includes('429')) {
              this.log.warn.text(
                'Rate limit hit. Stopping coordinate fetch. Use cached coordinates for remaining segments.',
              )
                .emit();
              rateLimitHit = true;
            }
            // For other errors (404, etc.), just continue silently
          }
        }
      } else {
        this.log.info.text('All segments already have coordinates').emit();
      }
    }

    // Fetch efforts if requested
    if (opts.efforts && opts.dateRanges && segments.length > 0) {
      this.log.info.text('Fetching segment efforts for date ranges').emit();
      if (!this.athlete?.id) {
        throw new Error('Athlete ID is required to fetch segment efforts');
      }
      const athleteId = this.athlete.id;

      for (const segment of segments) {
        const allEfforts: Schema.Segment.DetailedEffort[] = [];

        // Get efforts for each date range
        for (const dateRange of opts.dateRanges.ranges) {
          try {
            const params: Strava.Query = {
              athlete_id: athleteId,
              per_page: 200,
              start_date_local: (dateRange.after || new Date(1975, 0, 1)).toString(),
              end_date_local: (dateRange.before || Temporal.Instant.fromEpochMilliseconds(0))
                .toString(),
            };

            const efforts = await this.api.getSegmentEfforts(segment.id, params);
            if (_.isArray(efforts) && efforts.length > 0) {
              allEfforts.push(...efforts);
            }
          } catch (_e) {
            this.log.warn.text('Failed to fetch efforts for segment').value(segment.name).emit();
          }
        }

        if (allEfforts.length > 0) {
          // Sort by elapsed time
          allEfforts.sort((a, b) => {
            const aTime = a.elapsed_time || 0;
            const bTime = b.elapsed_time || 0;
            return aTime - bTime;
          });
          this.log.info.text('Found').count(allEfforts.length).text('effort', 'efforts').text('for')
            .value(segment.name).emit();
          // Store efforts on segment
          segment.efforts = allEfforts;
        }
      }
    }

    return segments;
  }

  async getCachedSegments(): Promise<Segment.CacheMap> {
    if (!this.#cachedSegments) {
      const segFile = new Segment.File(this.ctx, new FS.File(configPaths.userSegments));
      await segFile.get({ refresh: false }); // Use cache, don't refresh
      this.#cachedSegments = segFile.segments;
    }
    return this.#cachedSegments;
  }

  /**
   * Retrieves a dictionary of starred segments from the cache.
   *
   * This method fetches the list of starred segments from the cache, applies any
   * configured name aliases, and returns a dictionary mapping segment IDs to
   * their names. This dictionary is used to efficiently identify starred
   * segments in activities.
   *
   * @param ctx - Application context for logging.
   * @returns A promise that resolves to a dictionary of starred segments, where
   * the keys are segment IDs and the values are the segment names.
   *
   * @example
   * ```ts
   * const starredSegments = await app.getStarredSegmentDict(ctx);
   * for (const activity of activities) {
   *   activity.attachStarredSegments(starredSegments);
   * }
   * ```
   */
  async getStarredSegmentDict(): Promise<Strava.StarredSegmentDict> {
    // Load a list of starred segments from cache (populated by `segments --refresh` command)

    const cachedSegments = await this.getCachedSegments();

    if (cachedSegments.size === 0) {
      this.log.info.text(
        'No starred segments found in cache. Run `segments --refresh` to populate cache.',
      )
        .emit();
      return {};
    }

    // Build a map of segmentId -> (aliased) segmentName
    const starredSegments: Strava.StarredSegmentDict = Array.from(cachedSegments.entries()).reduce(
      (acc, [id, seg]) => {
        if (seg.name) {
          let segmentName = seg.name.trim();
          // Apply segment name alias from user settings if available
          if (this.userSettings?.aliases) {
            // Try direct lookup first
            if (segmentName in this.userSettings.aliases) {
              segmentName = this.userSettings.aliases[segmentName];
            } else {
              // Try case-insensitive lookup
              const lowerName = segmentName.toLowerCase();
              const aliasKey = Object.keys(this.userSettings.aliases).find(
                (key) => key.toLowerCase() === lowerName,
              );
              if (aliasKey) {
                segmentName = this.userSettings.aliases[aliasKey];
              }
            }
          }
          acc[id] = segmentName;
        }
        return acc;
      },
      {} as Strava.StarredSegmentDict,
    );
    return starredSegments;
  }
}
