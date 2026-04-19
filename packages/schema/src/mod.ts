/**
 * @jpravetz/strava-schema
 *
 * Zod schemas and TypeScript types for the Strava API.
 *
 * This package provides runtime validation schemas (using Zod) and inferred TypeScript types
 * for all Strava API data structures. Use this package to validate API responses and ensure
 * type safety when working with Strava data.
 *
 * @example
 * ```typescript
 * import { SummaryActivitySchema, DetailedActivity } from '@jpravetz/strava-schema';
 *
 * // Validate unknown data from API
 * const result = SummaryActivitySchema.safeParse(apiResponse);
 * if (result.success) {
 *   const activity: DetailedActivity = result.data;
 * }
 * ```
 */

// Re-export all schema definitions
export * from './schema/mod.ts';
