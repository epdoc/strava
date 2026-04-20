/**
 * Core types and constants for Strava API.
 *
 * These are basic type aliases and enum constants used throughout the API.
 */

import type { Integer } from '@epdoc/type';
import type { EncodedPolyline, Seconds } from './units.ts';

// ============================================================================
// ID Types
// ============================================================================

/** A unique identifier for a Strava object (integer). */
export type StravaId = Integer;

/** Activity ID type */
export type ActivityId = Integer;

/** Athlete ID type */
export type AthleteId = Integer;

/** Segment ID type */
export type SegmentId = Integer;

// ============================================================================
// Enum Types
// ============================================================================

/** Activity type names as defined by the Strava API. */
export type ActivityType =
  | 'AlpineSki'
  | 'BackcountrySki'
  | 'Canoeing'
  | 'Crossfit'
  | 'EBikeRide'
  | 'Elliptical'
  | 'Hike'
  | 'IceSkate'
  | 'InlineSkate'
  | 'Kayaking'
  | 'Kitesurf'
  | 'NordicSki'
  | 'Ride'
  | 'RockClimbing'
  | 'RollerSki'
  | 'Rowing'
  | 'Run'
  | 'Snowboard'
  | 'Snowshoe'
  | 'StairStepper'
  | 'StandUpPaddling'
  | 'Surfing'
  | 'Swim'
  | 'VirtualRide'
  | 'Walk'
  | 'WeightTraining'
  | 'Windsurf'
  | 'Workout'
  | 'Yoga'
  | 'Handcycle'
  | 'Velomobile'
  | 'VirtualRun'
  | 'Wheelchair';

/** Activity type constants for use in code. */
export const ActivityName = {
  AlpineSki: 'AlpineSki',
  BackcountrySki: 'BackcountrySki',
  Canoeing: 'Canoeing',
  Crossfit: 'Crossfit',
  EBikeRide: 'EBikeRide',
  Elliptical: 'Elliptical',
  Hike: 'Hike',
  IceSkate: 'IceSkate',
  InlineSkate: 'InlineSkate',
  Kayaking: 'Kayaking',
  Kitesurf: 'Kitesurf',
  NordicSki: 'NordicSki',
  Ride: 'Ride',
  RockClimbing: 'RockClimbing',
  RollerSki: 'RollerSki',
  Rowing: 'Rowing',
  Run: 'Run',
  Snowboard: 'Snowboard',
  Snowshoe: 'Snowshoe',
  StairStepper: 'StairStepper',
  StandUpPaddling: 'StandUpPaddling',
  Surfing: 'Surfing',
  Swim: 'Swim',
  VirtualRide: 'VirtualRide',
  Walk: 'Walk',
  WeightTraining: 'WeightTraining',
  Windsurf: 'Windsurf',
  Workout: 'Workout',
  Yoga: 'Yoga',
  Handcycle: 'Handcycle',
  Velomobile: 'Velomobile',
  VirtualRun: 'VirtualRun',
  Wheelchair: 'Wheelchair',
} as const;

/** Activity zone types (heartrate, power). */
export type ActivityZoneType = 'heartrate' | 'power';

/** Follower status values. */
export type FollowerStatus = 'pending' | 'accepted' | 'blocked';

/** Resource state values: Meta = 1, Summary = 2, Detail = 3. */
export type ResourceState = 1 | 2 | 3;

/** Sex values. */
export type Sex = 'F' | 'M';

/** Sport names. */
export type SportType = 'cycling' | 'running' | 'triathlon' | 'other';

/** Stream key types. */
export type StreamType =
  | 'time'
  | 'distance'
  | 'latlng'
  | 'altitude'
  | 'velocity_smooth'
  | 'heartrate'
  | 'cadence'
  | 'watts'
  | 'temp'
  | 'moving'
  | 'grade_smooth';

/** Stream key constants for use in code. */
export const StreamKeys = {
  Time: 'time',
  Distance: 'distance',
  LatLng: 'latlng',
  Altitude: 'altitude',
  VelocitySmooth: 'velocity_smooth',
  Heartrate: 'heartrate',
  Cadence: 'cadence',
  Watts: 'watts',
  Temp: 'temp',
  Moving: 'moving',
  GradeSmooth: 'grade_smooth',
} as const;

/** Unit system values. */
export type UnitSystem = 'feet' | 'meters';

/** Stream resolution values. */
export type StreamResolution = 'low' | 'medium' | 'high';

/** Stream series type values. */
export type StreamSeriesType = 'distance' | 'time';

// ============================================================================
// Common Sub-types
// ============================================================================

/** Timed zone range with time spent in zone. */
export interface TimedZoneRange {
  min: number;
  max: number;
  time: Seconds;
}

/** Map data with polyline encoding. */
export interface PolylineMap {
  id: string;
  /** Full encoded polyline of the route */
  polyline: EncodedPolyline | null;
  /** Simplified encoded polyline for summary display */
  summary_polyline: EncodedPolyline;
  resource_state?: ResourceState;
}

/** Meta information for an athlete reference. */
export interface MetaAthlete {
  id: AthleteId;
  resource_state: ResourceState;
}

/** Meta information for an activity reference. */
export interface MetaActivity {
  id: ActivityId;
  resource_state: ResourceState;
}

/** Achievement earned during an activity. */
export interface Achievement {
  type?: string;
  /** Achievement rank (e.g., 1 for 1st place) */
  rank?: Integer;
}
