import type * as CliApp from '@epdoc/cliapp';
import { type DateRanges, dateRanges } from '@epdoc/daterange';
import * as FS from '@epdoc/fs/fs';
import { _ } from '@epdoc/type';
import type { OutputFormat } from './context.ts';

export type CmdOptions = CliApp.LogCmdOptions & {
  date: DateRanges;
  output: string;
  laps?: boolean;
  blackout: boolean;
  allowDups: boolean;
  imperial?: boolean;
  format?: OutputFormat;
};

/** Region code for filtering activities by geographic region (e.g., 'CR' for Costa Rica, 'EU' for Europe) */
export type RegionCode = string;

export const optionDefs: CliApp.OptionDefMap = {
  date: {
    short: 'd',
    name: 'date',
    params: '<date-range>',
    description: "Date range(s) (e.g., 20240101-20241231). Enter '?' for more help.",
    argParser: dateRanges,
    help: `
DATE RANGE FORMATS:

  Absolute Dates:
    YYYYMMDD          Single date (e.g., 20240115)
    YYYYMM            Whole month (e.g., 202401)
    YYYY              Whole year (e.g., 2024)
    YYYYMMDD-YYYYMMDD Date range (e.g., 20240101-20241231)

  Relative Times (from now):
    Ns, Nm, Nh, Nd    Seconds, minutes, hours, days (e.g., 1d, 2h30m)
    Nw, Nmo, Ny       Weeks, months, years (e.g., 1w, 3mo)
    now               Current time
    today             Start of today

  Multiple Ranges (comma-separated):
    2024,202501-202503      Multiple years and ranges
    1d-now,20240101-20240201  Mix relative and absolute

EXAMPLES:
  -d 20240101-20241231     All of 2024
  -d 7d-now                 Last 7 days
  -d today                  Today only
  -d 1mo                    Last month
  -d 2024,2025             All of 2024 and 2025
`,
  },
  // output: {
  //   short: 'o',
  //   description: 'Output ${cmd} filename (default location is set in user settings).',
  //   name: 'output',
  //   params: '[filename]',
  //   argParser: (str: string) => {
  //     return str;
  //   },
  // },
  segments: {
    short: 's',
    name: 'segments',
    params: '[mode]',
    description: 'Include starred segments',
    choices: ['only', 'flat'],
    argParser: (str: string | boolean) => {
      if (str === true || str === '') return true;
      return [];
    },
  },
  blackout: {
    short: 'b',
    name: 'blackout',
    description: "Apply user's blackout zones to generated ${cmd} file",
  },
  more: {
    short: 'm',
    name: 'more',
    description: 'Include activity stats in descriptions (distance, elevation, times)',
  },
  laps: {
    short: 'l',
    name: 'laps',
    description: 'Include lap waypoints',
  },
  noTracks: {
    name: 'noTracks',
    description: 'Suppress track output (only output waypoints)',
  },
  efforts: {
    short: 'e',
    name: 'efforts',
    description: 'Include activity stats + starred segment efforts in descriptions (superset of --more)',
  },
  allowDups: {
    name: 'allow-dups',
    description: 'allow duplicate intermediate track points instead of filtering them out',
  },
  dryRun: {
    short: 'n',
    name: 'dry-run',
    description: 'Do not modify any data (database, files or server)',
  },
  refresh: {
    short: 'r',
    name: 'refresh',
    description: 'Refresh list of starred segments',
  },
  imperial: {
    short: 'i',
    name: 'imperial',
    description: 'Display distances in imperial units',
  },
  format: {
    short: 'f',
    name: 'format',
    params: '<format>',
    description: 'Output format',
    choices: ['table', 'csv', 'json', 'yaml', 'text', 'table', 'auto'],
    defVal: 'auto',
  },
  kml: {
    short: 'k',
    name: 'kml',
    params: '<filename>',
    description: 'Generate KML file for starred segments',
    argParser: (str: string) => {
      return _.isString(str) ? FS.File.cwd(str) : str;
    },
  },
  splitRegions: {
    short: 'r',
    name: 'split-regions',
    description: 'Organize activities into folders by region in KML output',
  },
} as const;
