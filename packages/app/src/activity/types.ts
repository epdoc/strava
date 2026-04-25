import type * as FS from '@epdoc/fs/fs';
import type { State } from '@epdoc/strava-app';
import type * as Schema from '@epdoc/strava-schema';
import type { Region } from './mod.ts';

/**
 * Filter options for activities.
 */
export type FilterOpts = {
  /** Whether to include only commute activities. */
  commuteOnly?: boolean;
  /** Whether to include only non-commute activities. */
  nonCommuteOnly?: boolean;
  /** An array of activity types to include. If not specified, all types are included. */
  include?: Schema.Types.ActivityType[];
  /** An array of activity types to exclude. */
  exclude?: Schema.Types.ActivityType[];
  /** An array of region codes to filter by. If specified, only activities starting in these regions are included. */
  regions?: Region.Code[];
};

export type ResolveFileOpts = {
  /** A filename, path or path and filename */
  output?: string;
  /** One of acroforms, kml, gpx  */
  type: State.OutputType;
  /** not used */
  defaultFolder?: FS.FolderPath;
};
