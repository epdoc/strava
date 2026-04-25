import * as CliApp from '@epdoc/cliapp';
import { DateRanges } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import type * as FS from '@epdoc/fs/fs';
import type * as Log from '@epdoc/logger';

export type OutputFormat = 'auto' | 'json' | 'yaml' | 'table' | 'csv' | 'text';

/**
 * Custom message builder demonstrating extension of the base builder.
 *
 * Adds application-specific formatting methods for consistent logging.
 */
export class CustomMsgBuilder extends CliApp.Progress.MsgBuilder {
  /**
   * Creates a CustomMsgBuilder instance.
   *
   * @remarks
   * This constructor is normally called by the @epdoc/cliapp library with a
   * fully-configured ProgressEmitter. However, for standalone usage (e.g., building
   * help text without a logger), the emitter parameter can be omitted. In that case,
   * progress indicator methods (start, update, complete) will not function, but all
   * formatting methods from Console.Builder (h1, h2, label, value, etc.) work normally.
   *
   * @param emitter - The progress emitter from the logger (optional for standalone use)
   */
  constructor(emitter?: CliApp.Progress.ProgressEmitter) {
    // Provide a minimal mock emitter for standalone usage
    const actualEmitter = emitter ??
      CliApp.Progress.createStandaloneProgressEmitter();
    super(actualEmitter);
  }

  fs(file: FS.File | FS.Folder): this {
    this.relative(file.path);
    return this;
  }

  activity(activity: object | undefined): this {
    if (activity) {
      this.value(activity.toString());
    } else {
      this.label('activity').value('undefined');
    }
    return this;
  }

  dateRange(dateRanges: DateRanges | undefined): this {
    if (dateRanges instanceof DateRanges) {
      dateRanges.ranges.forEach((range) => {
        const bBefore = (range.before instanceof DateTime) && range.before < DateTime.now() ? true : false;
        this.label(bBefore ? 'from' : 'after').date(
          range.after ? range.after.format('yyyy/MM/dd HH:mm:ss') : '2000',
        );
        if (bBefore) {
          this.label('to').date(range.before.format('yyyy/MM/dd HH:mm:ss'));
        }
      });
    }
    return this;
  }

  newline(): this {
    return this.plain('\n');
  }
  nl(): this {
    return this.plain('\n');
  }
}

export function msgBuilder(
  emitter?: CliApp.Progress.ProgressEmitter,
): CustomMsgBuilder {
  return new CustomMsgBuilder(emitter);
}

/**
 * Core context class for workspace management tools.
 *
 * Extends the cliapp AbstractBase with workspace-specific functionality.
 * This context is used across the @jpravetz/tools monorepo for CLI applications
 * that need to work with Deno workspaces and deno.json configurations.
 *
 * Features:
 * - Custom message builder with progress indicators
 * - Include/exclude pattern filtering for workspaces
 * - Root deno.json config management
 *
 * @example
 * ```typescript
 * const ctx = new Context(pkg);
 * await ctx.setupLogging({ pkg: 'my-app' });
 * ctx.include = ['@epdoc/*'];
 * ctx.exclude = ['*test*'];
 * ```
 */
export class Context extends CliApp.Ctx.AbstractBase {
  app: object | undefined;
  /** Are we online or offline (need to review if we've implemented this correctly) */
  online = true;
  /** Set to true for imperial units */
  imperial = false;
  /** Some commands support output in different formats (eg. JSON) */
  format: OutputFormat = 'auto';

  protected override builderClass = CustomMsgBuilder;

  constructor(
    pkg: CliApp.DenoPkg | Context,
    params: Log.IGetChildParams = {},
  ) {
    super(pkg, params);
    if (pkg instanceof Context) {
      this.copyProperties(pkg);
    }
  }
}
