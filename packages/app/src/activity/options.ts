import type * as CliApp from '@epdoc/cliapp';
import { Types } from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import type * as Region from './region.ts';

// const regionChoices: Region.Code[] = await Region.db.choices();

export const optionDefs: CliApp.OptionDefMap = {
  commute: {
    name: 'commute',
    params: '<choice>',
    description: 'Filter by commute: yes|no|all (default: all)',
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
};
