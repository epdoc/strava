import { assertEquals, assertMatch, assertStringIncludes } from '@std/assert';
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
  const page = doc.addPage([600, 800]);
  const form = doc.getForm();

  for (const jd of ['2459000', '2459001']) {
    for (const idx of ['0', '1']) {
      for (const field of ['bike', 'dist', 'el', 't', 'wh']) {
        form.createTextField(`day.${jd}.${idx}.${field}`);
      }
    }
    const note0 = form.createTextField(`day.${jd}.note0`);
    note0.addToPage(page, { x: 50, y: 700, width: 200, height: 160 });
    note0.enableMultiline();
    form.createTextField(`day.${jd}.note1`);
    form.createTextField(`day.${jd}.wt`);
  }

  const bytes = await doc.save();
  await file.write(bytes, { safe: true });
}

const testDir = await FS.Folder.makeTemp({ prefix: 'bikelog-pdf-test-' });
const ctx = new Ctx.Context({
  name: '@epdoc/strava-app-test',
  version: '0.0.0',
  description: 'Test for BikelogPdf',
});
await ctx.setupLogging();

Deno.test('BikelogPdf backup should create a backup in .backup/ with correct naming pattern', async () => {
  const testPdf = FS.File.from(testDir, 'backup-test.pdf');
  await createTestPdf(testPdf);

  const pdf = new BikelogPdf(ctx, testPdf);
  const backupFile = await pdf.backup();

  assertEquals(await backupFile.exists(), true);
  assertStringIncludes(backupFile.path, '.backup/');
  assertMatch(backupFile.filename, /^\d{8}_\d{6}_backup-test\.pdf$/);
});

Deno.test('BikelogPdf backup should create a second backup with a different timestamp', async () => {
  const testPdf = FS.File.from(testDir, 'backup-test.pdf');
  await createTestPdf(testPdf);

  await new Promise((r) => setTimeout(r, 1100));

  const pdf = new BikelogPdf(ctx, testPdf);
  await pdf.backup();

  await new Promise((r) => setTimeout(r, 200));
  const bytes = await testPdf.readAsBytes();
  await testPdf.write(bytes);
  await new Promise((r) => setTimeout(r, 200));

  const backupFile2 = await pdf.backup();

  const backupDir = FS.Folder.from(testDir, '.backup');
  const files = await backupDir.getFiles();
  assertEquals(files.length >= 2, true);
  assertEquals(await backupFile2.exists(), true);
});

Deno.test('BikelogPdf cleanupOldBackups should delete backups older than retention period', async () => {
  const testPdf = FS.File.from(testDir, 'cleanup-test.pdf');
  await createTestPdf(testPdf);

  const backupDir = FS.Folder.from(testDir, '.backup');
  await backupDir.ensureDir();

  const oldPath = FS.File.from(backupDir, '19990101_000000_cleanup-test.pdf');
  await oldPath.write('fake backup content', { safe: true });
  await Deno.utime(oldPath.path, new Date(1999, 0, 1), new Date(1999, 0, 1));

  const recentFile = FS.File.from(backupDir, '20990101_000000_cleanup-test.pdf');
  await recentFile.write('fake backup content', { safe: true });

  const pdf = new BikelogPdf(ctx, testPdf);
  const deleted = await pdf.cleanupOldBackups();

  assertEquals(deleted >= 1, true);
  assertEquals(await oldPath.exists(), false);
  assertEquals(await recentFile.exists(), true);
});

Deno.test('BikelogPdf cleanupOldBackups should not delete recent backups', async () => {
  const testPdf = FS.File.from(testDir, 'cleanup-test.pdf');
  await createTestPdf(testPdf);

  const backupDir = FS.Folder.from(testDir, '.backup');
  await backupDir.ensureDir();

  const recentFile = FS.File.from(backupDir, '20990101_000000_cleanup-test.pdf');
  await recentFile.write('fake backup content', { safe: true });

  const pdf = new BikelogPdf(ctx, testPdf);
  const deleted = await pdf.cleanupOldBackups();

  assertEquals(deleted, 0);
  assertEquals(await recentFile.exists(), true);
});

Deno.test('BikelogPdf replaceFrom should move the source file over the target', async () => {
  const testPdf = FS.File.from(testDir, 'replace-test.pdf');
  await createTestPdf(testPdf);

  const sourceFile = FS.File.from(testDir, 'filled-replace.pdf');
  await sourceFile.write('replaced content', { safe: true });

  const pdf = new BikelogPdf(ctx, testPdf);
  await pdf.replaceFrom(sourceFile);

  assertEquals(await sourceFile.exists(), false);
  assertEquals(await testPdf.exists(), true);

  const content = await testPdf.readAsString();
  assertEquals(content, 'replaced content');
});

Deno.test('BikelogPdf fill should fill form fields with entry data', async () => {
  const testPdf = FS.File.from(testDir, 'fill-test.pdf');
  await createTestPdf(testPdf);

  const targetFile = FS.File.from(testDir, 'filled-output.pdf');

  const pdf = new BikelogPdf(ctx, testPdf);

  const entries: Record<string, ReturnType<typeof makeTestEntry>> = {
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

  await pdf.fill(entries);
  await pdf.close(targetFile);

  assertEquals(await targetFile.exists(), true);

  const doc = await pdfLib.PDFDocument.load(await targetFile.readAsBytes());
  const form = doc.getForm();

  assertEquals(form.getTextField('day.2459000.0.bike').getText(), 'HB1');
  assertEquals(form.getTextField('day.2459000.0.dist').getText(), '17.65');
  assertEquals(form.getTextField('day.2459000.0.el').getText(), '205');
  assertStringIncludes(form.getTextField('day.2459000.note0').getText()!, 'Test note content');
  assertEquals(form.getTextField('day.2459000.wt').getText(), '87.3');
});

Deno.test('BikelogPdf fill should skip fields that are already filled with the same value', async () => {
  const testPdf = FS.File.from(testDir, 'fill-test.pdf');
  await createTestPdf(testPdf);

  const targetFile = FS.File.from(testDir, 'filled-skip-test.pdf');

  const pdf = new BikelogPdf(ctx, testPdf);

  const entries: Record<string, ReturnType<typeof makeTestEntry>> = {
    '2459000': makeTestEntry(2459000, {
      bike: 'HB1',
      dist: 17.65,
      el: 205,
      t: 0.76,
      note0: 'Already there',
      wt: 87.3,
    }),
  };

  await pdf.fill(entries);
  await pdf.close(targetFile);

  const pdf2 = new BikelogPdf(ctx, targetFile);
  const targetFile2 = FS.File.from(testDir, 'filled-skip-test2.pdf');
  await pdf2.fill(entries);
  await pdf2.close(targetFile2);

  const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
  const form = doc.getForm();
  assertEquals(form.getTextField('day.2459000.0.bike').getText(), 'HB1');
  assertStringIncludes(form.getTextField('day.2459000.note0').getText()!, 'Already there');
});

Deno.test('BikelogPdf fill should concatenate notes that already have different content', async () => {
  const testPdf = FS.File.from(testDir, 'fill-test.pdf');
  await createTestPdf(testPdf);

  const targetFile = FS.File.from(testDir, 'note-concat-test.pdf');

  const pdf = new BikelogPdf(ctx, testPdf);

  await pdf.fill({ '2459000': makeTestEntry(2459000, { note0: 'First entry' }) });
  await pdf.close(targetFile);

  const pdf2 = new BikelogPdf(ctx, targetFile);
  const targetFile2 = FS.File.from(testDir, 'note-concat-test2.pdf');
  await pdf2.fill({ '2459000': makeTestEntry(2459000, { note0: 'Second entry' }) });
  await pdf2.close(targetFile2);

  const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
  const form = doc.getForm();
  const noteText = form.getTextField('day.2459000.note0').getText();
  assertStringIncludes(noteText!, 'First entry');
  assertStringIncludes(noteText!, 'Second entry');
});

Deno.test('BikelogPdf fill should skip notes that already contain the new content', async () => {
  const testPdf = FS.File.from(testDir, 'fill-test.pdf');
  await createTestPdf(testPdf);

  const targetFile = FS.File.from(testDir, 'note-includes-test.pdf');

  const pdf = new BikelogPdf(ctx, testPdf);

  await pdf.fill(
    { '2459000': makeTestEntry(2459000, { note0: 'Part of larger text' }) },
  );
  await pdf.close(targetFile);

  const pdf2 = new BikelogPdf(ctx, targetFile);
  const targetFile2 = FS.File.from(testDir, 'note-includes-test2.pdf');
  await pdf2.fill({ '2459000': makeTestEntry(2459000, { note0: 'larger' }) });
  await pdf2.close(targetFile2);

  const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
  const form = doc.getForm();
  assertEquals(form.getTextField('day.2459000.note0').getText(), 'Part of larger text');
});

Deno.test('BikelogPdf fill should use fuzzy comparison for numeric fields', async () => {
  const testPdf = FS.File.from(testDir, 'fill-test.pdf');
  await createTestPdf(testPdf);

  const targetFile = FS.File.from(testDir, 'numeric-fuzzy-test.pdf');

  const pdf = new BikelogPdf(ctx, testPdf);

  await pdf.fill(
    { '2459000': makeTestEntry(2459000, { dist: 0.2, el: 100, t: 1.5, wt: 87.3 }) },
  );
  await pdf.close(targetFile);

  const pdf2 = new BikelogPdf(ctx, targetFile);
  const targetFile2 = FS.File.from(testDir, 'numeric-fuzzy-test2.pdf');
  await pdf2.fill({
    '2459000': makeTestEntry(2459000, {
      dist: 0.1999999,
      el: 99.9999999,
      t: 1.500000001,
      wt: 87.300000001,
    }),
  });
  await pdf2.close(targetFile2);

  const doc = await pdfLib.PDFDocument.load(await targetFile2.readAsBytes());
  const form = doc.getForm();
  assertEquals(form.getTextField('day.2459000.0.dist').getText(), '0.2');
  assertEquals(form.getTextField('day.2459000.wt').getText(), '87.3');
});

Deno.test('BikelogPdf fill should not modify blank note0 fields (no DA/AP)', async () => {
  const testPdf = FS.File.from(testDir, 'blank-note0-test.pdf');
  await createTestPdf(testPdf);

  const targetFile = FS.File.from(testDir, 'blank-note0-output.pdf');

  // Fill a different day so day.2459001.note0 stays blank
  const pdf = new BikelogPdf(ctx, testPdf);
  const entries: Record<string, ReturnType<typeof makeTestEntry>> = {
    '2459000': makeTestEntry(2459000, { note0: 'Some note text' }),
  };
  await pdf.fill(entries);
  await pdf.close(targetFile);

  const doc = await pdfLib.PDFDocument.load(await targetFile.readAsBytes());
  const form = doc.getForm();

  // The blank note0 (2459001) must have no DA and no AP stream
  const blankField = form.getTextField('day.2459001.note0');
  assertEquals(blankField.acroField.getDefaultAppearance(), undefined);
  const blankWidget = blankField.acroField.getWidgets()[0];
  assertEquals(blankWidget.getAppearances()?.normal, undefined);

  // The filled note0 (2459000) must have its text and a DA
  const filledField = form.getTextField('day.2459000.note0');
  assertEquals(filledField.getText(), 'Some note text');
  const filledDA = filledField.acroField.getDefaultAppearance();
  assertStringIncludes(filledDA!, 'Helvetica');
  assertStringIncludes(filledDA!, 'Tf');
});

Deno.test('BikelogPdf fill should repair pre-corrupted blank note0 DA/AP', async () => {
  const testPdf = FS.File.from(testDir, 'corrupt-note0-test.pdf');
  await createTestPdf(testPdf);

  // Pre-corrupt day.2459001.note0: set DA to 137pt and force an AP stream
  {
    const doc = await pdfLib.PDFDocument.load(await testPdf.readAsBytes());
    const form = doc.getForm();
    const field = form.getTextField('day.2459001.note0');
    field.acroField.dict.set(
      pdfLib.PDFName.of('DA'),
      pdfLib.PDFString.of('/Helvetica 137 Tf 0 g'),
    );
    const font = await doc.embedStandardFont(pdfLib.StandardFonts.Helvetica);
    form.updateFieldAppearances(font);
    await testPdf.write(await doc.save(), { safe: true });
  }

  // Verify corruption is present
  {
    const doc = await pdfLib.PDFDocument.load(await testPdf.readAsBytes());
    const form = doc.getForm();
    const da = form.getTextField('day.2459001.note0').acroField
      .getDefaultAppearance();
    assertStringIncludes(da!, '137');
  }

  // Now fill a different day and close — repair should strip the corrupted blank note0
  const pdf = new BikelogPdf(ctx, testPdf);
  const targetFile = FS.File.from(testDir, 'corrupt-note0-repaired.pdf');
  const entries: Record<string, ReturnType<typeof makeTestEntry>> = {
    '2459000': makeTestEntry(2459000, { note0: 'Repair test' }),
  };
  await pdf.fill(entries);
  await pdf.close(targetFile);

  const doc = await pdfLib.PDFDocument.load(await targetFile.readAsBytes());
  const form = doc.getForm();

  // The blank note0 must have no DA and no AP (repaired)
  const blankField = form.getTextField('day.2459001.note0');
  assertEquals(blankField.acroField.getDefaultAppearance(), undefined);
  const blankWidget = blankField.acroField.getWidgets()[0];
  assertEquals(blankWidget.getAppearances()?.normal, undefined);

  // The filled note0 must still have its text
  assertEquals(
    form.getTextField('day.2459000.note0').getText(),
    'Repair test',
  );
});
