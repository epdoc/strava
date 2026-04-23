import * as FS from '@epdoc/fs/fs';
import type { Ctx } from '@epdoc/strava-core';
import * as Schema from '@epdoc/strava-schema';
import { BaseClass } from '../base.ts';
import { assert } from '@std/assert/assert';
import type * as Activity from '../activity/mod.ts';
import type * as Segment from '../segment/mod.ts';
import { GpxWriter } from './gpx.ts';
import { KmlWriter } from './kml.ts';
import { defaultKmlLineStyles } from './linestyles.ts';
import type * as Stream from './types.ts';
import type { TrackWriter } from './writer.ts';

type SegmentData = Segment.Data;
type PlacemarkParams = Stream.KmlPlacemarkParams;

const REGEX = {
  color: /^[a-zA-Z0-9]{8}$/,
  moto: /^moto$/i,
  isGpx: /\.gpx$/i,
  isKml: /\.kml$/i,
};

/**
 * Generates KML (Keyhole Markup Language) files for visualizing Strava activities in Google Earth.
 *
 * This class handles the complete workflow of converting Strava activities and segments into
 * KML format suitable for viewing in Google Earth. It provides:
 * - Activity routes as colored line strings (color-coded by activity type)
 * - Lap markers as clickable point placemarks
 * - Segment routes with hierarchical folder organization by region
 * - Custom line styles for different activity types (Ride, Run, Swim, etc.)
 * - Support for both imperial and metric units
 * - Detailed activity descriptions when --more flag is enabled
 *
 * The generated KML files include proper styling, descriptions, and folder organization
 * for easy navigation in Google Earth.
 *
 * @example
 * ```ts
 * const kml = new KmlMain({ activities: true, laps: true, imperial: false });
 * kml.setLineStyles(ctx, customStyles);
 * await kml.outputData(ctx, 'output.kml', activities, segments);
 * ```
 */
export class Handler extends BaseClass {
  private opts: Stream.Opts = {};
  private kmlLinestyles: Stream.KmlLineStyleDefs = defaultKmlLineStyles;
  #writer?: TrackWriter;

  /**
   * @param [opts={}] - KML generation options.
   */
  constructor(ctx: Ctx.Context, opts: Stream.Opts = {}) {
    super(ctx);
    this.opts = opts;
  }

  /**
   * Overwrites the current KML generation options.
   * @param [opts={}] - KML generation options.
   */
  setOptions(opts: Stream.Opts = {}) {
    this.opts = opts;
  }

  /**
   * Indicates if units should be imperial.
   * @returns `true` if imperial units should be used, `false` otherwise.
   */
  get imperial(): boolean {
    return this.opts && this.opts.imperial === true;
  }

  /**
   * Indicates if detailed descriptions should be included.
   * @returns `true` if detailed descriptions are enabled, `false` otherwise.
   */
  get more(): boolean {
    return this.opts && this.opts.more === true;
  }

  /**
   * Indicates if segment effort data should be included.
   * @returns `true` if effort data is enabled, `false` otherwise.
   */
  get efforts(): boolean {
    return this.opts && this.opts.efforts === true;
  }

  /**
   * Returns the stream types required for a given output format.
   *
   * Different output formats need different data from Strava's streams API:
   * - **GPX**: Requires lat/lng, altitude, and time (for elevation data and timestamps)
   * - **KML**: Only requires lat/lng (altitude/time not currently used in KML output)
   *
   * Call this method before `activities.getTrackPoints()` to determine which
   * streams to request from the Strava API.
   *
   * @param outputType - The output format ('kml' or 'gpx')
   * @returns Array of stream keys required for that format
   *
   * @example
   * ```ts
   * const streamTypes = Handler.getStreamTypes('gpx');
   * // Returns: ['latlng', 'altitude', 'time']
   *
   * await activities.getTrackPoints({ streams: streamTypes });
   * ```
   */
  static getStreamTypes(outputType: 'kml' | 'gpx'): Schema.Consts.StreamType[] {
    if (outputType === 'gpx') {
      return [
        Schema.Consts.StreamKeys.LatLng,
        Schema.Consts.StreamKeys.Altitude,
        Schema.Consts.StreamKeys.Time,
      ];
    }
    // KML only needs lat/lng coordinates
    return [Schema.Consts.StreamKeys.LatLng];
  }

  initWriter(_ctx: Ctx.Context, filepath: FS.Path): TrackWriter | undefined {
    assert(!this.#writer, 'writer is already initialized');
    const pathStr = typeof filepath === 'string'
      ? filepath
      : (filepath as unknown as { path: string }).path;

    // Determine writer type based on file extension or path characteristics
    if (REGEX.isKml.test(pathStr)) {
      this.#writer = new KmlWriter(this.ctx, this.opts);
    } else {
      // If path has no extension or is a folder, assume GPX output
      this.#writer = new GpxWriter(this.ctx, this.opts);
    }
    return this.#writer;
  }

  /**
   * Generates a complete KML file from Strava activities and segments.
   *
   * This is the main public method that orchestrates the entire KML generation process.
   * It creates a KML file containing:
   * - Header with custom line styles and lap marker styles
   * - Activities folder with route placemarks and optional lap markers
   * - Segments folder with hierarchical or flat organization
   * - Footer to close the KML document
   *
   * The method uses buffered writing for performance and ensures proper resource cleanup
   * via try/catch blocks.
   *
   * @param filepath Output file path for the KML file
   * @param activities Array of Strava activities with track points
   * @param segments Array of starred segments with coordinates
   *
   * @example
   * ```ts
   * const kml = new KmlMain({ activities: true, segments: true, laps: true });
   * await kml.outputData('strava.kml', activities, segments);
   * // Creates strava.kml ready for Google Earth
   * ```
   */
  async outputData(
    filepath: FS.Path,
    activities: Activity.Item[],
    segments: SegmentData[],
  ): Promise<void> {
    const pathStr = typeof filepath === 'string'
      ? filepath
      : (filepath as unknown as { path: string }).path;

    // Determine output type based on file extension
    if (REGEX.isKml.test(pathStr)) {
      const kmlWriter = new KmlWriter(this.ctx, this.opts);
      await kmlWriter.outputData(pathStr as FS.FilePath, activities, segments);
    } else {
      // GPX output to folder
      const gpxWriter = new GpxWriter(this.ctx, this.opts);
      await gpxWriter.outputData(pathStr as FS.FolderPath, activities);
    }
  }

  /**
   * Generates output file from activities and optional segments.
   *
   * This is the main orchestration method for track output generation. It:
   * 1. Determines output type from file extension (.kml or .gpx)
   * 2. Creates the appropriate writer (KmlWriter or GpxWriter)
   * 3. Applies format-specific configuration (line styles for KML)
   * 4. Delegates to the writer for actual file generation
   *
   * **Usage pattern:**
   * Commands should fetch all data first (activities, track points, segments),
   * then call this method to generate the output file.
   *
   * @param filepath - Output file path as FS.File, FS.Folder, or string path
   *                   (.kml extension for KML, .gpx or folder for GPX)
   * @param activities - Activity collection with fetched track points
   * @param segments - Optional array of starred segments (for KML only)
   *
   * @example
   * ```ts
   * // Fetch all data first
   * const activities = new Activity.Collection(ctx);
   * await activities.getForDateRange(date);
   * await activities.getTrackPoints({ streams: Handler.getStreamTypes('gpx') });
   *
   * // Generate output using FS.File
   * const outputFile = activities.resolveOutputFile({ type: 'gpx' });
   * const handler = new Handler(ctx, { laps: true });
   * await handler.generate(outputFile, activities);
   * ```
   */
  async generate(
    filepath: FS.File | FS.Folder | FS.Path,
    activities: Activity.Collection,
    segments?: SegmentData[],
  ): Promise<void> {
    // Handle FS.File or FS.Folder objects - extract path string
    let pathStr: string;
    if (filepath instanceof FS.File || filepath instanceof FS.Folder) {
      pathStr = filepath.path;
    } else if (typeof filepath === 'string') {
      pathStr = filepath;
    } else {
      pathStr = (filepath as { path: string }).path;
    }

    // Determine output type from file extension
    const isKml = REGEX.isKml.test(pathStr);

    if (isKml) {
      // KML output
      const kmlWriter = new KmlWriter(this.ctx, this.opts);

      // Apply line styles from user settings if available
      const userSettings =
        (this.ctx.app as { userSettings?: { lineStyles?: Stream.KmlLineStyleDefs } }).userSettings;
      if (userSettings?.lineStyles) {
        kmlWriter.setLineStyles(userSettings.lineStyles);
      }

      await kmlWriter.outputData(
        pathStr as FS.FilePath,
        activities.activities,
        segments ?? [],
      );
    } else {
      // GPX output
      const gpxWriter = new GpxWriter(this.ctx, this.opts);
      await gpxWriter.outputData(pathStr as FS.FolderPath, activities.activities);
    }
  }
}
