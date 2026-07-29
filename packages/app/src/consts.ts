import * as FS from '@epdoc/fs/fs';

/**
 * Application configuration providing file paths for all user-level and
 * client-level configuration files stored under `~/.config/epdoc/strava/`.
 *
 * Paths reference JSON files for Strava API credentials, user settings,
 * starred segment cache, region definitions, and persistent state.
 */
export default {
  'description': 'Bootstrap configuration',
  'paths': {
    'clientCreds': FS.File.config('epdoc', 'strava', 'client.creds.json'),
    'userSegments': FS.File.config('epdoc', 'strava', 'user.segments.json'),
    'userSettings': FS.File.config('epdoc', 'strava', 'user.settings.json'),
    'userRegions': FS.File.config('epdoc', 'strava', 'user.regions.json'),
    'userCreds': FS.File.config('epdoc', 'strava', 'user.creds.json'),
    'userState': FS.File.config('epdoc', 'strava', 'user.state.json'),
  },
};
