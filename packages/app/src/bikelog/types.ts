import type { DateRange } from '@epdoc/daterange';
import type { DateTime } from '@epdoc/datetime';
import type { FileSpec } from '@epdoc/fs';
import type * as FS from '@epdoc/fs/fs';
import type { Dict } from '@epdoc/type';
import type * as Activity from '../activity/mod.ts';
import type { BikeDef } from '../types.ts';
import type { BikelogPdf } from './pdf.ts';

/** Options passed to the Bikelog constructor for configuring output generation. */
export type OutputOpts = {
  /** Include detailed activity stats in descriptions */
  more?: boolean;
  /** Date range filter for activities */
  dates?: DateRange;
  /** Use imperial units (miles, feet) */
  imperial?: boolean;
  /** Use flat folder structure for segments */
  segmentsFlatFolder?: boolean;
  /** Bike definitions for filtering and name mapping */
  selectedBikes?: BikeDef[];
  /** Verbosity level */
  verbose?: number;
  /** Bike gear dictionary from Strava athlete data */
  bikes?: Dict;
};

/**
 * Options for PDF filling operations.
 * Extends IOverwrite to support overwrite control.
 */
export type Opts = IOverwrite & {
  /** Activity collection to fill into the PDF */
  activities: Activity.Collection;
  /** Output filename or path */
  output?: string | FileSpec;
  /** Bike filter definitions */
  selectedBikes?: BikeDef[];
  /** Bike definitions for identifying bikes */
  bikes?: Dict;
};

/**
 * Controls whether existing form field values should be overwritten.
 */
export interface IOverwrite {
  /** When true, overwrite existing field values. When false/undefined, skip already-filled fields. */
  overwrite?: boolean;
}

/**
 * Bundles a BikelogPdf instance with its output file destination.
 */
export type File = {
  /** The file to write the filled PDF to */
  output: FS.File;
  /** The PDF form handler instance */
  pdf: BikelogPdf;
};

/**
 * A single day's entry in the bikelog containing up to two bike events and notes.
 */
export type BikelogEntry = {
  /** Julian day number */
  jd: number;
  /** Calendar date (derived from jd) */
  date?: DateTime;
  /** Up to two bike ride events for the day */
  events: Array<{
    distance?: number;
    bike?: string;
    el?: number;
    t?: number;
    wh?: number;
  }>;
  /** Primary activity note (multiline text field) */
  note0?: string;
  /** Secondary note */
  note1?: string;
  /** Body weight entry */
  wt?: number;
};
