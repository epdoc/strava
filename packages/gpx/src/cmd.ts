import type * as CliApp from '@epdoc/cliapp';
import * as Strava from '@epdoc/strava-api';
import { BaseRootCmdClass, Ctx, Options } from '@epdoc/strava-core';
import { _ } from '@epdoc/type';

const activityParser = (input: string | boolean): Strava.Schema.ActivityType[] => {
  if (input === true || input === '') return []; // All activities
  if (_.isString(input)) {
    return input.split(',').map((s) => s.trim() as Strava.Schema.ActivityType);
  }
  return [];
};

type GpxCmdOptions = Options.CmdOptions & {
  noTracks?: boolean;
  commute?: Options.CommuteType;
  type: Strava.Schema.ActivityType[];
  blackout: boolean;
  allowDups: boolean;
};

export class GpxCommand extends BaseRootCmdClass<GpxCmdOptions> {
  override defineMetadata() {
    this.description = 'Generate GPX files from Strava';
    this.name = 'gpx';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID').emit();
    this.option(Options.optionDefs.date).emit();
    this.option(Options.optionDefs.laps).emit();
    this.option(Options.optionDefs.output).emit();
    this.option(Options.optionDefs.blackout).emit();
    this.option(Options.optionDefs.allowDups).emit();
    this.option('-t, --type [types]', 'Comma separated list of activity types to include.')
      .choices(Object.keys(Strava.Schema.ActivityName))
      .argParser(activityParser).emit();

    this.addHelpText(this.helpText());
  }

  helpText(): string {
    const msg = new Ctx.CustomMsgBuilder();
    msg.h1('\nUsage Notes:\n');
    msg.h2('\nInstall from Stable Worktree:\n');
    msg.text(
      'This tool installs packages globally from the stable worktree (tools-stable).\n',
    );
    msg.text(
      'Run from workspace root to install all installable packages, or from a specific\n',
    );
    msg.text(
      'package directory to install just that package.\n',
    );
    msg.h2('\nRequirements:\n');
    msg.label('  •').text(
      'Must be run from workspace root or a package directory\n',
    );
    msg.label('  •').text('Package must have').dim('publish.bin')
      .text('defined (isInstalled=true) to be installable\n');
    msg.label('  •').text(
      'tools-stable worktree must exist at ../tools-stable\n',
    );
    msg.h2('\nSetup:\n');
    msg.text(
      'Use the --setup flag to verify and setup your environment to use git worktrees:\n',
    );
    msg.label('  ').value('dtask install --setup').text(
      '      Check and fix setup\n',
    );
    msg.label('  ').value('dtask install --setup --dry-run').text(
      'Preview what setup would do\n',
    );
    msg.h2('\nExamples:\n');
    msg.label('  ').value('dtask install')
      .text('                Install all installable packages from root\n');
    msg.label('  ').value('cd packages/bump && dtask install')
      .text('Install bump from stable worktree\n');
    msg.label('  ').value('dtask install .')
      .text('             Install current package\n');
    msg.label('  ').value('dtask install . ../xx')
      .text('       Install current and xx packages\n');
    msg.label('  ').value('dtask install --allow-dirty')
      .text('      Install even with uncommitted changes\n');
    return msg.format();
  }

  override async execute(
    options: GpxCmdOptions,
    _args: CliApp.CmdArgs,
  ): Promise<void> {
    const _opts: GpxOptions = {
      athleteId: options.athleteId,
    };
    const tool = new GpxTool(this.ctx);
    await tool.run();
  }
}
