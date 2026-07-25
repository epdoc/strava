import { Icon } from '@epdoc/fmt';
import * as FS from '@epdoc/fs/fs';
import { BaseClass, type Ctx } from '@epdoc/strava-core';
import * as pdfLib from 'pdf-lib';
import type { BikelogEntry } from './types.ts';

const BACKUP_RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

type FieldResult = 'missing' | 'skipped' | 'filled';
type FieldType = 'string' | 'numeric' | 'note';

const NUMERIC_TOLERANCE = 1e-6;

export class BikelogPdf extends BaseClass {
  static BACKUP_RETENTION_MS = BACKUP_RETENTION_MS;
  private static IGNORED_FIELDS = new Set(['wh']);

  #file: FS.File;

  constructor(ctx: Ctx.Context, file: FS.File) {
    super(ctx);
    this.#file = file;
  }

  get file(): FS.File {
    return this.#file;
  }

  async fill(entries: Record<string, BikelogEntry>, targetPath: FS.File): Promise<void> {
    const bytes = await this.#file.readAsBytes();
    const doc = await pdfLib.PDFDocument.load(bytes);
    const form = doc.getForm();

    let filled = 0;
    let skipped = 0;
    let missing = 0;

    const applyField = (
      name: string,
      value: string | undefined,
      fieldType: FieldType,
    ) => {
      const result = this.#trySetField(form, name, value, fieldType);
      if (result === 'filled') filled++;
      else if (result === 'skipped') skipped++;
      else if (result === 'missing') missing++;
    };

    for (const [jd, entry] of Object.entries(entries)) {
      const missingSoFar = missing;
      if (entry.events.length > 0 && entry.events[0]) {
        const evt0 = entry.events[0];
        applyField(`day.${jd}.0.bike`, evt0.bike, 'string');
        applyField(`day.${jd}.0.dist`, evt0.distance?.toString(), 'numeric');
        applyField(`day.${jd}.0.el`, evt0.el?.toString(), 'numeric');
        applyField(`day.${jd}.0.t`, evt0.t?.toString(), 'numeric');
        applyField(`day.${jd}.0.wh`, evt0.wh?.toString(), 'numeric');
      }
      if (entry.events.length > 1 && entry.events[1]) {
        const evt1 = entry.events[1];
        applyField(`day.${jd}.1.bike`, evt1.bike, 'string');
        applyField(`day.${jd}.1.dist`, evt1.distance?.toString(), 'numeric');
        applyField(`day.${jd}.1.el`, evt1.el?.toString(), 'numeric');
        applyField(`day.${jd}.1.t`, evt1.t?.toString(), 'numeric');
        applyField(`day.${jd}.1.wh`, evt1.wh?.toString(), 'numeric');
      }
      applyField(`day.${jd}.note0`, entry.note0, 'note');
      applyField(`day.${jd}.note1`, entry.note1, 'note');
      applyField(
        `day.${jd}.wt`,
        entry.wt !== undefined ? entry.wt.toString() : undefined,
        'numeric',
      );
      if (missing === missingSoFar) {
        this.info.icheck().text('Filled in').date(entry.date.format('yyyy-MM-dd'))
          .text(`(julian day: ${jd})`).emit();
      } else {
        this.info.ierror().text('There were problems filling in')
          .date(entry.date.format('yyyy-MM-dd'))
          .text(`(julian day: ${jd})`).emit();
      }
    }

    this.info.text('Form fields:')
      .text('filled').value(filled).icon(Icon.Circle.dot)
      .text('skipped').value(skipped).icon(Icon.Circle.dot)
      .text('missing').value(missing)
      .emit();

    const font = await doc.embedStandardFont(pdfLib.StandardFonts.Helvetica);

    for (const [jd, entry] of Object.entries(entries)) {
      for (const fieldName of ['note0', 'note1']) {
        if (!entry[fieldName as 'note0' | 'note1']) continue;
        try {
          const field = form.getTextField(`day.${jd}.${fieldName}`);
          field.acroField.dict.set(
            pdfLib.PDFName.of('DA'),
            pdfLib.PDFString.of('/Helv 12 Tf 0 g'),
          );
        } catch {
          /* field not found, skip */
        }
      }
    }

    let noteOverflowed = false;
    for (const [jd, entry] of Object.entries(entries)) {
      for (const fieldName of ['note0', 'note1'] as const) {
        const text = entry[fieldName];
        if (!text) continue;
        try {
          const field = form.getTextField(`day.${jd}.${fieldName}`);
          if (this.#textOverflows(font, text, field)) {
            noteOverflowed = true;
            break;
          }
        } catch {
          /* field not found, skip */
        }
      }
      if (noteOverflowed) break;
    }

    form.updateFieldAppearances(font);

    if (noteOverflowed) {
      this.info.text('Note text overflows at 12pt — viewer will auto-fit').emit();
      form.acroForm.dict.set(pdfLib.PDFName.of('NeedAppearances'), pdfLib.PDFBool.True);
    }

    const pdfBytes = await doc.save();
    await targetPath.write(pdfBytes);
  }

  #textOverflows(font: pdfLib.PDFFont, text: string, field: pdfLib.PDFTextField): boolean {
    const widgets = field.acroField.getWidgets();
    if (widgets.length === 0) return false;
    const rect = widgets[0].getRectangle();
    const lineHeight = font.heightAtSize(12);
    const lineWidths = text.split('\n').map((line) => font.widthOfTextAtSize(line, 12));
    const totalLines = lineWidths.reduce(
      (sum, w) => sum + Math.max(1, Math.ceil(w / rect.width)),
      0,
    );
    return totalLines * lineHeight > rect.height;
  }

  async backup(): Promise<FS.File> {
    const modTime = await this.#file.modifiedAt();
    if (!modTime) {
      throw new Error(`Cannot get modified date for ${this.#file.path}`);
    }
    const ts = modTime.format('yyyyMMdd_HHmmss');
    const backupDir = FS.Folder.from(this.#file.parentFolder(), '.backup');
    await backupDir.ensureDir();

    let backupFile = FS.File.from(backupDir, `${ts}_${this.#file.filename}`);
    let counter = 1;
    while (await backupFile.exists()) {
      backupFile = FS.File.from(backupDir, `${ts}_${counter}_${this.#file.filename}`);
      counter++;
    }

    await this.#file.copyTo(backupFile.path);
    this.info.text('Backed up to').relative(backupFile.path).emit();
    return backupFile;
  }

  async replaceFrom(source: FS.File): Promise<void> {
    await source.moveTo(this.#file, { overwrite: true });
    this.info.text('Replaced').fs(this.#file).emit();
  }

  async cleanupOldBackups(): Promise<number> {
    const backupDir = FS.Folder.from(this.#file.parentFolder(), '.backup');
    if (!(await backupDir.exists())) {
      return 0;
    }
    const cutoff = Date.now() - BACKUP_RETENTION_MS;
    let deleted = 0;
    try {
      const files = await backupDir.getFiles();
      for (const file of files) {
        const mt = await file.modifiedAt();
        if (mt) {
          if (mt.epochMilliseconds < cutoff) {
            await file.remove();
            this.info.text('Deleted old backup').relative(file.path).emit();
            deleted++;
          }
        }
      }
    } catch (_e) {
      // Ignore errors cleaning up old backups
    }
    return deleted;
  }

  #trySetField(
    form: pdfLib.PDFForm,
    name: string,
    value: string | undefined,
    fieldType: FieldType,
  ): FieldResult {
    if (value === undefined) return 'skipped';

    const textResult = this.#trySetTextField(form, name, value, fieldType);
    if (textResult !== 'missing') return textResult;

    const dropdownResult = this.#trySetDropdown(form, name, value);
    if (dropdownResult !== 'missing') return dropdownResult;

    if (BikelogPdf.IGNORED_FIELDS.has(name.split('.').pop()!)) {
      return 'skipped';
    }

    this.info.ierror().text('Form field not found in PDF').value(name).emit();
    return 'missing';
  }

  #trySetTextField(
    form: pdfLib.PDFForm,
    name: string,
    value: string,
    fieldType: FieldType,
  ): FieldResult {
    try {
      const field = form.getTextField(name);
      const existing = field.getText() ?? '';

      if (fieldType === 'numeric') {
        const existingNum = parseFloat(existing);
        const valueNum = parseFloat(value);
        if (
          !isNaN(existingNum) && !isNaN(valueNum) &&
          Math.abs(existingNum - valueNum) < NUMERIC_TOLERANCE
        ) {
          this.info.icheck()
            .text('Skipping')
            .value(name)
            .text('because field is already filled in')
            .emit();
          return 'skipped';
        }
        field.setText(value);
        return 'filled';
      }

      if (fieldType === 'string') {
        if (existing === value) {
          this.info.icheck()
            .text('Skipping')
            .value(name)
            .text('because field is already filled in')
            .emit();
          return 'skipped';
        }
        field.setText(value);
        return 'filled';
      }

      if (existing === value) {
        this.info.icheck()
          .text('Skipping')
          .value(name)
          .text('because field is already filled in')
          .emit();
        return 'skipped';
      }

      if (existing && existing.includes(value)) {
        this.info.icheck()
          .text('Skipping')
          .value(name)
          .text('because note already contains new content')
          .emit();
        return 'skipped';
      }

      const concatenated = existing ? existing + '\n' + value : value;
      field.setText(concatenated);
      return 'filled';
    } catch {
      return 'missing';
    }
  }

  #trySetDropdown(
    form: pdfLib.PDFForm,
    name: string,
    value: string,
  ): FieldResult {
    try {
      const dropdown = form.getDropdown(name);
      const selected = dropdown.getSelected();
      const existing = selected.length > 0 ? selected[0] : '';

      if (existing === value) {
        this.info.icheck()
          .text('Skipping')
          .value(name)
          .text('because field is already filled in')
          .emit();
        return 'skipped';
      }

      dropdown.select(value);
      return 'filled';
    } catch {
      return 'missing';
    }
  }
}
