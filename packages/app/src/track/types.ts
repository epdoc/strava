import type { DateRanges } from '@epdoc/daterange';
import type * as FS from '@epdoc/fs/fs';
import type * as Strava from '@epdoc/strava-api';
import type * as Schema from '@epdoc/strava-schema';
import type { Dict } from '@epdoc/type';
import type * as Activity from '../activity/mod.ts';

export type KmlLineStyle = {
  color: string;
  width: number;
};

export type ActivityExType =
  | Schema.Types.ActivityType
  | 'Segment'
  | 'Commute'
  | 'Moto'
  | 'Default';

// LineStyleDefs supports ActivityTypes plus custom style names (Commute, Moto, Segment, Default, etc.)
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
};

export type Opts = CommonOpts & ActivityOpts & StreamSegmentOpts & StreamOpts;

export type Coord = [number, number]; // [lat, lng] - deprecated, use CoordData instead

export type KmlPlacemarkParams = {
  description?: string;
  coordinates?: Partial<Strava.TrackPoint>[];
  placemarkId?: string;
  name?: string;
  styleName?: string;
};
