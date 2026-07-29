import { assertEquals } from '@std/assert';

Deno.test('@epdoc/strava should show help with -h flag', async () => {
  const cmd = new Deno.Command('deno', {
    args: ['run', '-A', 'main.ts', '-h'],
  });
  const { code } = await cmd.output();
  assertEquals(code, 0);
});
