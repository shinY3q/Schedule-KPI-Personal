import type { INPData, INPSubject } from '../types/inp';

const SELECTIVE_CATEGORY_NAMES = new Set([
  'selective',
  'selected',
  'обрані',
  'вибіркові',
]);

const METADATA_LEAKAGE_MARKERS = [
  /Кафедра/iu,
  /Факультет\s*\/\s*Інститут/iu,
  /Форма\s+навчання/iu,
  /Рівень\s+вищ/iu,
  /Спеціальність/iu,
  /Освітня\s+програма/iu,
];

function hasSelectiveMarker(value: string | undefined): boolean {
  return /\(\s*Ф\s*\d+\s+Б(?:\s|\))/iu.test(value ?? '');
}

function isSelectiveSubject(subject: INPSubject): boolean {
  const storedCategory = String(subject.category ?? '').trim().toLocaleLowerCase('uk-UA');

  return SELECTIVE_CATEGORY_NAMES.has(storedCategory)
    || hasSelectiveMarker(subject.name)
    || hasSelectiveMarker(subject.cleanName);
}

function repairLeakedSubjectMetadata(subject: INPSubject): INPSubject {
  const markerCount = METADATA_LEAKAGE_MARKERS.reduce(
    (count, marker) => count + Number(marker.test(subject.name)),
    0,
  );
  if (markerCount < 3) return subject;

  const embeddedSubject = subject.name.match(
    /(?:^|\s)(Нормативні|Обрані|Вибіркові)\s+(\d{1,3})\s+(.+)$/iu,
  );
  if (!embeddedSubject) return subject;

  const name = embeddedSubject[3].trim();
  if (name.length < 3) return subject;

  const number = Number.parseInt(embeddedSubject[2], 10);
  const category: INPSubject['category'] = /^Нормативні$/iu.test(embeddedSubject[1])
    ? 'normative'
    : 'selective';

  return {
    ...subject,
    id: /^custom-s-\d+$/u.test(subject.id) ? `custom-s-${number}` : subject.id,
    number,
    name,
    cleanName: name.replace(/\(\s*Ф\s*\d+\s+Б[^)]*\)/giu, '').trim(),
    category,
  };
}

/**
 * Updates older cached INP records using only category data and elective markers
 * that are actually present in the uploaded document.
 */
export function normalizeINPData(data: INPData): INPData {
  let changed = false;
  const normalizedSubjects = data.subjects.map(subject => {
    const repairedSubject = repairLeakedSubjectMetadata(subject);
    const category: INPSubject['category'] = isSelectiveSubject(repairedSubject)
      ? 'selective'
      : 'normative';
    if (repairedSubject === subject && subject.category === category) return subject;

    changed = true;
    return { ...repairedSubject, category };
  });

  const seen = new Set<string>();
  const subjects = normalizedSubjects.filter(subject => {
    const key = `${subject.number}|${subject.semester}|${subject.name.toLocaleLowerCase('uk-UA')}`;
    if (seen.has(key)) {
      changed = true;
      return false;
    }
    seen.add(key);
    return true;
  });

  return changed
    ? {
        ...data,
        subjects,
        totalCredits: subjects.reduce((sum, subject) => sum + subject.credits, 0),
      }
    : data;
}
