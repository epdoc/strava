import { DateRanges } from '@epdoc/daterange';
import type * as BikeLog from '../../bikelog/mod.ts';
import type { Ctx } from '../dep.ts';
import * as Options from '../options/mod.ts';
import type * as Cmd from '../types.ts';

export const cmdConfig: Options.Config = {
  replace: { cmd: 'XML' },
  options: {
    output: true,
    date: true,
    // Note: imperial and dryRun are global options defined in root command
  },
};

type PdfCmdOpts = {
  date?: DateRanges;
  output?: string;
};

/**
 * Command to generate Adobe Acroforms XML files for bikelog PDF forms.
 *
 * This command creates XML files compatible with Adobe Acrobat PDF forms for logging
 * bike rides and activities. The XML output includes:
 * - Daily activity summaries (up to 2 bike rides per day tracked)
 * - Ride metrics: distance, bike name, elevation, moving time
 * - Activity descriptions and private notes merged and parsed
 * - Custom properties extracted from descriptions (key=value format)
 * - Weight data automatically extracted and placed in dedicated field
 * - Non-bike activities (Run, Swim, etc.) included in notes
 *
 * The generated XML can be imported into Adobe Acrobat to populate form fields
 * in a bikelog PDF template.
 *
 * @example
 * ```bash
 * # Generate bikelog XML for 2024
 * deno run -A ./packages/strava/main.ts pdf \
 *   --date 20240101-20241231 \
 *   --output bikelog2024.xml
 * ```
 */
export class PdfCmd extends Options.BaseSubCmd {
  constructor() {
    super('pdf', 'Generate XML data for Adobe Acrobat Forms bikelog from Strava activities.');
  }

  /**
   * Initializes the PDF command with its action handler and options.
   *
   * Sets up the command action that:
   * 1. Initializes app with Strava API and user settings
   * 2. Ensures athlete info is loaded (for bike list)
   * 3. Builds PDF options from command-line arguments
   * 4. Delegates to ctx.app.getPdf() for XML generation
   *
   * @param ctx Application context with logging and app instance
   * @returns Promise resolving to the configured command instance
   */
  init(ctx: Ctx.Context): Promise<Cmd.Command> {
    this.cmd.init(ctx).action(async (opts: PdfCmdOpts) => {
      try {
        // Initialize app with required services
        await ctx.app.init(ctx, { strava: true, userSettings: true, state: true });

        // Normalize to DateRanges: use command line if provided, otherwise create from state file
        let dateRanges: DateRanges;

        if (opts.date && opts.date.hasRanges()) {
          // Use command line date ranges as-is
          dateRanges = opts.date;
        } else {
          // Create DateRanges from state file's lastUpdated timestamp
          const lastUpdated = ctx.app.getLastUpdated('pdf');
          if (!lastUpdated) {
            ctx.log.error.error(
              '--date is required for first run. Specify date range(s) (e.g., 20240101-20241231)',
            )
              .emit();
            console.error(''); // blank line before help
            this.cmd.outputHelp();
            Deno.exit(1);
          }

          // Create a single range: from lastUpdated to now
          dateRanges = new DateRanges([{ after: new Date(lastUpdated) }]);
          ctx.log.info.text('Fetching activities since last update').value(lastUpdated).emit();
        }

        // Use default formsDataFile from user settings if --output not provided
        const outputPath = opts.output || ctx.app.userSettings?.formsDataFile;
        if (!outputPath) {
          ctx.log.error.error(
            '--output is required (or set formsDataFile in ~/.strava/user.settings.json). Specify output filename (e.g., -o bikelog.xml)',
          )
            .emit();
          console.error(''); // blank line before help
          this.cmd.outputHelp();
          Deno.exit(1);
        }

        // Ensure we have athlete info
        if (!ctx.app.athlete) {
          await ctx.app.getAthlete(ctx);
        }

        // Build PDF options from command opts
        const pdfOpts: BikeLog.Opts = {
          output: outputPath,
          date: dateRanges,
        };

        // Call app layer to generate PDF/XML
        await ctx.app.getPdf(ctx, pdfOpts, 'pdf');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        ctx.log.error.error(`Failed to generate PDF/XML: ${errorMsg}`).emit();
        throw err;
      }
    });

    this.addOptions(cmdConfig);
    return Promise.resolve(this.cmd);
  }
}
