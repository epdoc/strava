import * as CliApp from '@epdoc/cliapp';
import { DateRange } from '@epdoc/daterange';
import { DateTime } from '@epdoc/datetime';
import { Icon } from '@epdoc/fmt';
import * as FS from '@epdoc/fs/fs';
import { BaseClass, type Ctx } from '@epdoc/strava-core';
import { _ } from '@epdoc/type';
import type { Integer } from '@epdoc/type/types';
import { assert } from '@std/assert/assert';
import * as pdfLib from 'pdf-lib';
import config from '../consts.ts';
import type * as Region from '../region/mod.ts';
import type { BikelogEntry, IOverwrite } from './types.ts';

const DAY_MS = 24 * 60 * 60 * 1000;
const BACKUP_RETENTION_MS = 90 * DAY_MS;

type FieldResult = 'missing' | 'skipped' | 'filled';
type FieldType = 'string' | 'numeric' | 'note';

const NUMERIC_TOLERANCE = 1e-6;
const REGEX_AWAY = /^Away\s*\(([^)]+)\)$/m;

const COVER_TABLE = {
  startX: 640,
  startY: 1100,
  labelW: 75,
  colW: 35,
  rowH: 17,
  fontSize: 8,
  headingFontSize: 8,
};

export class BikelogPdf extends BaseClass {
  static BACKUP_RETENTION_MS = BACKUP_RETENTION_MS;
  private static IGNORED_FIELDS = new Set(['wh']);

  #file: FS.File;
  #doc?: pdfLib.PDFDocument;
  #form?: pdfLib.PDFForm;
  #coverPage?: pdfLib.PDFPage;
  #defaultRegion?: string;
  #font?: pdfLib.PDFFont;

  constructor(ctx: Ctx.Context, file: FS.File) {
    super(ctx);
    this.#file = file;
  }

  async init(): Promise<void> {
    if (!this.#doc) {
      const bytes = await this.#file.readAsBytes();
      this.#doc = await pdfLib.PDFDocument.load(bytes);
      this.#form = this.#doc.getForm();
      const pages = this.#doc.getPages();
      this.#coverPage = pages[0];

      const contents = await config.paths.userRegions.readJson<Region.File>();
      this.#defaultRegion = contents && contents.regions.length
        ? contents.regions[0].name
        : 'Costa Rica';
    }
  }

  get file(): FS.File {
    return this.#file;
  }

  get doc(): pdfLib.PDFDocument {
    assert(this.#doc, 'BikelogPdf has not been initialized');
    return this.#doc;
  }

  get form(): pdfLib.PDFForm {
    assert(this.#form, 'BikelogPdf has not been initialized');
    return this.#form;
  }

  get coverPage(): pdfLib.PDFPage {
    assert(this.#coverPage, 'BikelogPdf has not been initialized');
    return this.#coverPage;
  }

  async fill(entries: Record<string, BikelogEntry>, opts: IOverwrite = {}): Promise<void> {
    await this.init();
    this.#font = await this.doc.embedStandardFont(pdfLib.StandardFonts.Helvetica);

    let filled = 0;
    let skipped = 0;
    let missing = 0;

    const applyField = (
      name: string,
      value: string | undefined,
      fieldType: FieldType,
    ) => {
      const result = this.#trySetField(name, value, fieldType, opts);
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
        this.info.icheck().text('Filled in').date(entry.date!.format('yyyy-MM-dd'))
          .text(`(julian day: ${jd})`).emit();
      } else {
        this.info.ierror().text('There were problems filling in')
          .date(entry.date!.format('yyyy-MM-dd'))
          .text(`(julian day: ${jd})`).emit();
      }
    }

    this.info.text('Form fields:')
      .text('filled').value(filled).icon(Icon.Circle.dot)
      .text('skipped').value(skipped).icon(Icon.Circle.dot)
      .text('missing').value(missing)
      .emit();

    for (const [jd, entry] of Object.entries(entries)) {
      for (const fieldName of ['note0', 'note1']) {
        const text = entry[fieldName as 'note0' | 'note1'];
        if (!text) continue;
        try {
          const field = this.form.getTextField(`day.${jd}.${fieldName}`);
          let fontSize = 12;
          if (fieldName === 'note0' && this.#font) {
            const rect = field.acroField.getWidgets()[0]?.getRectangle();
            if (rect) {
              const pad = 2;
              const availW = rect.width - pad * 2;
              const spaceW = this.#font.widthOfTextAtSize(' ', 12);
              const fontH = this.#font.heightAtSize(12);
              const lineH = fontH * 1.2;
              const words = text.split(/\s+/);

              const maxWordWidth = words.reduce(
                (max, w) => Math.max(max, this.#font!.widthOfTextAtSize(w, 12)),
                0,
              );

              let lines = 1;
              let curLine = 0;
              for (const word of words) {
                const ww = this.#font!.widthOfTextAtSize(word, 12);
                if (curLine === 0) {
                  curLine = ww + spaceW;
                } else if (curLine + ww <= availW) {
                  curLine += ww + spaceW;
                } else {
                  lines++;
                  curLine = ww + spaceW;
                }
              }

              const widthRatio = availW / maxWordWidth;
              const heightRatio = rect.height / (lines * lineH);
              const ratio = Math.min(widthRatio, heightRatio);

              if (ratio < 1) {
                fontSize = Math.max(6, Math.round(12 * ratio * 2) / 2);
              }
            }
          }
          field.acroField.dict.set(
            pdfLib.PDFName.of('DA'),
            pdfLib.PDFString.of(`/Helv ${fontSize} Tf 0 g`),
          );
        } catch {
          /* field not found, skip */
        }
      }
    }

    this.form.updateFieldAppearances(this.#font!);
  }

  async close(output: FS.File): Promise<void> {
    const pdfBytes = await this.doc.save();
    await output.write(pdfBytes);
  }

  async addCoverSummaryTable(): Promise<void> {
    await this.init();
    // Set the default year to this year, but this is overridden if we get it from the first field in the table
    const year = this.getCoverYear();

    const start = DateTime.fromComponents(year, 1, 1).startOfDay();
    const yearEnd = DateTime.fromComponents(year, 12, 31).endOfDay();
    const now = DateTime.now().endOfDay();
    const end = now.isBefore(yearEnd) ? now.withTz('local').startOfDay() : yearEnd;
    const durMs = end.toInstant().epochMilliseconds - start.toInstant().epochMilliseconds;
    const totalDays = Math.ceil(durMs / (1000 * 60 * 60 * 24));

    function* jdEntries(): Generator<[DateTime, number]> {
      for (const dt of DateRange.from(start, end).iterate('day')) {
        yield [dt, dt.julianDayInTz()];
      }
    }

    //
    const entries: BikelogEntry[] = [];
    const matrix = new Map<string, Map<string, number>>();
    const regions = new Set<string>();
    const bikes = new Set<string>();
    const regionTotals = new Map<string, number>();
    const bikeTotals = new Map<string, number>();
    let grandTotal = 0;

    let interrupted = false;
    const handler = () => {
      interrupted = true;
    };
    Deno.addSignalListener('SIGINT', handler);

    this.info.text('Summarizing distances by region and bike').ellipsis()
      .start({ type: 'horizontal', total: totalDays, width: 20, color: 0xff0000 });

    try {
      let count = 0;
      for (const [dt, jdn] of jdEntries()) {
        const entry = this.getEntry(jdn);
        const region = this.getRegionForEntry(entry);
        regions.add(region);
        this.info.text('Reading').date(dt.format('yyyy-MM-dd')).value(grandTotal.toFixed(0))
          .update(++count);
        if (interrupted) {
          Deno.removeSignalListener('SIGINT', handler); // clean up
          throw new CliApp.SilentError('Interrupted by user');
        }
        await new Promise((resolve) => setTimeout(resolve, 0)); //  allow SIGINT
        for (const evt of entry.events) {
          if (evt.bike && evt.distance) {
            bikes.add(evt.bike);

            let bikeMap = matrix.get(region);
            if (!bikeMap) {
              bikeMap = new Map<string, number>();
              matrix.set(region, bikeMap);
            }
            bikeMap.set(evt.bike, (bikeMap.get(evt.bike) ?? 0) + evt.distance);
            // B. Update Row Subtotals (Region)
            regionTotals.set(region, (regionTotals.get(region) ?? 0) + evt.distance);

            // C. Update Column Subtotals (Bike)
            bikeTotals.set(evt.bike, (bikeTotals.get(evt.bike) ?? 0) + evt.distance);

            // D. Update Grand Total
            grandTotal += evt.distance;
          }
        }
        entries.push(entry);
      }
    } catch (_e) {
      this.info.ierror().warn('Error summaring totals by region and bike').stop();
    }
    this.info.icheck().text('Finished summaring totals by region and bike').stop();

    if (entries.length === 0) return;

    // Row 0: column headings (bike names + Total)
    for (let ci = 0; ci < bikes.size; ci++) {
      this.setCoverCell(0, ci + 1, Array.from(bikes)[ci], { isHeading: true });
    }
    this.setCoverCell(0, bikes.size + 1, 'Total', { isHeading: true });

    // Region data rows
    for (let ri = 0; ri < regions.size; ri++) {
      const region = Array.from(regions)[ri];
      this.setCoverCell(ri + 1, 0, region);
      for (let ci = 0; ci < bikes.size; ci++) {
        const bike = Array.from(bikes)[ci];
        const b = matrix.get(region);
        const val: number = (b ? b.get(bike) : 0) || 0;
        this.setCoverCell(ri + 1, ci + 1, val.toFixed(1));
      }
      const total: number = regionTotals.get(region) || 0;
      this.setCoverCell(ri + 1, bikes.size + 1, total.toFixed(1));
    }

    // Totals row
    const totalRow = regions.size + 1;
    this.setCoverCell(totalRow, 0, 'Total');
    for (let ci = 0; ci < bikes.size; ci++) {
      const bike = Array.from(bikes)[ci];
      this.setCoverCell(totalRow, ci + 1, (bikeTotals.get(bike) ?? 0).toFixed(1));
    }
    this.setCoverCell(totalRow, bikes.size + 1, grandTotal.toFixed(1));

    this.info.text('Cover page summary table added').emit();
  }

  getRegionForEntry(entry: BikelogEntry): string {
    if (entry.note1) {
      const match = entry.note1.match(REGEX_AWAY);
      if (match) return match[1];
    }
    assert(this.#defaultRegion);
    return this.#defaultRegion;
  }

  getEntry(jd: number): BikelogEntry {
    const result: BikelogEntry = {
      jd: jd,
      events: [],
      note0: this.getTextField(`day.${jd}.note0`),
      note1: this.getTextField(`day.${jd}.note1`),
      wt: this.getNumberField(`day.${jd}.wt`),
    };
    const bike0 = this.getDropdownField(`day.${jd}.0.bike`);
    if (bike0) {
      const event0 = {
        bike: bike0,
        distance: this.getNumberField(`day.${jd}.0.dist`),
        el: this.getNumberField(`day.${jd}.0.el`),
        t: this.getNumberField(`day.${jd}.0.t`),
        wh: this.getNumberField(`day.${jd}.0.wh`),
      };
      result.events.push(event0);
      const bike1 = this.getDropdownField(`day.${jd}.0.bike1`);
      if (bike1) {
        const event1 = {
          bike: bike1,
          distance: this.getNumberField(`day.${jd}.1.dist`),
          el: this.getNumberField(`day.${jd}.1.el`),
          t: this.getNumberField(`day.${jd}.1.t`),
          wh: this.getNumberField(`day.${jd}.1.wh`),
        };
        result.events.push(event1);
      }
    }
    return result;
  }

  getCoverYear(): Integer {
    const name = 'cover.r0c0';
    let f: pdfLib.PDFTextField;
    try {
      f = this.form.getTextField(name);
    } catch (_e) {
      f = this.form.createTextField(name);
      const pages = this.doc.getPages();
      const coverPage = pages[0];
      f.addToPage(coverPage, {
        x: COVER_TABLE.startX,
        y: COVER_TABLE.startY,
        width: COVER_TABLE.labelW,
        height: COVER_TABLE.rowH,
      });
      f.setFontSize(COVER_TABLE.fontSize);
      f.setText(String(DateTime.now().year));
    }
    const year = _.asInt(f.getText());
    return year > 1975 ? year : DateTime.now().year;
  }

  setCoverCell(
    row: number,
    col: number,
    text: string,
    opts?: { isHeading?: boolean },
  ) {
    const x = COVER_TABLE.startX +
      (col === 0 ? 0 : COVER_TABLE.labelW + (col - 1) * COVER_TABLE.colW);
    const y = COVER_TABLE.startY - row * COVER_TABLE.rowH;
    const w = col === 0 ? COVER_TABLE.labelW : COVER_TABLE.colW;
    const name = `cover.r${row}c${col}`;
    const field = this.getOrCreateField(name, x, y, w, COVER_TABLE.rowH);
    if (opts?.isHeading) {
      field.setFontSize(COVER_TABLE.headingFontSize);
    }
    field.setText(text);
  }

  // Helper to get or create a read-only text field on the cover page
  getOrCreateField(
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
  ): pdfLib.PDFTextField {
    const pages = this.doc.getPages();
    const coverPage = pages[0];

    try {
      const field = this.form.getTextField(name);
      const widget = field.acroField.getWidgets()[0];
      if (widget) {
        const rect = widget.getRectangle();
        if (Math.abs(rect.x - x) > 0.5 || Math.abs(rect.width - w) > 0.5) {
          widget.setRectangle({ x, y, width: w, height: h });
        }
      }
      return field;
    } catch {
      const f = this.form.createTextField(name);
      f.addToPage(coverPage, { x, y, width: w, height: h });
      f.enableReadOnly();
      f.setFontSize(COVER_TABLE.fontSize);
      return f;
    }
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

  getTextField(name: string): string | undefined {
    try {
      const f = this.form.getTextField(name);
      return f.getText() ?? undefined;
    } catch (_e) {
      return undefined;
    }
  }

  getNumberField(name: string): number | undefined {
    try {
      const f = this.form.getTextField(name);
      const s = f.getText() ?? undefined;
      if (s) {
        return _.asFloat(s);
      }
    } catch (_e) {
      return undefined;
    }
  }

  getDropdownField(name: string): string | undefined {
    try {
      const f = this.form.getDropdown(name);
      const selected = f.getSelected();
      return selected && selected.length ? selected[0] : undefined;
    } catch (_e) {
      return undefined;
    }
  }

  #trySetField(
    name: string,
    value: string | undefined,
    fieldType: FieldType,
    opts: IOverwrite,
  ): FieldResult {
    if (value === undefined) return 'skipped';

    const textResult = this.#trySetTextField(name, value, fieldType, opts);
    if (textResult !== 'missing') return textResult;

    const dropdownResult = this.#trySetDropdown(name, value, opts);
    if (dropdownResult !== 'missing') return dropdownResult;

    if (BikelogPdf.IGNORED_FIELDS.has(name.split('.').pop()!)) {
      return 'skipped';
    }

    this.info.ierror().text('Form field not found in PDF').value(name).emit();
    return 'missing';
  }

  #trySetTextField(
    name: string,
    value: string,
    fieldType: FieldType,
    opts: IOverwrite,
  ): FieldResult {
    try {
      const field = this.form.getTextField(name);
      const existing = field.getText() ?? '';

      if (fieldType === 'numeric') {
        const existingNum = parseFloat(existing);
        const valueNum = parseFloat(value);
        if (
          !opts.overwrite &&
          !isNaN(existingNum) && !isNaN(valueNum) &&
          Math.abs(existingNum - valueNum) < NUMERIC_TOLERANCE
        ) {
          this.info.icheck().text('Skipping').label(name)
            .text('because field is already set to').value(value)
            .emit();
          return 'skipped';
        }
        field.setText(value);
        this.debug.text('Set').label(name).text('to').value(value).emit();
        return 'filled';
      }

      if (fieldType === 'string') {
        if (!opts.overwrite && existing === value) {
          this.info.icheck().text('Skipping').label(name)
            .text('because field is already set to final value')
            .emit();
          return 'skipped';
        }
        if (field.isMultiline()) {
          field.setText(value);
        } else {
          field.setText(value);
        }
        this.debug.text('Set').label(name).text('to').value(value).emit();
        return 'filled';
      }

      if (!opts.overwrite && existing === value) {
        this.info.icheck()
          .text('Skipping')
          .label(name)
          .text('because field is already set to final value')
          .emit();
        return 'skipped';
      }

      if (!opts.overwrite && existing && existing.includes(value)) {
        this.info.icheck().text('Skipping').label(name)
          .text('because note already contains new content')
          .emit();
        return 'skipped';
      }

      if (!opts.overwrite) {
        const concatenated = existing ? existing + '\n' + value : value;
        field.setText(concatenated);
        this.debug.text('Set').label(name).text('to concatenated').value(concatenated).emit();
      } else {
        field.setText(value);
      }
      return 'filled';
    } catch {
      return 'missing';
    }
  }

  #trySetDropdown(
    name: string,
    value: string,
    opts: IOverwrite,
  ): FieldResult {
    try {
      const dropdown = this.form.getDropdown(name);
      const selected = dropdown.getSelected();
      const existing = selected.length > 0 ? selected[0] : '';

      if (!opts.overwrite && existing === value) {
        this.info.icheck().text('Skipping').label(name)
          .text('because field is already set to').value(value).emit();
        return 'skipped';
      }

      dropdown.select(value);
      return 'filled';
    } catch {
      return 'missing';
    }
  }
}
