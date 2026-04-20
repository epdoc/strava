/**
 * Athlete types for Strava API.
 */

import type { Integer, WholeNumber } from '@epdoc/type';
import type { AthleteId, ResourceState, Sex, SportType, UnitSystem } from './core.ts';
import type { SummaryGear } from './gear.ts';
import type {
  CountryCode2,
  Email,
  ISODateTime,
  Kilograms,
  StateCode,
  Url,
  Watts,
} from './units.ts';

// Re-export AthleteId from core
export type { AthleteId } from './core.ts';

// ============================================================================
// Club Types
// ============================================================================

/** Club ID type */
export type ClubId = Integer;

/** Summary information about a club. */
export interface SummaryClub {
  id: ClubId;
  resource_state: ResourceState;
  name: string;
  profile_medium: string;
  cover_photo: string;
  cover_photo_small: string;
  sport_type: SportType;
  city: string;
  state: StateCode;
  country: CountryCode2;
  private: boolean;
  member_count: WholeNumber;
  featured: boolean;
  verified: boolean;
  url: Url;
}

// ============================================================================
// Athlete Main Types
// ============================================================================

/**
 * Summary athlete - basic athlete information.
 */
export interface SummaryAthlete {
  id: AthleteId;
  resource_state: ResourceState;
  firstname: string;
  lastname: string;
  profile_medium: Url;
  profile: Url;
  city: string;
  state: StateCode;
  country: CountryCode2;
  sex: Sex;
  summit: boolean;
  /** ISO 8601 datetime when athlete account was created */
  created_at: ISODateTime;
  /** ISO 8601 datetime when athlete data was last updated */
  updated_at: ISODateTime;
  /** Weight in kilograms */
  weight?: Kilograms;
  badge_type_id?: Integer;
}

/**
 * Detailed athlete - full athlete information.
 */
export interface DetailedAthlete extends SummaryAthlete {
  follower_count: WholeNumber;
  friend_count: WholeNumber;
  measurement_preference: UnitSystem;
  /** Functional Threshold Power in watts */
  ftp: Watts | null;
  clubs: SummaryClub[];
  bikes: SummaryGear[];
  shoes: SummaryGear[];
  email?: Email;
  athlete_type?: Integer;
}

// ============================================================================
// Comment Types
// ============================================================================

/** Comment ID type */
export type CommentId = Integer;

/** A comment on an activity. */
export interface Comment {
  id: CommentId;
  activity_id: Integer;
  text: string;
  athlete: SummaryAthlete;
  /** ISO 8601 datetime when comment was posted */
  created_at: ISODateTime;
}
