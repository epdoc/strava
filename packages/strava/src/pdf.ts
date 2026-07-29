import * as CliApp from '@epdoc/cliapp';
import { style } from '@epdoc/cliapp';
import { buildDateHelp, dateOptionDef, DateRanges } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import * as FS from '@epdoc/fs/fs';
import { TextBuilder } from '@epdoc/msgbuilder';
import * as App from '@epdoc/strava-app';
import { Activity, OutputTypes } from '@epdoc/strava-app';
import { BaseRootCmdClass, Ctx } from '@epdoc/strava-core';
import { isAthleteId } from '@epdoc/strava-schema';
import { _ } from '@epdoc/type';
import { assert } from '@std/assert/assert';

type PdfCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
  date: DateRanges;
  pdf?: string;
  overwrite?: boolean;
  imperial?: boolean;
  total?: boolean;
  totalOnly?: boolean;
};

export class PdfCommand extends BaseRootCmdClass<PdfCmdOptions> {
  override defineMetadata() {
    this.description = 'Fill form fields of an existing Bikelog PDF with Strava activity data';
    this.name = 'pdf';
  }

  override defineOptions(): void {
    this.option(
      '-t, --total',
      'Also compute total distances for the year and display on the cover page',
    ).emit();
    this.option(
      '-T, --total-only',
      'Do not fetch new Strava activites - only compute and update totals for the year',
    ).emit();
    this.option('-o, --overwrite', 'Overwrite form fields, even if already filled in').emit();
    const help = buildDateHelp(new Ctx.CustomMsgBuilder()).format();
    this.option({ ...dateOptionDef, help: help } as CliApp.OptionDef).emit();
    this.option(
      '--pdf <path>',
      'Path to bikelog PDF file. Defaults to ~/CloudStation/PDFDocs/BIKE/bikelog_{yyyy}.pdf',
    )
      .emit();
    this.option('--athleteId <id>', 'Athlete ID (defaults to authenticated user)').emit();
    this.addHelpText(this.helpText());
  }

  override async execute(
    options: PdfCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    const ctx = this.activeContext();
    assert(ctx);
    const update = {
      activities: options.totalOnly !== true,
      totals: options.total || options.totalOnly,
    };

    const app = new App.Main(ctx);
    if (isAthleteId(options.athleteId)) {
      app.setAthleteId(options.athleteId);
    }
    ctx.app = app;
    await app.init({ strava: update.activities, userSettings: true, state: update.activities });

    ctx.log.info.section().emit();
    ctx.log.info.h1('PDF Form Filler').emit();

    // Resolve the PDF Bikelog path
    let fsSrcPdf: FS.File;
    if (_.isNonEmptyString(options.pdf)) {
      fsSrcPdf = FS.File.home(options.pdf);
    } else {
      const year = DateTime.now().year;
      fsSrcPdf = FS.File.home('CloudStation', 'PDFDocs', 'BIKE', `bikelog_${year}.pdf`);
    }

    if (!(await fsSrcPdf.isFile())) {
      throw new Error(`PDF Bikelog file not found: ${fsSrcPdf.path}`);
    }
    ctx.log.info.text('Using PDF Bikelog').fs(fsSrcPdf).emit();

    const files: App.BikeLog.File = {
      pdf: new App.BikeLog.BikelogPdf(this.ctx, fsSrcPdf),
      output: ctx.dryRun
        ? FS.File.home('Downloads', fsSrcPdf.filename)
        : await FS.File.makeTemp({ suffix: '.pdf' }),
    };

    if (ctx.dryRun) {
      ctx.log.info.dryRun().text('Saving filled PDF to').relative(files.output).emit();
    }

    let updatePdfState: () => void = async () => {
      await Promise.resolve();
    };

    if (update.activities) {
      const lastUpdated = app.getLastUpdated(OutputTypes.Acroforms);

      let dateRanges: DateRanges;
      if (options.date && options.date.hasRanges()) {
        dateRanges = options.date;
      } else if (lastUpdated) {
        dateRanges = DateRanges.from([{ after: DateTime.fromString(lastUpdated) }]);
        ctx.log.info.text('Retrieving activities since last update').value(lastUpdated).emit();
      } else {
        throw new CliApp.SilentError(
          '--date is required for first run. Specify date range(s) (e.g., 20240101-20241231)',
        );
      }

      if (!app.athlete) {
        await app.getAthlete();
      }

      const activities = new Activity.Collection(ctx);
      await activities.getForDateRange(dateRanges);

      if (activities.length === 0) {
        ctx.log.info.text('No activities found for the specified date range').emit();
        return;
      }

      await activities.getDetailsAndSegments({ detailed: true });

      await app.fillPdf(files, { activities, overwrite: !!options.overwrite });

      updatePdfState = async () => {
        await app.updatePdfState(OutputTypes.Acroforms, activities);
      };
    }

    if (update.totals) {
      await app.updatePdfTotals(files);
    }

    await app.savePdf(files);

    if (!ctx.dryRun) {
      // Clean up old backups (> 3 months)
      await files.pdf.cleanupOldBackups();

      // Backup current PDF to .backup folder
      await files.pdf.backup();

      // Replace original with filled PDF
      await files.pdf.replaceFrom(files.output);

      // Update state
      if (update.activities) {
        await updatePdfState();
      }
    }
  }

  helpText(): string {
    const b = new TextBuilder();
    b.newline();
    b.line.h1('PDF Form Filling');
    b.newline();
    b.line.text('Fill form fields of an existing')
      .code('Bikelog PDF').text('with Strava activity data.');
    b.newline();

    b.line.h2('Output Behavior:');
    b.line.ibullet()
      .text('Opens the bikelog PDF, fills form fields with activity data, and does a')
      .warn('full save').text('in place');
    b.line.ibullet().text('Original PDF is backed up to')
      .path('.backup/').text('folder with timestamp');
    b.line.ibullet().text(
      'Backups older than 90 days are automatically deleted',
    );
    b.line.ibullet().text('Use')
      .stylize(style.flag, '--pdf')
      .text('to specify the PDF file').iarrow().text('default:')
      .path('~/CloudStation/PDFDocs/BIKE/bikelog_{yyyy}.pdf');
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
    b.line.ibullet().text('After first run, subsequent runs fetch only new activities');
    b.line.ibullet().text('Last update time is stored in')
      .path('~/.config/epdoc/strava/user.state.json');
    b.line.ibullet().text('Use').stylize(style.flag, '--date')
      .text('to override and fetch specific date ranges');
    b.newline();

    b.line.h2('Examples:');
    b.line.ibullet().text('Fill PDF with all activities in 2024');
    b.line.label('  ').value('--date 20240101-20241231');
    b.line.ibullet().text('Fill with a custom PDF template');
    b.line.label('  ').value('--date 7d-now --pdf ~/PDFDocs/BIKE/bikelog_2026.pdf');
    b.line.ibullet().text('Incremental update: fetch only activities since last run');
    b.line.label('  ').value('(no --date, after first run)');

    return b.toString();
  }
}
