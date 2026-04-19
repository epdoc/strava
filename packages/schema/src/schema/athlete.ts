import { z } from 'zod';
import { ResourceStateSchema, SexSchema, SportNameSchema, UnitSystemSchema } from './consts.ts';
import { StravaLongIntSchema } from './types.ts';
import { SummaryGearSchema } from './gear.ts';

/**
 * Zod schema for AthleteId.
 */
export const AthleteIdSchema = StravaLongIntSchema;

/** AthleteId type inferred from AthleteIdSchema */
export type AthleteId = z.infer<typeof AthleteIdSchema>;

/**
 * Zod schema for SummaryClub.
 */
export const SummaryClubSchema = z.object({
  id: StravaLongIntSchema,
  resource_state: ResourceStateSchema,
  name: z.string(),
  profile_medium: z.string(),
  cover_photo: z.string(),
  cover_photo_small: z.string(),
  sport_type: SportNameSchema,
  city: z.string(),
  state: z.string(),
  country: z.string(),
  private: z.boolean(),
  member_count: z.number(),
  featured: z.boolean(),
  verified: z.boolean(),
  url: z.string(),
});

/** SummaryClub type inferred from SummaryClubSchema */
export type SummaryClub = z.infer<typeof SummaryClubSchema>;

/**
 * Zod schema for SummaryAthlete.
 */
export const SummaryAthleteSchema = z.object({
  id: AthleteIdSchema,
  resource_state: ResourceStateSchema,
  firstname: z.string(),
  lastname: z.string(),
  profile_medium: z.string(),
  profile: z.string(),
  city: z.string(),
  state: z.string(),
  country: z.string(),
  sex: SexSchema,
  summit: z.boolean(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  weight: z.number().optional(),
  badge_type_id: z.number().optional(),
});

/** SummaryAthlete type inferred from SummaryAthleteSchema */
export type SummaryAthlete = z.infer<typeof SummaryAthleteSchema>;

/**
 * Zod schema for DetailedAthlete.
 */
export const DetailedAthleteSchema = SummaryAthleteSchema.extend({
  follower_count: z.number(),
  friend_count: z.number(),
  measurement_preference: UnitSystemSchema,
  ftp: z.number().nullable(),
  clubs: z.array(SummaryClubSchema),
  bikes: z.array(SummaryGearSchema),
  shoes: z.array(SummaryGearSchema),
  email: z.string().optional(),
  athlete_type: z.number().optional(),
});

/** DetailedAthlete type inferred from DetailedAthleteSchema */
export type DetailedAthlete = z.infer<typeof DetailedAthleteSchema>;

/**
 * Zod schema for Comment.
 */
export const CommentSchema = z.object({
  id: StravaLongIntSchema,
  activity_id: StravaLongIntSchema,
  text: z.string(),
  athlete: SummaryAthleteSchema,
  created_at: z.string().datetime(),
});

/** Comment type inferred from CommentSchema */
export type Comment = z.infer<typeof CommentSchema>;
