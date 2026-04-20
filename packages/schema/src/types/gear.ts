/**
 * Gear types for Strava API.
 */

import type { Integer } from '@epdoc/type';
import type { ResourceState } from './core.ts';
import type { Kilometres, Metres } from './units.ts';

// ============================================================================
// Gear IDs
// ============================================================================

/** Gear ID type (string identifier) */
export type GearId = string;

/** Bike frame type (1 = Mountain, 2 = Cross, 3 = Road, 4 = Time Trial) */
export type FrameType = Integer;

// ============================================================================
// Gear Main Types
// ============================================================================

/**
 * Detailed gear information.
 */
export interface DetailedGear {
  id: GearId;
  resource_state: ResourceState;
  primary: boolean;
  name: string;
  distance: Metres;
  brand_name: string;
  model_name: string;
  frame_type: FrameType;
  description: string;
  converted_distance?: Kilometres;
}

/**
 * Summary gear information.
 */
export interface SummaryGear {
  id: GearId;
  resource_state: ResourceState;
  primary: boolean;
  name: string;
  distance: Metres;
}
