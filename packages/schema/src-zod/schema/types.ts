import { z } from '@zod/zod';
import {
  type ActivityNameSchema,
  type FollowerStatusSchema,
  ResourceStateSchema,
  type SexSchema,
  type SportNameSchema,
  type StreamTypeSchema,
  type UnitSystemSchema,
} from './consts.ts';

/**
 * A unique identifier for a Strava object.
 *
 * Strava uses int64 (Long) values for IDs in their API specification, but in practice
 * these values are small enough to safely fit within JavaScript's Number.MAX_SAFE_INTEGER.
 */
export const StravaLongIntSchema: z.ZodNumber = z.number().int();

/** Strava ID type inferred from StravaLongIntSchema */
export type StravaLongInt = z.infer<typeof StravaLongIntSchema>;

/** Activity type inferred from ActivityNameSchema */
export type ActivityType = z.infer<typeof ActivityNameSchema>;

/** Follower status type inferred from FollowerStatusSchema */
export type FollowerStatusType = z.infer<typeof FollowerStatusSchema>;

/** Resource state type inferred from ResourceStateSchema */
export type ResourceStateType = z.infer<typeof ResourceStateSchema>;

/** Sex type inferred from SexSchema */
export type SexType = z.infer<typeof SexSchema>;

/** Sport type inferred from SportNameSchema */
export type SportType = z.infer<typeof SportNameSchema>;

/** Stream key type inferred from StreamTypeSchema */
export type StreamKeyType = z.infer<typeof StreamTypeSchema>;

/** Unit system type inferred from UnitSystemSchema */
export type UnitSystemType = z.infer<typeof UnitSystemSchema>;

/**
 * Zod schema for MetaAthlete.
 */
export const MetaAthleteSchema: z.ZodObject<
  { id: z.ZodNumber; resource_state: typeof ResourceStateSchema }
> = z.object({
  id: z.number().int(),
  resource_state: ResourceStateSchema,
});

/** MetaAthlete type inferred from MetaAthleteSchema */
export type MetaAthlete = z.infer<typeof MetaAthleteSchema>;

/**
 * Zod schema for MetaActivity.
 */
export const MetaActivitySchema: z.ZodObject<
  { id: z.ZodNumber; resource_state: typeof ResourceStateSchema }
> = z.object({
  id: z.number().int(),
  resource_state: ResourceStateSchema,
});

/** MetaActivity type inferred from MetaActivitySchema */
export type MetaActivity = z.infer<typeof MetaActivitySchema>;
