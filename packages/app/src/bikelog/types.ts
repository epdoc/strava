import type { DateRange } from '@epdoc/daterange';
import type { DateTime } from '@epdoc/datetime';
import type { FileSpec } from '@epdoc/fs';
import type * as FS from '@epdoc/fs/fs';
import type { Dict } from '@epdoc/type';
import type * as Activity from '../activity/mod.ts';
import type { BikeDef } from '../types.ts';
import type { BikelogPdf } from './pdf.ts';

export type OutputOpts = {
  more?: boolean;
  dates?: DateRange;
  imperial?: boolean;
  segmentsFlatFolder?: boolean;
  selectedBikes?: BikeDef[];
  verbose?: number;
  bikes?: Dict;
};

export type Opts = IOverwrite & {
  activities: Activity.Collection;
  output?: string | FileSpec; // output filename
  selectedBikes?: BikeDef[]; // bike filter definitions
  bikes?: Dict; // bike definitions for identifying bikes
};

// export type FillOpts = Opts & IOverwrite & {
//   fsSrcPdf: FS.File;
//   fsDestPdf?: FS.File;
// };

export interface IOverwrite {
  overwrite?: boolean;
}

export type File = {
  output: FS.File;
  pdf: BikelogPdf;
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
