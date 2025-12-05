import type { ISODate } from '@epdoc/datetime';
import type { DateRanges } from '@epdoc/daterange';
import { dateRanges } from '@epdoc/daterange';
import * as FS from '@epdoc/fs/fs';
import { _ } from '@epdoc/type';
import type * as Ctx from '../context.ts';
import type { Activity } from '../dep.ts';
import type * as State from './types.ts';

/**
 * Manages persistent state for tracking last update times for KML and PDF generation.
 *
 * This class handles reading, writing, and updating the user state file that tracks
 * when activities were last processed. This allows users to run commands without
 * specifying date ranges, automatically fetching only new activities since the last run.
 *
 * @example
 * ```ts
 * const stateFile = new StateFile(new FS.File(statePath));
 * await stateFile.load(ctx);
 *
 * // Get date range for new activities
 * const dateRange = stateFile.getDateRangeFrom('kml');
 *
 * // After processing, update with latest activity
 * await stateFile.updateLastUpdated(ctx, 'kml', activities);
 * ```
 */
export class StateFile {
  #file: FS.File;
  #state: State.UserState = {};

  /**
   * Creates a new StateFile instance.
   *
   * @param file File instance pointing to the state file location
   */
  constructor(file: FS.File) {
    this.#file = file;
  }

  /**
   * Loads the state from the file.
   *
   * If the file doesn't exist or is invalid, initializes with an empty state.
   * This method is safe to call even if the file has never been created.
   *
   * @param ctx Application context for logging
   */
  async load(ctx: Ctx.Context): Promise<void> {
    try {
      if (await this.#file.exists()) {
        const rawState = await this.#file.readJson();
        if (_.isDict(rawState)) {
          this.#state = rawState as State.UserState;
          ctx.log.debug.text('Loaded state file').fs(this.#file.path).emit();
        } else {
          ctx.log.debug.text('State file is invalid, initializing empty state').emit();
          this.#state = {};
        }
      } else {
        ctx.log.debug.text('State file does not exist, initializing empty state').emit();
        this.#state = {};
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      ctx.log.warn.text('Failed to load state file, using empty state').text(errorMsg).emit();
      this.#state = {};
    }
  }

  /**
   * Saves the current state to the file.
   *
   * @param ctx Application context for logging
   */
  async save(ctx: Ctx.Context): Promise<void> {
    try {
      const writer = await this.#file.writer();
      try {
        const content = JSON.stringify(this.#state, null, 2);
        await writer.write(content);
        await writer.close();
        ctx.log.debug.text('Saved state file').fs(this.#file.path).emit();
      } catch (err) {
        await writer.close();
        throw err;
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      ctx.log.error.error(`Failed to save state file: ${errorMsg}`).emit();
      throw err;
    }
  }

  /**
   * Gets the last updated timestamp for a specific output type.
   *
   * @param type Output type ('kml' or 'pdf')
   * @returns ISO date string of last update, or undefined if never updated
   */
  getLastUpdated(type: State.OutputType): ISODate | undefined {
    return this.#state[type]?.lastUpdated;
  }

  /**
   * Creates a DateRanges object starting from the last updated date for the given output type.
   *
   * If no last updated date exists, returns undefined. The date range will be from
   * the last updated date (exclusive) to now (inclusive), which means it will fetch
   * all activities that occurred after the last update.
   *
   * @param type Output type ('kml' or 'pdf')
   * @returns DateRanges object for fetching new activities, or undefined if no last update exists
   *
   * @example
   * ```ts
   * // If state.kml.lastUpdated is "2024-12-01T10:00:00Z"
   * const ranges = stateFile.getDateRangeFrom('kml');
   * // Returns DateRanges from 2024-12-01T10:00:00Z to now
   * ```
   */
  getDateRangeFrom(type: State.OutputType): DateRanges | undefined {
    const lastUpdated = this.getLastUpdated(type);
    if (!lastUpdated) {
      return undefined;
    }

    // Create date range from last updated to now
    // Format: "YYYYMMDD-" means from that date to now
    const fromDate = new Date(lastUpdated);
    const dateStr = fromDate.toISOString().split('T')[0].replace(/-/g, '');
    return dateRanges(`${dateStr}-`);
  }

  /**
   * Updates the last updated timestamp based on the most recent activity in the list.
   *
   * Finds the activity with the latest `startDatetimeLocal` and stores that as the
   * new lastUpdated timestamp for the specified output type. This ensures the next
   * run will fetch activities after this point.
   *
   * **Important**: Uses `startDatetimeLocal` which represents the local time in the
   * activity's timezone. This is correct for both KML and PDF generation, as PDF
   * uses local dates for Julian date calculations.
   *
   * @param ctx Application context for logging
   * @param type Output type ('kml' or 'pdf')
   * @param activities Array of activities that were processed
   */
  async updateLastUpdated(
    ctx: Ctx.Context,
    type: State.OutputType,
    activities: Activity[],
  ): Promise<void> {
    if (activities.length === 0) {
      ctx.log.debug.text('No activities to update state from').emit();
      return;
    }

    // Find the most recent activity by startDatetimeLocal
    let mostRecent: Activity | undefined;
    for (const activity of activities) {
      if (!mostRecent || activity.startDatetimeLocal > mostRecent.startDatetimeLocal) {
        mostRecent = activity;
      }
    }

    if (mostRecent) {
      // Initialize the type object if it doesn't exist
      if (!this.#state[type]) {
        this.#state[type] = {};
      }

      // Update the lastUpdated timestamp
      this.#state[type]!.lastUpdated = mostRecent.startDatetimeLocal;

      ctx.log.info.text('Updated').value(type).text('last updated to')
        .value(mostRecent.startDatetimeLocal).emit();

      // Save the updated state
      await this.save(ctx);
    }
  }

  /**
   * Gets the current state object (for testing/debugging).
   *
   * @returns The current user state
   */
  get state(): State.UserState {
    return this.#state;
  }
}
