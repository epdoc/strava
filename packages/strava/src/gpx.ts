import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { buildDateHelp, dateOptionDef } from '@epdoc/daterange';
import * as App from '@epdoc/strava-app';
import { Activity, Option, OutputTypes } from '@epdoc/strava-app';
import { BaseRootCmdClass, Ctx, TextBuilder } from '@epdoc/strava-core';
import { isAthleteId, type Types } from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
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
    this.option(Option.def.output).emit();
    this.option(Option.def.laps).emit();
    this.option(Option.def.noTracks).emit();
    this.option(Option.def.blackout).emit();
    this.option(Option.def.allowDups).emit();
    // Filters
    this.option(Option.def.commute).emit();
    this.option(Option.def.type).emit();
    this.option(Option.def.region).emit();
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
      const line = ctx.log.info.icheck().text('Filtered').value(preFilter)
        .iarrow(0xFFFFFF).count(activities.length).text('activity', 'activities')
        .text('using');
      if (_.isNonEmptyArray(filter.regions)) {
        line.label('regions:').value(filter.regions.join(', '));
      }
      if (_.isNonEmptyArray(filter.include)) {
        line.label('types:').value(filter.include);
      }
      if (filter.commuteOnly) line.value('commute only');
      if (filter.nonCommuteOnly) line.value('non-commute only');
      line.emit();
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
    const resolveOpts = { output: options.output, type: OutputTypes.Gpx };
    const outputPath = activities.resolveOutputFile(resolveOpts);
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
      await app.updateState(OutputTypes.Gpx, activities);
    }

    ctx.log.info.h2('GPX file generated successfully').emit();
  }

  helpText(): string {
    const b = new TextBuilder();
    b.newline();
    b.line.h1('GPX Generation');
    b.newline();
    b.line.text(
      'Generate GPX files from Strava activities, optimized for use in mapping software such as JOSM.',
    );
    b.newline();

    b.line.h2('Output Behavior:');
    b.line.label('  •').text('By default, all activities are combined into a single GPX file');
    b.line.label('  •').text('Default filename is based on date range (YYYYMMDD-YYYYMMDD.gpx)');
    b.line.label('  •').text('Files are saved to gpxFolder defined in user settings')
      .relative('~/.config/epdoc/strava/user.settings.json'),
      b.line.label('  •').text('Use --output to specify a custom filename or folder');
    b.newline();

    b.line.h2('Examples:');
    b.line.ibullet().text('Generate GPX for all activities in January 2024');
    b.line.label('  ').value('--date 202401');

    b.line.ibullet().text('Generate GPX with custom filename');
    b.line.label('  ').value('--date 20240101-20241231 --output 2024-rides.gpx');

    b.line.ibullet().text('Generate GPX for all 2024 Costa Rica activities');
    b.line.label('  ').value('--date 2024 --region CR');

    b.line.ibullet().text('Generate GPX also with lap waypoints, for rides only');
    b.line.label('  ').value('--date 20240101-20241231 --type Ride --laps');

    b.line.ibullet().text('Generate GPX with only lap waypoints (no tracks)');
    b.line.label('  ').value('--date 20240101-20241231 --laps --no-tracks');

    return b.toString();
  }
}
