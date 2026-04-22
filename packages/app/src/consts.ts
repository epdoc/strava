import * as FS from '@epdoc/fs/fs';

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
