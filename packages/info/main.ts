import * as CliApp from '@epdoc/cliapp';
import { Ctx } from '@epdoc/strava-core';
import pkg from './deno.json' with { type: 'json' };
import { InfoCommand } from './src/mod.ts';

if (import.meta.main) {
  const ctx = new Ctx.Context(pkg);
  await ctx.setupLogging({ pkg: 'info' });

  const cmd = new InfoCommand(ctx, { root: true, dryRun: false });
  await cmd.init();

  await CliApp.run(ctx, cmd);
}
