import * as CliApp from '@epdoc/cliapp';
import { buildDateHelp, dateOptionDef, DateRanges } from '@epdoc/daterange';
import * as App from '@epdoc/strava-app';
import { Activity, Option, OutputTypes } from '@epdoc/strava-app';
import { BaseRootCmdClass, Ctx, TextBuilder } from '@epdoc/strava-core';
import { isAthleteId } from '@epdoc/strava-schema';
import { assert } from '@std/assert/assert';

type PdfCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  output?: string;
  imperial?: boolean;
};

export class PdfCommand extends BaseRootCmdClass<PdfCmdOptions> {
  override defineMetadata() {
    this.description = 'Generate Adobe Acroforms XML files for bikelog PDF forms';
    this.name = 'pdf';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    const help = buildDateHelp(new Ctx.CustomMsgBuilder()).format();
    this.option({ ...dateOptionDef, help: help } as CliApp.OptionDef).emit();
    this.option(Option.def.output).emit();
    this.addHelpText(this.helpText());
  }

  override async execute(
    options: PdfCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    const ctx = this.activeContext();
    assert(ctx);

    // Initialize app with Strava API and user settings
    const app = new App.Main(ctx);
    if (isAthleteId(options.athleteId)) {
      app.setAthleteId(options.athleteId);
    }
    ctx.app = app;
    await app.init({ strava: true, userSettings: true, state: true });

    ctx.log.info.h1('Acroforms Generator').emit();

    // Get last updated timestamp for incremental updates
    const lastUpdated = app.getLastUpdated(OutputTypes.Acroforms);

    // Determine date ranges
    let dateRanges: DateRanges;
    if (options.date && options.date.hasRanges()) {
      dateRanges = options.date;
    } else if (lastUpdated) {
      dateRanges = DateRanges.fromJSON([{ after: lastUpdated }]);
      ctx.log.info.text('Retrieving activities since last update').value(lastUpdated).emit();
    } else {
      throw new CliApp.SilentError(
        '--date is required for first run. Specify date range(s) (e.g., 20240101-20241231)',
      );
    }

    // Ensure we have athlete info (for bike list)
    if (!app.athlete) {
      await app.getAthlete();
    }

    // Fetch activities for the date range
    const activities = new Activity.Collection(ctx);
    await activities.getForDateRange(dateRanges);

    // Resolve the output file path
    const resolveOpts = { output: options.output, type: OutputTypes.Acroforms };
    const outputPath = activities.resolveOutputFile(resolveOpts);
    if (!outputPath) {
      const err = new Error(
        'Output path could not be determined. Specify --output or set gpxFolder in user settings.',
      );
      ctx.log.error(err.message).emit();
      throw err;
    }

    if (activities.length === 0) {
      ctx.log.info.text('No activities found for the specified date range').emit();
      return;
    }

    // Get detailed activity data (needed for descriptions and private notes)
    await activities.getDetailsAndSegments({ detailed: true });

    // Build PDF options
    const pdfOpts: App.BikeLog.Opts = {
      output: outputPath,
      activities: activities,
    };

    // Generate the PDF/XML file
    await app.getPdf(pdfOpts, OutputTypes.Acroforms);
  }

  helpText(): string {
    const b = new TextBuilder();
    b.newline();
    b.line.h1('PDF/XML Form Data Generation');
    b.newline();
    b.line.text(
      'Generate Adobe Acroforms XML files from Strava activities for import into bikelog PDF forms.',
    );
    b.newline();

    b.line.h2('Output Behavior:');
    b.line.ibullet().text(
      'XML files can be imported into Adobe Acrobat to populate form fields',
    );
    b.line.ibullet().text('Default filename is set by acroformsFile in user settings')
      .relative('~/.config/epdoc/strava/user.settings.json'),
      b.line.ibullet().text(
        'Use --output to specify a custom filename (relative to current directory)',
      );
    b.newline();

    b.line.h2('Activity Data:');
    b.line.ibullet().text('Daily activity summaries (up to 2 bike rides per day tracked)');
    b.line.ibullet().text('Ride metrics: distance, bike name, elevation, moving time');
    b.line.ibullet().text('Activity descriptions and private notes merged and parsed');
    b.line.ibullet().text('Custom properties extracted from descriptions (key=value format)');
    b.line.ibullet().text('Weight data automatically extracted and placed in dedicated field');
    b.line.ibullet().text('Non-bike activities (Run, Swim, etc.) included in notes');
    b.newline();

    b.line.h2('Incremental Updates:');
    b.line.ibullet().text('After first run, subsequent runs fetch only on new activities');
    b.line.ibullet().text('Last update time is stored in ~/.strava/user.state.json');
    b.line.ibullet().text('Use --date to override and fetch specific date ranges');
    b.newline();

    b.line.h2('Examples:');
    b.line.ibullet().text('Generate XML for all activities in 2024');
    b.line.label('  ').value('--date 20240101-20241231');
    b.line.ibullet().text('Generate XML with custom filename');
    b.line.label('  ').value('--date 20240101-20241231 --output bikelog2024.xml');
    b.line.ibullet().text('Generate XML for activities in the last 7 days');
    b.line.label('  ').value('--date 7d-now');
    b.line.ibullet().text('Incremental update: fetch only activities since last run');
    b.line.label('  ').value('(no --date, after first run)');

    return b.toString();
  }
}
