import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { Ctx } from '../src/mod.ts';

const _pkg = { name: 'test-pkg', version: '1.0.0', description: 'Test package' };

describe('Context', () => {
  it('should create context with package info', () => {
    const ctx = new Ctx.Context({
      name: 'test-pkg',
      version: '1.0.0',
      description: 'Test package',
    });

    expect(ctx).toBeDefined();
  });

  it('should setup logging', async () => {
    const ctx = new Ctx.Context({
      name: 'test-pkg',
      version: '1.0.0',
      description: 'Test package',
    });

    await ctx.setupLogging({ pkg: 'test' });

    expect(ctx.log).toBeDefined();
  });

  it('should inherit from parent context', async () => {
    const parent = new Ctx.Context({
      name: 'parent',
      version: '1.0.0',
      description: 'Parent package',
    });
    await parent.setupLogging();

    const child = new Ctx.Context(parent);

    expect(child).toBeDefined();
    expect(child.log).toBeDefined();
  });
});
