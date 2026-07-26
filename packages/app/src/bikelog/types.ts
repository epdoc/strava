import type { DateRange } from '@epdoc/daterange';
import type { DateTime } from '@epdoc/datetime';
import type { FileSpec } from '@epdoc/fs';
import type { Dict } from '@epdoc/type';
import type * as Activity from '../activity/mod.ts';
import type { BikeDef } from '../types.ts';

export type OutputOpts = {
  more?: boolean;
  dates?: DateRange;
  imperial?: boolean;
  segmentsFlatFolder?: boolean;
  selectedBikes?: BikeDef[];
  verbose?: number;
  bikes?: Dict;
};

export type Opts = {
  activities: Activity.Collection;
  output?: string | FileSpec; // output filename
  selectedBikes?: BikeDef[]; // bike filter definitions
  bikes?: Dict; // bike definitions for identifying bikes
};

export type BikelogEntry = {
  jd: number;
  date?: DateTime;
  events: Array<{
    distance?: number;
    bike?: string;
    el?: number;
    t?: number;
    wh?: number;
  }>;
  note0?: string;
  note1?: string;
  wt?: number;
};
