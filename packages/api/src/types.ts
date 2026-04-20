import type { EpochSeconds } from '@epdoc/duration';
import type * as FS from '@epdoc/fs/fs';
import type * as Schema from '@epdoc/strava-schema';
import type { Dict, Integer } from '@epdoc/type';

/** An authorization code obtained from the Strava OAuth2 flow. */
export type Code = string;
/** An access token for making API requests. */
export type AccessToken = string;
/** A refresh token for obtaining a new access token. */
export type RefreshToken = string;

/** A dictionary of query parameters. */
export type Query = Dict;
/** Data for a track point. */
export type TrackPoint = {
  lat: Schema.Types.Latitude;
  lng: Schema.Types.Longitude;
  altitude?: Schema.Types.Metres;
  /** Offset from start time */
  time?: Schema.Types.Seconds;
};

/** The client ID for a Strava application. */
export type ClientId = Integer;
/** The client secret for a Strava application. */
export type ClientSecret = string;

/** Strava application client credentials. */
export type ClientCreds = {
  id: ClientId;
  secret: ClientSecret;
};

/** Configuration for a Strava client application. */
export type ClientConfig = {
  description: string;
  client: ClientCreds;
};

/**
 * A source for Strava client credentials.
 *
 * This can be one of the following:
 * - An object containing the credentials directly.
 * - A file path to a JSON file containing the credentials.
 * - A boolean indicating that the credentials should be loaded from environment variables.
 */
export type ClientCredSrc =
  | { creds: ClientCreds }
  | { file: FS.File }
  | { path: FS.FilePath }
  | { env: true | { id: string; secret: string } };

/** Options for making an authenticated API request. */
export type Opts = ClientCreds & {
  token: AccessToken;
};

/** Options for generating a Strava authorization URL. */
export type AuthUrlOpts = {
  redirectUri?: string;
  scope?: string;
  state?: string;
  approvalPrompt?: string;
};

/** Options for retrieving activities. */
export type ActivityOpts = {
  athleteId: Schema.Athlete.Id;
  query: {
    after: EpochSeconds;
    before: EpochSeconds;
    per_page: number;
    page?: number;
  };
};

/**
 * Data for Strava API credentials.
 *
 * This is the data that is stored in the credentials file.
 */
export type StravaCredsData = {
  token_type?: string;
  expires_at: EpochSeconds;
  expires_in: EpochSeconds;
  refresh_token?: string;
  access_token?: string;
  athlete: {
    id?: Schema.Athlete.Id;
    username?: string;
    [key: string]: unknown;
  };
};

/**
 * A filter for activities.
 *
 * This can be used to filter a list of activities based on various criteria.
 */
export type ActivityFilter = {
  /** Whether to include only commute activities. */
  commuteOnly?: boolean;
  /** Whether to include only non-commute activities. */
  nonCommuteOnly?: boolean;
  /** An array of activity types to include. */
  include?: string[];
  /** An array of activity types to exclude. */
  exclude?: string[];
};

/** Data for a segment effort, as returned by the Strava API. */
export type SegmentData = Schema.Segment.DetailedEffort; // Changed to DetailedSegmentEffort
/** A segment effort. */
export type SegmentEffort = Schema.Segment.DetailedEffort;

export type StarredSegmentDict = Record<Schema.Segment.Id, string>;

// Re-export semantic unit types for convenience
export type {
  Kilometres,
  Latitude,
  Longitude,
  Metres,
  Seconds,
} from '@epdoc/strava-schema/types/units';

/** A geographical coordinate, represented as a [latitude, longitude] pair. */
export type LatLngPoint = [number, number];

/** A geographical rectangle defined by two corner points. */
export type LatLngRect = [LatLngPoint, LatLngPoint];
