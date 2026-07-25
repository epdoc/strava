import { expect } from '@std/expect';
import { afterAll, beforeAll, beforeEach, describe, it } from '@std/testing/bdd';
import * as FS from '@epdoc/fs/fs';
import { Ctx } from '@epdoc/strava-core';
import * as pdfLib from 'pdf-lib';
import { BikelogPdf } from '../src/bikelog/pdf.ts';

function makeTestEntry(
  jd: number,
  overrides: Partial<{
    bike: string;
    dist: number;
    el: number;
    t: number;
    wh: number;
    note0: string;
    note1: string;
    wt: number;
  }> = {},
) {
  const events = overrides.bike || overrides.dist !== undefined
    ? [{
      distance: overrides.dist ?? 0,
      bike: overrides.bike ?? '',
      el: overrides.el ?? 0,
      t: overrides.t ?? 0,
      wh: overrides.wh ?? 0,
    }]
    : [];
  return {
    jd,
    date: {
      format: (_fmt: string) => '2024-01-01',
    } as unknown as import('@epdoc/datetime').DateTime,
    events,
    note0: overrides.note0,
    note1: overrides.note1,
    wt: overrides.wt,
  };
}

async function createTestPdf(file: FS.File): Promise<void> {
  const doc = await pdfLib.PDFDocument.create();
  doc.addPage([600, 800]);
  const form = doc.getForm();

  for (const jd of ['2459000', '2459001']) {
    for (const idx of ['0', '1']) {
      for (const field of ['bike', 'dist', 'el', 't', 'wh']) {
        form.createTextField(`day.${jd}.${idx}.${field}`);
      }
    }
    form.createTextField(`day.${jd}.note0`);
    form.createTextField(`day.${jd}.note1`);
    form.createTextField(`day.${jd}.wt`);
  }

  const bytes = await doc.save();
  await file.write(bytes, { safe: true });
}

describe('BikelogPdf', () => {
  let testDir: FS.Folder;
  let ctx: Ctx.Context;

  beforeAll(async () => {
    testDir = await FS.Folder.makeTemp({ prefix: 'bikelog-pdf-test-' });
    ctx = new Ctx.Context({
      name: '@epdoc/strava-app-test',
      version: '0.0.0',
      description: 'Test for BikelogPdf',
    });
    await ctx.setupLogging();
  });

  afterAll(async () => {
    await Deno.remove(testDir.path, { recursive: true });
  });

  describe('backup', () => {
    let testPdf: FS.File;

    beforeEach(async () => {
      testPdf = FS.File.from(testDir, 'backup-test.pdf');
      await createTestPdf(testPdf);
    });

    it('should create a backup in .backup/ with correct naming pattern', async () => {
      const pdf = new BikelogPdf(ctx, testPdf);
      const backupFile = await pdf.backup();

      expect(await backupFile.exists()).toBe(true);
      expect(backupFile.path).toContain('.backup/');
      expect(backupFile.filename).toMatch(/^\d{8}_\d{6}_backup-test\.pdf$/);
    });

    it('should create a second backup with a different timestamp', async () => {
      await new Promise((r) => setTimeout(r, 1100));

      const pdf = new BikelogPdf(ctx, testPdf);
      await pdf.backup();

      // Wait so the modifiedAt changes (the file got rewritten before this describe block)
      await new Promise((r) => setTimeout(r, 200));
      // Touch the file to update its modification time
      const bytes = await testPdf.readAsBytes();
      await testPdf.write(bytes);
      await new Promise((r) => setTimeout(r, 200));

      const backupFile2 = await pdf.backup();

      const backupDir = FS.Folder.from(testDir, '.backup');
      const files = await backupDir.getFiles();
      expect(files.length).toBeGreaterThanOrEqual(2);
      expect(await backupFile2.exists()).toBe(true);
    });
  });

  describe('cleanupOldBackups', () => {
    let testPdf: FS.File;

    beforeEach(async () => {
      testPdf = FS.File.from(testDir, 'cleanup-test.pdf');
      await createTestPdf(testPdf);
    });

    it('should delete backups older than retention period', async () => {
      const backupDir = FS.Folder.from(testDir, '.backup');
      await backupDir.ensureDir();

      const oldPath = FS.File.from(backupDir, '19990101_000000_cleanup-test.pdf');
      await oldPath.write('fake backup content', { safe: true });
      // Set modification time to year 1999
      await Deno.utime(oldPath.path, new Date(1999, 0, 1), new Date(1999, 0, 1));

      const recentFile = FS.File.from(backupDir, '20990101_000000_cleanup-test.pdf');
      await recentFile.write('fake backup content', { safe: true });

      const pdf = new BikelogPdf(ctx, testPdf);
      const deleted = await pdf.cleanupOldBackups();

      expect(deleted).toBeGreaterThanOrEqual(1);
      expect(await oldPath.exists()).toBe(false);
      expect(await recentFile.exists()).toBe(true);
    });

    it('should not delete recent backups', async () => {
      const backupDir = FS.Folder.from(testDir, '.backup');
      await backupDir.ensureDir();

      const recentFile = FS.File.from(backupDir, '20990101_000000_cleanup-test.pdf');
      await recentFile.write('fake backup content', { safe: true });

      const pdf = new BikelogPdf(ctx, testPdf);
      const deleted = await pdf.cleanupOldBackups();

      expect(deleted).toBe(0);
      expect(await recentFile.exists()).toBe(true);
    });
  });

  describe('replaceFrom', () => {
    let testPdf: FS.File;

    beforeEach(async () => {
      testPdf = FS.File.from(testDir, 'replace-test.pdf');
      await createTestPdf(testPdf);
    });

    it('should move the source file over the target', async () => {
      const sourceFile = FS.File.from(testDir, 'filled-replace.pdf');
      await sourceFile.write('replaced content', { safe: true });

      const pdf = new BikelogPdf(ctx, testPdf);
      await pdf.replaceFrom(sourceFile);

      expect(await sourceFile.exists()).toBe(false);
      expect(await testPdf.exists()).toBe(true);

      const content = await testPdf.readAsString();
      expect(content).toBe('replaced content');
    });
  });

  describe('fill', () => {
    let testPdf: FS.File;

    beforeEach(async () => {
      testPdf = FS.File.from(testDir, 'fill-test.pdf');
      await createTestPdf(testPdf);
    });

    it('should fill form fields with entry data', async () => {
      const targetFile = FS.File.from(testDir, 'filled-output.pdf');

      const pdf = new BikelogPdf(ctx, testPdf);

      const entries = {
        '2459000': makeTestEntry(2459000, {
          bike: 'HB1',
          dist: 17.65,
          el: 205,
          t: 0.76,
          wh: 100,
          note0: 'Test note content',
          note1: 'Test note1 content',
          wt: 87.3,
        }),
      };

      await pdf.fill(entries, targetFile);

      expect(await targetFile.exists()).toBe(true);

      const doc = await pdfLib.PDFDocument.load(await targetFile.readAsBytes());
      const form = doc.getForm();

      expect(form.getTextField('day.2459000.0.bike').getText()).toBe('HB1');
      expect(form.getTextField('day.2459000.0.dist').getText()).toBe('17.65');
      expect(form.getTextField('day.2459000.0.el').getText()).toBe('205');
      expect(form.getTextField('day.2459000.note0').getText()).toContain('Test note content');
      expect(form.getTextField('day.2459000.wt').getText()).toBe('87.3');
    });

    it('should skip fields that are already filled with the same value', async () => {
      const targetFile = FS.File.from(testDir, 'filled-skip-test.pdf');

      const pdf = new BikelogPdf(ctx, testPdf);

      const entries = {
        '2459000': makeTestEntry(2459000, {
          bike: 'HB1',
          dist: 17.65,
          el: 205,
          t: 0.76,
          note0: 'Already there',
          wt: 87.3,
        }),
      };

      await pdf.fill(entries, targetFile);

      // Fill again using first output as template
      const pdf2 = new BikelogPdf(ctx, targetFile);
      const targetFile2 = FS.File.from(testDir, 'filled-skip-test2.pdf');
      await pdf2.fill(entries, targetFile2);

      const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
      const form = doc.getForm();
      expect(form.getTextField('day.2459000.0.bike').getText()).toBe('HB1');
      expect(form.getTextField('day.2459000.note0').getText()).toContain('Already there');
    });

    it('should concatenate notes that already have different content', async () => {
      const targetFile = FS.File.from(testDir, 'note-concat-test.pdf');

      const pdf = new BikelogPdf(ctx, testPdf);

      await pdf.fill({ '2459000': makeTestEntry(2459000, { note0: 'First entry' }) }, targetFile);

      // Second fill uses the output of first fill as template (incremental mode)
      const pdf2 = new BikelogPdf(ctx, targetFile);
      const targetFile2 = FS.File.from(testDir, 'note-concat-test2.pdf');
      await pdf2.fill(
        { '2459000': makeTestEntry(2459000, { note0: 'Second entry' }) },
        targetFile2,
      );

      const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
      const form = doc.getForm();
      const noteText = form.getTextField('day.2459000.note0').getText();
      expect(noteText).toContain('First entry');
      expect(noteText).toContain('Second entry');
    });

    it('should skip notes that already contain the new content', async () => {
      const targetFile = FS.File.from(testDir, 'note-includes-test.pdf');

      const pdf = new BikelogPdf(ctx, testPdf);

      await pdf.fill(
        { '2459000': makeTestEntry(2459000, { note0: 'Part of larger text' }) },
        targetFile,
      );

      // Fill with a substring of existing, using first output as template
      const pdf2 = new BikelogPdf(ctx, targetFile);
      const targetFile2 = FS.File.from(testDir, 'note-includes-test2.pdf');
      await pdf2.fill(
        { '2459000': makeTestEntry(2459000, { note0: 'larger' }) },
        targetFile2,
      );

      const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
      const form = doc.getForm();
      expect(form.getTextField('day.2459000.note0').getText()).toBe('Part of larger text');
    });

    it('should use fuzzy comparison for numeric fields', async () => {
      const targetFile = FS.File.from(testDir, 'numeric-fuzzy-test.pdf');

      const pdf = new BikelogPdf(ctx, testPdf);

      await pdf.fill(
        { '2459000': makeTestEntry(2459000, { dist: 0.2, el: 100, t: 1.5, wt: 87.3 }) },
        targetFile,
      );

      // Fill again using first output as template
      const pdf2 = new BikelogPdf(ctx, targetFile);
      const targetFile2 = FS.File.from(testDir, 'numeric-fuzzy-test2.pdf');
      await pdf2.fill(
        {
          '2459000': makeTestEntry(2459000, {
            dist: 0.1999999,
            el: 99.9999999,
            t: 1.500000001,
            wt: 87.300000001,
          }),
        },
        targetFile2,
      );

      const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
      const form = doc.getForm();
      expect(form.getTextField('day.2459000.0.dist').getText()).toBe('0.2');
      expect(form.getTextField('day.2459000.wt').getText()).toBe('87.3');
    });
  });
});
