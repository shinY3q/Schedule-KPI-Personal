import type { INPData, INPSubject } from '../types/inp';

export interface PositionedPDFText {
  str: string;
  x: number;
  y: number;
}

export interface ExtractedPDFPage {
  width: number;
  items: PositionedPDFText[];
}

interface INPMetadata {
  studentName: string;
  group: string;
  academicYear: string;
  course: number;
  faculty: string;
  department: string;
  educationForm: string;
  educationLevel: string;
  specialty: string;
  studyProgram: string;
}

type MetadataKey = keyof INPMetadata;

const metadataLabels: Array<{
  key: MetadataKey;
  matches: (value: string) => boolean;
}> = [
  { key: 'studentName', matches: value => value === 'здобувач' },
  { key: 'academicYear', matches: value => value === 'навчальний рік' },
  { key: 'group', matches: value => value === 'навчальна група' },
  { key: 'course', matches: value => value === 'курс' },
  { key: 'department', matches: value => value === 'кафедра' },
  { key: 'faculty', matches: value => value.startsWith('факультет/інститут') },
  { key: 'educationForm', matches: value => value === 'форма навчання' },
  { key: 'educationLevel', matches: value => value.startsWith('рівень вищ') },
  { key: 'specialty', matches: value => value === 'спеціальність' },
  { key: 'studyProgram', matches: value => value === 'освітня програма' },
];

const defaultMetadata: INPMetadata = {
  studentName: '',
  group: '',
  academicYear: '',
  course: 0,
  faculty: '-',
  department: '-',
  educationForm: '',
  educationLevel: '',
  specialty: '-',
  studyProgram: '-',
};

function normalizeWhitespace(value: string): string {
  return value.replace(/\u00a0/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeLabel(value: string): string {
  return normalizeWhitespace(value)
    .toLocaleLowerCase('uk-UA')
    .replace(/[’ʼ`]/g, "'");
}

function isPlaceholder(value: string): boolean {
  return !value || /^[_\s.-]+$/.test(value);
}

function findLabel(value: string) {
  const normalized = normalizeLabel(value);
  return metadataLabels.find(label => label.matches(normalized));
}

function extractMetadataFromPages(pages: ExtractedPDFPage[]): Partial<INPMetadata> {
  const metadata: Partial<INPMetadata> = {};

  for (const page of pages) {
    const header = page.items.find(item => /^№\s*/u.test(normalizeWhitespace(item.str)));
    const tableStart = header?.x ?? page.width * 0.36;

    for (let index = 0; index < page.items.length; index += 1) {
      const labelItem = page.items[index];
      if (labelItem.x >= tableStart) continue;

      const label = findLabel(labelItem.str);
      if (!label || metadata[label.key] !== undefined) continue;

      const values: string[] = [];
      for (let nextIndex = index + 1; nextIndex < page.items.length; nextIndex += 1) {
        const nextItem = page.items[nextIndex];
        if (nextItem.x >= tableStart || findLabel(nextItem.str)) break;

        if (nextItem.x > labelItem.x + page.width * 0.035) {
          const value = normalizeWhitespace(nextItem.str);
          if (!isPlaceholder(value)) values.push(value);
        }
      }

      const value = normalizeWhitespace(values.join(' '));
      if (!value) continue;

      if (label.key === 'course') {
        const course = Number.parseInt(value, 10);
        if (Number.isFinite(course) && course > 0) metadata.course = course;
      } else {
        (metadata as Record<string, string | number>)[label.key] = value;
      }
    }
  }

  return metadata;
}

function cleanSubjectName(value: string): string {
  return normalizeWhitespace(value)
    .replace(/-\s+(?=\p{L})/gu, '-')
    .replace(/\(Ф\d+\s+Б\s+[^)]+\)/giu, '')
    .replace(/\(Авторський курс[^)]*\)/giu, '')
    .replace(/\(Сертифікатна програма[^)]*\)/giu, '')
    .trim();
}

function parseNumber(value: string): number | null {
  const normalized = value.replace(',', '.');
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) return null;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function categoryFromHeading(value: string): 'normative' | 'selective' | null {
  const normalized = normalizeLabel(value);
  if (/^нормативн/u.test(normalized)) return 'normative';
  if (/^(обрані|вибірков)/u.test(normalized)) return 'selective';
  return null;
}

function parsePositionedSubject(
  record: PositionedPDFText[],
  tableStart: number,
  departmentStart: number,
  category: 'normative' | 'selective',
  pageWidth: number,
): INPSubject | null {
  const startMatch = normalizeWhitespace(record[0]?.str ?? '').match(/^(\d{1,3})(?:\s+(.+))?$/u);
  if (!startMatch) return null;

  const number = Number.parseInt(startMatch[1], 10);
  const nameParts = startMatch[2] ? [startMatch[2]] : [];
  const tolerance = pageWidth * 0.012;

  for (const item of record.slice(1)) {
    if (item.x > tableStart + tolerance && item.x < departmentStart - tolerance) {
      nameParts.push(item.str);
    }
  }

  const name = normalizeWhitespace(nameParts.join(' ')).replace(/-\s+(?=\p{L})/gu, '-');
  if (!name || name.length < 3) return null;

  const tokens = record
    .slice(1)
    .filter(item => item.x >= departmentStart - tolerance)
    .flatMap(item => normalizeWhitespace(item.str).split(' '))
    .filter(Boolean);

  if (tokens.length < 9) return null;

  const department = tokens[0];
  const semester = parseNumber(tokens[1]);
  const credits = parseNumber(tokens[2]);
  const hours = parseNumber(tokens[3]);
  const lectures = parseNumber(tokens[4]);
  const practices = parseNumber(tokens[5]);
  const labs = parseNumber(tokens[6]);
  const selfStudy = parseNumber(tokens[7]);

  if (
    semester === null || semester < 1 || semester > 12 ||
    credits === null || hours === null || lectures === null ||
    practices === null || labs === null || selfStudy === null
  ) {
    return null;
  }

  const remaining = tokens.slice(8);
  let control = '';
  let mkrText = '-';
  let individualTask = '-';

  if (remaining.length >= 3) {
    individualTask = remaining.at(-1) ?? '-';
    mkrText = remaining.at(-2) ?? '-';
    control = normalizeWhitespace(remaining.slice(0, -2).join(' ')) || '-';
  } else if (remaining.length === 2) {
    mkrText = remaining[1];
    control = remaining[0];
  } else if (remaining.length === 1) {
    control = remaining[0];
  }

  const effectiveCategory = category === 'selective' || /\(Ф\d+/iu.test(name)
    ? 'selective'
    : 'normative';

  return {
    id: `custom-s-${number}`,
    number,
    name,
    cleanName: cleanSubjectName(name),
    category: effectiveCategory,
    department,
    semester,
    credits,
    hours,
    lectures,
    practices,
    labs,
    selfStudy,
    control,
    mkr: /^\d+$/.test(mkrText) ? Number.parseInt(mkrText, 10) : mkrText === '-' ? 0 : mkrText,
    individualTask: individualTask === '-' ? undefined : individualTask,
  };
}

export function extractSubjectsFromPages(pages: ExtractedPDFPage[]): INPSubject[] {
  const subjects: INPSubject[] = [];
  const seen = new Set<string>();
  let category: 'normative' | 'selective' = 'normative';

  const layoutPage = pages.find(page =>
    page.items.some(item => /^№\s*/u.test(normalizeWhitespace(item.str))) &&
    page.items.some(item => /^Кафедра\b/u.test(normalizeWhitespace(item.str))),
  );
  const layoutHeader = layoutPage?.items.find(item => /^№\s*/u.test(normalizeWhitespace(item.str)));
  const layoutDepartment = layoutPage?.items.find(item => /^Кафедра\b/u.test(normalizeWhitespace(item.str)));
  const tableStartRatio = layoutPage && layoutHeader ? layoutHeader.x / layoutPage.width : 0.378;
  const departmentStartRatio = layoutPage && layoutDepartment ? layoutDepartment.x / layoutPage.width : 0.535;

  for (const page of pages) {
    const tableStart = page.width * tableStartRatio;
    const departmentStart = page.width * departmentStartRatio;
    const tolerance = page.width * 0.012;

    const isRecordStart = (item: PositionedPDFText) => {
      if (Math.abs(item.x - tableStart) > tolerance) return false;
      const match = normalizeWhitespace(item.str).match(/^(\d{1,3})(?:\s+.*)?$/u);
      if (!match) return false;
      const number = Number.parseInt(match[1], 10);
      return number > 0 && number < 300;
    };

    for (let index = 0; index < page.items.length; index += 1) {
      const item = page.items[index];
      const headingCategory = categoryFromHeading(item.str);
      if (headingCategory) {
        category = headingCategory;
        continue;
      }
      if (!isRecordStart(item)) continue;

      let end = index + 1;
      while (
        end < page.items.length &&
        !isRecordStart(page.items[end]) &&
        !categoryFromHeading(page.items[end].str)
      ) {
        end += 1;
      }

      const subject = parsePositionedSubject(
        page.items.slice(index, end),
        tableStart,
        departmentStart,
        category,
        page.width,
      );

      if (subject) {
        const key = `${subject.number}|${subject.semester}|${normalizeLabel(subject.name)}`;
        if (!seen.has(key)) {
          seen.add(key);
          subjects.push(subject);
        }
      }

      index = end - 1;
    }
  }

  return subjects;
}

function extractSubjectsFromLinearText(text: string): INPSubject[] {
  const subjects: INPSubject[] = [];
  const normalized = normalizeWhitespace(text);
  const selectiveIndex = normalized.search(/\b(?:Обрані|Вибіркові)\b/iu);
  const recordRegex = /(?:^|\s)(\d{1,3})\s+(.+?)\s+([А-ЯІЇЄҐA-Z][А-ЯІЇЄҐA-Z0-9.-]{0,15})\s+(\d{1,2})\s+(\d+(?:[.,]\d+)?)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(.+?)\s+(\d+|-)\s+([А-ЯІЇЄҐA-Z0-9.-]+|-)(?=\s+(?:\d{1,3}\s+|Обрані\b|Вибіркові\b|Всього:|$))/giu;

  for (const match of normalized.matchAll(recordRegex)) {
    const number = Number.parseInt(match[1], 10);
    const semester = Number.parseInt(match[4], 10);
    const name = normalizeWhitespace(match[2]);
    if (!name || semester < 1 || semester > 12) continue;

    subjects.push({
      id: `custom-s-${number}`,
      number,
      name,
      cleanName: cleanSubjectName(name),
      category: selectiveIndex >= 0 && (match.index ?? 0) > selectiveIndex ? 'selective' : 'normative',
      department: match[3],
      semester,
      credits: Number.parseFloat(match[5].replace(',', '.')),
      hours: Number.parseInt(match[6], 10),
      lectures: Number.parseInt(match[7], 10),
      practices: Number.parseInt(match[8], 10),
      labs: Number.parseInt(match[9], 10),
      selfStudy: Number.parseInt(match[10], 10),
      control: normalizeWhitespace(match[11]),
      mkr: match[12] === '-' ? 0 : Number.parseInt(match[12], 10),
      individualTask: match[13],
    });
  }

  return subjects;
}

function extractMetadataFromText(text: string): Partial<INPMetadata> {
  const normalized = normalizeWhitespace(text);
  const value = (pattern: RegExp) => normalizeWhitespace(normalized.match(pattern)?.[1] ?? '');
  const courseText = value(/\bКурс\s+(\d{1,2})\b/iu);

  return {
    studentName: value(/\bЗдобувач\s+((?:[А-ЯІЇЄҐ][а-яіїєґ'’.-]+\s+){1,3}[А-ЯІЇЄҐ][а-яіїєґ'’.-]+)/u),
    group: value(/\bНавчальна\s+група\s+([А-ЯІЇЄҐA-Z0-9–—-]+)/iu),
    academicYear: value(/\bНавчальний\s+рік\s+(\d{4}\s*[/–—-]\s*\d{4})/iu),
    course: courseText ? Number.parseInt(courseText, 10) : undefined,
    department: value(/\bКафедра\s+(.+?)(?=\s+Факультет\/Інститут\b)/iu),
    faculty: value(/\bФакультет\/Інститут\s+(.+?)(?=\s+Форма\s+навчання\b)/iu),
    educationForm: value(/\bФорма\s+навчання\s+(.+?)(?=\s+Рівень\s+вищ)/iu),
    educationLevel: value(/\bРівень\s+вищ[ооїі]+\s+освіти\s+(.+?)(?=\s+Спеціальність\b)/iu),
    specialty: value(/\bСпеціальність\s+(.+?)(?=\s+Освітня\s+програма\b)/iu),
    studyProgram: value(/\bОсвітня\s+програма\s+(.+?)(?=\s+(?:Здобувач|№)\b)/iu),
  };
}

function buildINPData(
  metadata: Partial<INPMetadata>,
  subjects: INPSubject[],
  fileName: string,
): INPData {
  const resolved = { ...defaultMetadata, ...metadata };

  return {
    ...resolved,
    totalCredits: subjects.reduce((sum, subject) => sum + subject.credits, 0),
    subjects,
    fileName,
    uploadDate: new Date().toLocaleDateString('uk-UA'),
  };
}

export function extractDataFromPages(
  pages: ExtractedPDFPage[],
  fileName: string = 'ІНП.pdf',
): INPData {
  const fullText = pages
    .map(page => page.items.map(item => item.str).join(' '))
    .join('\n');
  const positionedSubjects = extractSubjectsFromPages(pages);
  const subjects = positionedSubjects.length > 0
    ? positionedSubjects
    : extractSubjectsFromLinearText(fullText);
  const metadata = {
    ...extractMetadataFromText(fullText),
    ...extractMetadataFromPages(pages),
  };

  return buildINPData(metadata, subjects, fileName);
}

export function extractDataFromText(text: string, fileName: string = 'ІНП.pdf'): INPData {
  return buildINPData(
    extractMetadataFromText(text),
    extractSubjectsFromLinearText(text),
    fileName,
  );
}
