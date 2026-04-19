import type * as CliApp from '@epdoc/cliapp';
import { BaseRootCmdClass, Ctx } from '@epdoc/strava-core';
import { type AthleteOptions, AthleteTool } from './athlete.ts';

type AthleteCmdOptions = CliApp.LogCmdOptions & {
  athleteId?: string;
};

export class AthleteCommand extends BaseRootCmdClass<AthleteCmdOptions> {
  override defineMetadata() {
    this.description = 'Show athlete information';
    this.name = 'athlete';
  }

  override defineOptions(): void {
    this.option('--athleteId <id>', 'Athlete ID').emit();
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

  override async execute(options: AthleteCmdOptions, _args: CliApp.CmdArgs): Promise<void> {
    const _opts: AthleteOptions = {
      athleteId: options.athleteId,
    };
    const tool = new AthleteTool(this.ctx);
    await tool.run();
  }
}
