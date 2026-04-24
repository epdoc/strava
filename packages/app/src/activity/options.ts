import type * as CliApp from '@epdoc/cliapp';
import { Ctx } from '@epdoc/strava-core';
import { Types } from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import type * as Region from './region.ts';

// const regionChoices: Region.Code[] = await Region.db.choices();

export const optionDefs: CliApp.OptionDefMap = {
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
};
