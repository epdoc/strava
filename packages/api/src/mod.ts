export { Activity } from './activity.ts';
export { Api } from './api.ts';
export { isValidCredData, StravaCreds as Creds } from './auth/creds.ts';
export * from './guards.ts';
export type * from './types.ts';

// Re-export StravaSchema for backward compatibility
export * as StravaSchema from '@epdoc/strava-schema';
