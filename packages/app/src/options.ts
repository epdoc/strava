import type * as CliApp from '@epdoc/cliapp';
import { Ctx } from '@epdoc/strava-core';
import { Types } from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import type * as Region from './activity/region.ts';

// const regionChoices: Region.Code[] = await Region.db.choices();

export const def: CliApp.OptionDefMap = {
  commute: {
    name: 'commute',
    params: '<choice>',
    description: 'Filter by commute',
    choices: ['yes', 'no', 'all'],
    defVal: 'all',
  },
  type: {
    short: 't',
    name: 'type',
    params: '[types]',
    description:
      'Filter by activity type (default when no flags specified). Optional: comma-separated activity types (e.g., Ride,Run,Hike)',
    argParser: (str: string | boolean): Types.ActivityType[] => {
      if (str === true || str === '') return []; // All activities
      if (_.isNonEmptyString(str)) {
        const validValues = Object.keys(Types.ActivityName);
        const vals = str.split(',').map((s) => s.trim() as Types.ActivityType);
        const invalid: string[] = [];
        for (const val of vals) {
          if (!validValues.includes(val)) invalid.push(val);
        }
        if (invalid.length) {
          throw new Error('Invalid activity type(s): ' + invalid.join(', '));
        }
      }
      return [];
    },
  },
  region: {
    name: 'region',
    params: '<code>',
    description: 'Filter by region (e.g., "CR" for Costa Rica, "EU" for Europe, "ON" for Ontario)',
    argParser: (str: string | boolean): Region.Code[] | undefined => {
      if (_.isNonEmptyString(str)) {
        return str.split(',').map((s) => s.toUpperCase());
      }
      return undefined;
    },
  },
  output: {
    short: 'o',
    description: 'Output filename (default location is set in user settings).',
    name: 'output',
    params: '[filename]',
    argParser: (str: string) => {
      return str;
    },
    help: () => {
      const msg = new Ctx.CustomMsgBuilder();
      msg.h2('GPX Output Options\n');
      msg.text('Specify the output file or folder for generated GPX files.\n\n');

      msg.h2('Default Behavior:\n');
      msg.label('  •').text('Files are saved to the').value('gpxFolder')
        .text('from your user settings\n');
      msg.label('  •').text('Default filename is auto-generated from the activity date range\n');
      msg.label('  •').text('Format:').value('YYYYMMDD-YYYYMMDD.gpx').text('\n\n');

      msg.h2('Usage Patterns:\n');
      msg.label('  --output rides.gpx').text('\n');
      msg.label('      ').text('Save to').value('gpxFolder/rides.gpx').text('\n\n');

      msg.label('  --output ./exports/').text('\n');
      msg.label('      ').text('Save to').value('./exports/YYYYMMDD-YYYYMMDD.gpx').text('\n');
      msg.label('      ').text('(folder must exist)').text('\n\n');

      msg.label('  --output ./exports/trip.gpx').text('\n');
      msg.label('      ').text('Save to').value('./exports/trip.gpx').text('\n');
      msg.label('      ').text('(full path with .gpx extension)').text('\n\n');

      msg.h2('Notes:\n');
      msg.label('  •').text('If the path ends with').value('.gpx')
        .text('then it is treated as a filename\n');
      msg.label('  •').text('If the path is an existing folder, a default filename is generated\n');
      msg.label('  •').text('Relative paths are resolved from the current working directory\n');

      return msg.format();
    },
  },
  segments: {
    short: 's',
    name: 'segments',
    params: '[mode]',
    description: 'Include starred segments. Modes: "only", "flat"',
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
  format: {
    name: 'format',
    params: '<format>',
    description: 'Some commands support different output formats (e.g., json)',
    choices: ['json', 'auto'],
  },
  imperial: {
    name: 'imperial',
    description: 'Use imperial units (miles, feet)',
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
    description:
      'Include activity stats + starred segment efforts in descriptions (superset of --more)',
  },
  allowDups: {
    name: 'allow-dups',
    description: 'allow duplicate intermediate track points instead of filtering them out',
  },
  splitRegions: {
    short: 'r',
    name: 'split-regions',
    description: 'Organize activities into folders by region in KML output',
  },
};

/*
const _unused = {
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
};
*/
