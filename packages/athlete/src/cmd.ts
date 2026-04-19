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
    msg.text(
      'This tool retrieves and displays information about the authenticated Strava athlete.\n',
    );
    msg.h2('\nRequirements:\n');
    msg.label('  •').text(
      'Requires a valid Strava API token to be configured\n',
    );
    msg.h2('\nExamples:\n');
    msg.label('  ').value('strava athlete')
      .text('                Display the current athlete info\n');
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
