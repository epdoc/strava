import { DateTime } from '@epdoc/datetime';
import type { FileSpec } from '@epdoc/fs';
import type { Ctx } from '@epdoc/strava-core';
import type * as Schema from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import { BaseClass } from '../base.ts';
import type * as Segment from './types.ts';
import { asCacheEntry } from './utils.ts';

/**
 * Manages the cache of starred segments stored in ~/.strava/user.segments.json
 *
 * This class handles:
 * - Loading/saving segment metadata from/to local cache
 * - Refreshing segment data from Strava API
 * - Providing fast lookup by segment ID
 * - The cache does NOT include the segment coordinates, which must be retrieved each time they are needed.
 *
 * The cache reduces API calls by storing segment metadata locally and only
 * fetching fresh data when explicitly refreshed or when the cache doesn't exist.
 */
export class SegmentFile extends BaseClass {
  #fsFile: FileSpec;
  #segments: Segment.CacheMap = new Map(); // Keyed by segment ID

  constructor(ctx: Ctx.Context, fsFile: FileSpec) {
    super(ctx);
    this.#fsFile = fsFile;
  }

  get segments(): Segment.CacheMap {
    return this.#segments;
  }

  async get(opts: { refresh?: boolean }): Promise<void> {
    try {
      if (opts.refresh) {
        await this.#getFromServer();
        await this.write();
      } else {
        await this.read();
      }
    } catch (err) {
      this.log.info.h2(`Error reading starred segments from ${this.#fsFile.path}`).ewt(
        this.log.mark(),
      );
      this.log.info.h2('    ' + (err as Error).message).ewt(this.log.mark());
      await this.#getFromServer();
      await this.write();
    }
  }

  async #getFromServer(): Promise<void> {
    // this.starredSegments = [];
    const summarySegments: Schema.Segment.Summary[] = [];
    this.log.info.h2('Retrieving Strava starred segments from server ...').emit();
    const m0 = this.log.mark();
    try {
      this.log.indent();
      await this.api.getStarredSegments(summarySegments);
      this.log.outdent();
      this.log.info.h2('Found').count(summarySegments.length).h2('starred segments').ewt(m0);
      this.#segments = new Map();
      summarySegments.forEach((seg) => {
        const newEntry = asCacheEntry(seg);
        if (newEntry) {
          if (this.#segments.has(newEntry.id)) {
            const oldEntry = this.#segments.get(newEntry.id);
            this.log.info.h2('Segment').label(seg.name)
              .h2(`ID ${seg.id} (${oldEntry!.distance},${oldEntry!.elevation}) already exists.`)
              .h2(`Overwriting with (${newEntry.distance},${newEntry.elevation}).`)
              .emit();
          }
          this.#segments.set(newEntry.id, newEntry);
        }
      });
    } catch (e) {
      const err = _.asError(e);
      err.message = 'Starred segments - ' + err.message;
      throw err;
    }
  }

  async read(): Promise<void> {
    this.log.info.text('Reading').text('Starred segments from').fs(this.#fsFile).start();
    const isFile = await this.#fsFile.isFile();
    if (isFile) {
      const data = await this.#fsFile.readJson<Segment.CacheFile>();
      if (data.segments) {
        // Convert string keys from JSON back to numbers
        this.#segments = new Map(
          Object.entries(data.segments).map(([key, value]) => [Number(key), value]),
        );
      }
      this.log.info.icheck().text('Using').count(this.#segments.size).h2('starred segment')
        .h2('from').fs(this.#fsFile).stop();
    } else {
      this.log.info.ierror().text('File not found').fs(this.#fsFile).stop();
    }
  }

  async write(): Promise<void> {
    this.log.info.text('Writing').count(this.#segments.size).text('starred segment')
      .text('to').fs(this.#fsFile).start();
    const json: Record<string, unknown> = {
      description: 'Strava segments',
      lastModified: new DateTime().setTz('local').toISOString(),
      segments: Object.fromEntries(this.#segments),
    };
    try {
      await this.#fsFile.writeJson(json, null, 2);
      this.log.info.icheck().text('Wrote').count(this.#segments.size).text('starred segments')
        .fs(this.#fsFile).stop();
    } catch (e) {
      const err = _.asError(e);
      this.log.error.ierror().text('Error writing to file').err(err).fs(this.#fsFile).stop();
    }
  }

  /**
   * Get a specific segment by ID.
   *
   * @param id Segment ID
   * @returns CacheEntry if found, undefined otherwise
   */
  getSegment(id: Schema.Segment.Id): Segment.CacheEntry | undefined {
    return this.#segments.get(id);
  }

  /**
   * Get all cached segments as an array.
   *
   * @returns Array of all cached segment entries
   */
  getAllSegments(): Segment.CacheEntry[] {
    return Array.from(this.#segments.values());
  }
}
