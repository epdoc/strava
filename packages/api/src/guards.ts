import { _ } from '@epdoc/type';
import * as StravaSchema from '@epdoc/strava-schema';

/**
 * Type guard to check if a value is a valid StravaId.
 *
 * StravaIds are JavaScript integers. While Strava's API uses int64 (Long) values,
 * in practice these values are small enough to fit within JavaScript's Number.MAX_SAFE_INTEGER.
 */
export function isStravaId(value: unknown): value is StravaSchema.Types.StravaLongInt {
  return _.isInteger(value);
}

export function isAthleteId(value: unknown): value is StravaSchema.Athlete.IdType {
  return _.isInteger(value);
}

export function isSegmentId(value: unknown): value is StravaSchema.Segment.IdType {
  return _.isInteger(value);
}

/**
 * Type guard to check if a value is a valid Stream object.
 *
 * A Stream has a type property and a data array.
 * Note: When key_by_type is used in Strava API, the type field may be omitted
 * (it's implicit from the object key), so we only require the data array.
 */
export function isStream(value: unknown): value is StravaSchema.Stream.DataType | StravaSchema.Stream.LatLngType {
  return _.isDict(value) &&
    'data' in value &&
    _.isArray(value.data);
}

/**
 * Type guard to check if a value is an array of Stream objects.
 *
 * This is the format returned when key_by_type parameter is empty/false.
 */
export function isStreamArray(value: unknown): value is (StravaSchema.Stream.DataType | StravaSchema.Stream.LatLngType)[] {
  return _.isArray(value) && value.every(isStream);
}

/**
 * Type guard to check if a value is a StreamSet object.
 *
 * This is the format returned when key_by_type=true.
 */
export function isStreamSet(value: unknown): value is Partial<StravaSchema.Stream.SetType> {
  return _.isDict(value) &&
    Object.values(value).every((stream) => isStream(stream));
}

/**
 * Type guard to check if a StreamSet has valid latlng data.
 *
 * Checks if the StreamSet has a latlng property with a data array.
 */
export function hasLatLngData(
  value: Partial<StravaSchema.Stream.SetType>,
): value is StravaSchema.Stream.SetType & { latlng: StravaSchema.Stream.LatLngType } {
  return _.isDict(value.latlng) && _.isArray(value.latlng.data);
}

/**
 * Type guard to check if a value is a SummarySegment.
 *
 * IDs are validated as StravaId (JavaScript integers) per Strava API Long type specification.
 */
export function isSummarySegment(value: unknown): value is StravaSchema.Segment.SummaryType {
  return _.isDict(value) &&
    isStravaId(value.id) &&
    _.isString(value.name) &&
    _.isNumber(value.distance);
}

/**
 * Type guard to check if a value is an array of SummarySegment objects.
 */
export function isSummarySegmentArray(value: unknown): value is StravaSchema.Segment.SummaryType[] {
  return _.isArray(value) && value.every((item) => isSummarySegment(item));
}

/**
 * Type guard to check if a value is an array of DetailedSegmentEffort objects.
 */
export function isSegmentEffortArray(value: unknown): value is StravaSchema.Segment.DetailedEffortType[] {
  return _.isArray(value);
}

/**
 * Type guard to check if a value is a DetailedAthlete.
 *
 * IDs are validated as StravaId (JavaScript integers) per Strava API Long type specification.
 */
export function isDetailedAthlete(value: unknown): value is StravaSchema.Athlete.DetailedType {
  return _.isDict(value) &&
    isStravaId(value.id) &&
    _.isString(value.firstname) &&
    _.isString(value.lastname);
}

/**
 * Type guard to check if a value is a SummaryActivity.
 *
 * IDs are validated as StravaId (JavaScript integers) per Strava API Long type specification.
 */
export function isSummaryActivity(value: unknown): value is StravaSchema.Activity.SummaryType {
  return _.isDict(value) &&
    isStravaId(value.id) &&
    _.isString(value.name);
}

/**
 * Type guard to check if a value is an array of SummaryActivity objects.
 */
export function isSummaryActivityArray(value: unknown): value is StravaSchema.Activity.SummaryType[] {
  return _.isArray(value) && value.every((item) => isSummaryActivity(item));
}

/**
 * Type guard to check if a value is a DetailedActivity.
 *
 * IDs are validated as StravaId (JavaScript integers) per Strava API Long type specification.
 */
export function isDetailedActivity(value: unknown): value is StravaSchema.Activity.DetailedType {
  return _.isDict(value) &&
    isStravaId(value.id) &&
    _.isString(value.name) &&
    _.isNumber(value.distance);
}

// Create a Set for O(1) lookups in the type guard
const ACTIVITY_NAMES_SET = new Set(Object.values(StravaSchema.Consts.ActivityName));

export function isActivityType(value: unknown): value is StravaSchema.Consts.ActivityType {
  return typeof value === 'string' && ACTIVITY_NAMES_SET.has(value as StravaSchema.Consts.ActivityType);
}

export function isActivityTypeArray(value: unknown): value is StravaSchema.Consts.ActivityType[] {
  return Array.isArray(value) && value.every(isActivityType);
}
