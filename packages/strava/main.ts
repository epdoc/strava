import * as CliApp from '@epdoc/cliapp';
import { Ctx } from '@epdoc/strava-core';
import pkg from './deno.json' with { type: 'json' };
import { RootCommand } from './src/mod.ts';

if (import.meta.main) {
  const ctx = new Ctx.Context(pkg);
  await ctx.setupLogging({ pkg: 'strava' });

  const cmd = new RootCommand(ctx, { root: true, dryRun: true });
  await cmd.init();

  await CliApp.run(ctx, cmd);
}
