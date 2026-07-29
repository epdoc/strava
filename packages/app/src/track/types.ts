import type { DateRanges } from '@epdoc/daterange';
import type * as FS from '@epdoc/fs/fs';
import type * as Strava from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';
import type { Dict } from '@epdoc/type';
import type * as Activity from '../activity/mod.ts';

/** A KML line style definition with color (aabbggrr hex) and width in pixels. */
export type KmlLineStyle = {
  color: string;
  width: number;
};

/**
 * Extended activity type that includes standard Strava types plus virtual
 * style names used in the KML line-style system.
 */
export type ActivityExType =
  | Schema.Types.ActivityType
  | 'Segment'
  | 'Commute'
  | 'Moto'
  | 'Default';

// LineStyleDefs supports ActivityTypes plus custom style names (Commute, Moto, Segment, Default, etc.)
/** A map of activity types to their KML line style definitions. */
export type KmlLineStyleDefs = Partial<Record<ActivityExType, KmlLineStyle>>;

/**
 * Options used when including Activity information
 */
export type ActivityOpts = Activity.FilterOpts & {
  activities?: boolean;
  efforts?: boolean; // include starred segment efforts in activity descriptions
};

/**
 * Options used only when generating segments in streams
 */
export type StreamSegmentOpts = {
  segments?: boolean | 'only' | 'flat'; // true/only = include segments, flat = flat folder structure
  refresh?: boolean; // refresh list of starred segments from Strava
  bikes?: Dict; // bike definitions for identifying moto vs bike
};

export type CommonOpts = {
  output?: FS.Path; // output filename with extension or folder path if outputting gpx files
  date?: DateRanges; // date range for which to output data
  more?: boolean; // include basic activity stats in description (distance, elevation, times, custom props)
  imperial?: boolean; // use imperial units (miles, feet) instead of metric
};

/**
 * Options used only when generating streams
 */
export type StreamOpts = {
  activities?: boolean;
  laps?: boolean; // include lap waypoints
  noTracks?: boolean; // suppress track output (only output waypoints)
  blackout?: boolean;
  /** allow duplicate intermediate track points instead of filtering them out */
  allowDups?: boolean;
  /** filter by commute status: 'yes' = commutes only, 'no' = non-commutes only, 'all' = both */
  commute?: 'yes' | 'no' | 'all';
  /** organize activities into folders by region in KML output */
  splitRegions?: boolean;
};

/** Combined stream generation options from all option subsets. */
export type Opts = CommonOpts & ActivityOpts & StreamSegmentOpts & StreamOpts;

/** @deprecated Use TrackPoint from Strava schema instead. Represents [lat, lng]. */
export type Coord = [number, number];

export type KmlPlacemarkParams = {
  description?: string;
  coordinates?: Partial<Strava.TrackPoint>[];
  placemarkId?: string;
  name?: string;
  styleName?: string;
};
