/**
 * Gear types for Strava API.
 */

import type { ResourceState } from './core.ts';

// ============================================================================
// Gear IDs
// ============================================================================

/** Gear ID type (string identifier) */
export type GearId = string;

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
  distance: number;
  brand_name: string;
  model_name: string;
  frame_type: number;
  description: string;
  converted_distance?: number;
}

/**
 * Summary gear information.
 */
export interface SummaryGear {
  id: GearId;
  resource_state: ResourceState;
  primary: boolean;
  name: string;
  distance: number;
}
