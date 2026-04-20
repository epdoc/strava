/**
 * Athlete types for Strava API.
 */

import type { AthleteId, ResourceState, Sex, SportType, UnitSystem } from './core.ts';
import type { SummaryGear } from './gear.ts';

// Re-export AthleteId from core
export type { AthleteId } from './core.ts';

// ============================================================================
// Club Types
// ============================================================================

/** Summary information about a club. */
export interface SummaryClub {
  id: number;
  resource_state: ResourceState;
  name: string;
  profile_medium: string;
  cover_photo: string;
  cover_photo_small: string;
  sport_type: SportType;
  city: string;
  state: string;
  country: string;
  private: boolean;
  member_count: number;
  featured: boolean;
  verified: boolean;
  url: string;
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
  profile_medium: string;
  profile: string;
  city: string;
  state: string;
  country: string;
  sex: Sex;
  summit: boolean;
  created_at: string;
  updated_at: string;
  weight?: number;
  badge_type_id?: number;
}

/**
 * Detailed athlete - full athlete information.
 */
export interface DetailedAthlete extends SummaryAthlete {
  follower_count: number;
  friend_count: number;
  measurement_preference: UnitSystem;
  ftp: number | null;
  clubs: SummaryClub[];
  bikes: SummaryGear[];
  shoes: SummaryGear[];
  email?: string;
  athlete_type?: number;
}

// ============================================================================
// Comment Types
// ============================================================================

/** A comment on an activity. */
export interface Comment {
  id: number;
  activity_id: number;
  text: string;
  athlete: SummaryAthlete;
  created_at: string;
}
