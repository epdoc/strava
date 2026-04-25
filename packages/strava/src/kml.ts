import type * as CliApp from '@epdoc/cliapp';
import type { DateRanges } from '@epdoc/daterange';
import { buildDateHelp, dateOptionDef } from '@epdoc/daterange';
import * as FS from '@epdoc/fs/fs';
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

type KmlCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  output?: string;
  laps?: boolean;
  more?: boolean;
  efforts?: boolean;
  blackout?: boolean;
  allowDups?: boolean;
  imperial?: boolean;
  /** Filter based on activity type */
  type?: string[];
  /** Filter based on commute or non commute */
  commute?: 'yes' | 'no' | 'all';
  /** Filter based on region (ON,CR,BC,EU,MX) */
  region?: string[];
  /** Segments mode: true/false/'only'/'flat' */
  segments?: boolean | 'only' | 'flat';
  /** Split output into folders by region */
  splitRegions?: boolean;
};

export class KmlCommand extends BaseRootCmdClass<KmlCmdOptions> {
  override defineMetadata() {
    this.description = 'Generate KML files from Strava activities and segments';
    this.name = 'kml';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    const help = buildDateHelp(new Ctx.CustomMsgBuilder()).format();
    this.option({ ...dateOptionDef, help: help } as CliApp.OptionDef).emit();
    this.option(Option.def.output).emit();
    this.option(Option.def.laps).emit();
    this.option(Option.def.more).emit();
    this.option(Option.def.efforts).emit();
    this.option(Option.def.blackout).emit();
    this.option(Option.def.allowDups).emit();
    this.option(Option.def.segments).emit();
    this.option(Option.def.splitRegions).emit();
    // Filters
    this.option(Option.def.commute).emit();
    this.option(Option.def.type).emit();
    this.option(Option.def.region).emit();
    this.addHelpText(this.helpText());
  }

  override async execute(
    options: KmlCmdOptions,
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

    // Validate that we have something to output
    const segmentsMode = options.segments ?? false;
    const includeActivities = segmentsMode !== 'only';
    const includeSegments = segmentsMode === true || segmentsMode === 'only' ||
      segmentsMode === 'flat';

    if (!includeActivities && !includeSegments) {
      throw new Error(
        'Nothing to output. Specify --segments to include segments, or omit to output activities.',
      );
    }

    // Initialize app with Strava API and user settings
    const app = new App.Main(ctx);
    if (isAthleteId(options.athleteId)) {
      app.setAthleteId(options.athleteId);
    }
    ctx.app = app;
    await app.init({ strava: true, userSettings: true });

    ctx.log.info.h1('KML File Generator').emit();

    // Fetch segments if requested
    let segments: App.Segment.Data[] = [];
    if (includeSegments) {
      ctx.log.info.text('Fetching starred segments...').emit();
      segments = await app.getKmlSegments({
        date: options.date,
      });
      ctx.log.info.icheck().count(segments.length).text('starred segment', 'starred segments')
        .emit();
    }

    // Fetch activities if not segments-only mode
    let activities: Activity.Collection | undefined;
    if (includeActivities) {
      // Step 1: Fetch activities for the date range
      activities = new Activity.Collection(ctx);
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

      // Step 3: Compute regions for all activities (needed for splitRegions option)
      await activities.getRegions();

      // Step 4: Get detailed activity data if lap markers or more info is requested
      const needDetails = options.laps || options.more || options.efforts;
      if (needDetails && activities.length > 0) {
        await activities.getDetailsAndSegments({ detailed: true });
      }

      // Step 5: Get track points (GPS coordinates) from Strava
      // KML only needs lat/lng coordinates
      const streamTypes = App.Track.Handler.getStreamTypes('kml');
      await activities.getTrackPoints({
        streams: streamTypes,
        dedup: !options.allowDups,
        blackoutZones: options.blackout ? app.userSettings?.blackoutZones : undefined,
      });
    }

    // Step 6: Resolve the output file path
    const resolveOpts = { output: options.output, type: App.OutputTypes.Kml };
    const outputFile = activities?.resolveOutputFile(resolveOpts);

    if (!outputFile && includeActivities) {
      const err = new Error(
        'Output path could not be determined. Specify --output or set kmlFolder in user settings.',
      );
      ctx.log.error(err.message).emit();
      throw err;
    }

    // Use a default if only segments
    const outputPath = outputFile ?? new FS.File(options.output ?? 'Activities.kml');

    // Step 7: Generate the KML file using the Handler
    const handler = new App.Track.Handler(ctx, {
      activities: includeActivities,
      segments: segmentsMode === true || segmentsMode === 'flat' ? segmentsMode : false,
      laps: options.laps,
      more: options.more,
      efforts: options.efforts,
      imperial: options.imperial,
      splitRegions: options.splitRegions,
    });

    if (activities) {
      await handler.generate(outputPath, activities, segments);

      // Step 8: Update state file with the latest activity timestamp
      if (activities.length > 0) {
        await app.updateState(OutputTypes.Kml, activities);
      }
    } else if (includeSegments && segments.length > 0) {
      // Segments-only mode - generate KML with just segments
      await handler.outputData(outputPath.path as FS.FilePath, [], segments);
    } else {
      ctx.log.warn.warn('No activities or segments found for the specified criteria').emit();
      return;
    }

    ctx.log.info.h2('KML file generated successfully').emit();
  }

  helpText(): string {
    const b = new TextBuilder();
    b.newline();
    b.line.h1('KML Generation');
    b.newline();
    b.line.text(
      'Generate KML files from Strava activities and starred segments for viewing in Google Earth.',
    );
    b.newline();

    b.line.h2('Output Behavior:');
    b.line.label('  •').text('By default, activity routes are output as colored line strings');
    b.line.label('  •').text('Default filename is based on date range (YYYYMMDD-YYYYMMDD.kml)');
    b.line.label('  •').text('Files are saved to the  kmlFolder that is defined in')
      .relative('~/.config/epdoc/strava/user.settings.json'),
      b.line.label('  •').text('Use --output to specify a custom filename (relative to kmlFolder)');
    b.line.label('  •').text('Use --segments to include or output only starred segments');
    b.newline();

    b.line.h2('Activity Options:');
    b.line.ibullet().text('Generate KML for all activities in January 2024');
    b.line.label('  ').value('--date 202401');
    b.line.ibullet().text('Generate KML for 2024 with custom filename');
    b.line.label('  ').value('--date 2024 --output 2024-rides.kml');
    b.line.ibullet().text('Generate KML for Costa Rica activities only');
    b.line.label('  ').value('--date 20240101-20241231 --region CR');
    b.line.ibullet().text('Generate KML with lap markers for rides only');
    b.line.label('  ').value('--date 2024 --type Ride --laps');
    b.line.ibullet().text('Include detailed activity stats in descriptions');
    b.line.label('  ').value('--date 2024 --more');
    b.line.ibullet().text('Organize activities into folders by region');
    b.line.label('  ').value('--date 2025 --split-regions');

    b.line.h2('Segment Options:');
    b.line.ibullet().text('Include both activities and starred segments');
    b.line.label('  ').value('--date 202501 --segments');
    b.line.ibullet().text('Output only starred segments (no activities)');
    b.line.label('  ').value('--date 202501 --segments only');
    b.line.ibullet().text('Output segments in a flat folder structure (not by region)');
    b.line.label('  ').value('--date 202501 --segments flat');

    return b.toString();
  }
}
