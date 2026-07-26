import type * as Schema from '@epdoc/strava-schema';

/**
 * Result of region detection for an activity.
 */
export type Result = {
  id: string;
  name: string;
};

export type Code = string;

/**
 * A rectangular boundary defined by min/max lat/lng.
 */
export type Rect = {
  minLat: Schema.Types.Latitude;
  maxLat: Schema.Types.Latitude;
  minLng: Schema.Types.Longitude;
  maxLng: Schema.Types.Longitude;
};

/**
 * A geographic region with one or more bounding rectangles.
 */
export type Def = {
  id: Code;
  name: string;
  skip: boolean;
  rectangles: Rect[];
};

export type File = {
  description: string;
  lastModified: string;
  regions: Def[];
};
