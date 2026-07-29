import { assertExists } from '@std/assert';
import { Ctx } from '../src/mod.ts';

Deno.test('Context should create context with package info', () => {
  const ctx = new Ctx.Context({
    name: 'test-pkg',
    version: '1.0.0',
    description: 'Test package',
  });

  assertExists(ctx);
});

Deno.test('Context should setup logging', async () => {
  const ctx = new Ctx.Context({
    name: 'test-pkg',
    version: '1.0.0',
    description: 'Test package',
  });

  await ctx.setupLogging({ pkg: 'test' });

  assertExists(ctx.log);
});

Deno.test('Context should inherit from parent context', async () => {
  const parent = new Ctx.Context({
    name: 'parent',
    version: '1.0.0',
    description: 'Parent package',
  });
  await parent.setupLogging();

  const child = new Ctx.Context(parent);

  assertExists(child);
  assertExists(child.log);
});
