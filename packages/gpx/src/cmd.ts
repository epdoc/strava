import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { buildDateHelp, dateOptionDef } from '@epdoc/daterange';
import * as App from '@epdoc/strava-app';
import { Activity } from '@epdoc/strava-app';
import { BaseRootCmdClass, Ctx, Options } from '@epdoc/strava-core';
import { isAthleteId, type Types } from '@epdoc/strava-schema';
import { assert } from '@std/assert/assert';

const REG = {
  commuteOnly: new RegExp(/^(yes)$/i),
  nonCommuteOnly: new RegExp(/^(no)$/i),
};

type GpxCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  output?: string;
  laps?: boolean;
  noTracks?: boolean;
  blackout?: boolean;
  allowDups?: boolean;
  imperial?: boolean;
  /** Filter based on activity type */
  type?: string[];
  /** Filter based on commute or non commute */
  commute?: 'yes' | 'no' | 'all';
  /** Filter based on region (ON,CR,BC,EU,MX) */
  region?: string[];
};

export class GpxCommand extends BaseRootCmdClass<GpxCmdOptions> {
  override defineMetadata() {
    this.description = 'Generate GPX files from Strava activities';
    this.name = 'gpx';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    const help = buildDateHelp(new Ctx.CustomMsgBuilder()).format();
    this.option({ ...dateOptionDef, help: help } as CliApp.OptionDef).emit();
    this.option(Activity.optionDefs.output).emit();
    this.option(Options.optionDefs.laps).emit();
    this.option(Options.optionDefs.noTracks).emit();
    this.option(Options.optionDefs.blackout).emit();
    this.option(Options.optionDefs.allowDups).emit();
    // Filters
    this.option(Activity.optionDefs.commute).emit();
    this.option(Activity.optionDefs.type).emit();
    this.option(Activity.optionDefs.region).emit();
    this.addHelpText(this.helpText());
  }

  override async execute(
    options: GpxCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    const ctx = this.activeContext();
    assert(ctx);

    // Validate required options
    if (!options.date || !options.date.hasRanges()) {
      throw new Error(
        '--date is required. Specify date range(s) (e.g., 20240101-20241231)',
      );
    }

    // Initialize app with Strava API and user settings
    const app = new App.Main(ctx);
    if (isAthleteId(options.athleteId)) {
      app.setAthleteId(options.athleteId);
    }
    ctx.app = app;
    await app.init({ strava: true, userSettings: true });

    ctx.log.info.h1('GPX File Generator').emit();

    // Step 1: Fetch activities for the date range
    const activities = new Activity.Collection(ctx);
    await activities.getForDateRange(options.date);

    // Step 2: Apply filters (commute, type, region)
    const filter: Activity.FilterOpts = {
      commuteOnly: REG.commuteOnly.test(options.commute || 'all'),
      nonCommuteOnly: REG.nonCommuteOnly.test(options.commute || 'all'),
      include: options.type ? options.type as Types.ActivityType[] : undefined,
      regions: options.region ? options.region as Activity.Region.Code[] : undefined,
    };
    const preFilter = activities.length;
    await activities.filter(filter);
    if (activities.length !== preFilter) {
      ctx.log.info.icheck().text('Filtered activities from').value(preFilter).text('to')
        .value(activities.length).emit();
    }

    // Step 3: Get detailed activity data if lap waypoints are requested
    if (options.laps) {
      await activities.getDetailsAndSegments({ detailed: true });
    }

    // Step 4: Get track points (GPS coordinates) from Strava
    // Ask the Handler what stream types GPX format needs
    const streamTypes = App.Track.Handler.getStreamTypes('gpx');
    await activities.getTrackPoints({
      streams: streamTypes,
      dedup: !options.allowDups,
      blackoutZones: options.blackout ? app.userSettings?.blackoutZones : undefined,
    });

    // Step 5: Resolve the output file path
    const outputPath = activities.resolveOutputFile({ output: options.output, type: 'gpx' });
    if (!outputPath) {
      const err = new Error(
        'Output path could not be determined. Specify --output or set gpxFolder in user settings.',
      );
      ctx.log.error(err.message).emit();
      throw err;
    }

    // Step 6: Generate the GPX file using the Handler
    const handler = new App.Track.Handler(ctx, {
      laps: options.laps,
      noTracks: options.noTracks,
      imperial: options.imperial,
    });
    await handler.generate(outputPath, activities);

    // Step 7: Update state file with the latest activity timestamp
    if (activities.length > 0) {
      await app.updateState('gpx', activities.activities);
    }

    ctx.log.info.h2('GPX file generated successfully').emit();
  }

  helpText(): string {
    const msg = new Ctx.CustomMsgBuilder();
    msg.h1('\nGPX Generation\n');
    msg.text(
      'Generate GPX files from Strava activities for use in GPS devices and mapping software.\n\n',
    );

    msg.h2('Output Behavior:\n');
    msg.label('  •').text('By default, all activities are combined into a single GPX file\n');
    msg.label('  •').text('Default filename is based on date range (YYYYMMDD-YYYYMMDD.gpx)\n');
    msg.label('  •').text(
      'Files are saved to gpxFolder from user settings (~/.strava/user.settings.json)\n',
    );
    msg.label('  •').text('Use --output to specify a custom filename (relative to gpxFolder)\n\n');

    msg.h2('Examples:\n');
    msg.label('  ').value('--date 20240101-20240131\n');
    msg.text('      Generate GPX for all activities in January 2024\n\n');
    msg.label('  ').value('--date 20240101-20241231 --output 2024-rides.gpx\n');
    msg.text('      Generate GPX with custom filename\n\n');
    msg.label('  ').value('--date 20240101-20241231 --region CR\n');
    msg.text('      Generate GPX for Costa Rica activities only\n\n');
    msg.label('  ').value('--date 20240101-20241231 --type Ride --laps\n');
    msg.text('      Generate GPX with lap waypoints for rides only\n\n');
    msg.label('  ').value('--date 20240101-20241231 --laps --no-tracks\n');
    msg.text('      Generate GPX with only lap waypoints (no tracks)\n');

    return msg.format();
  }
}
