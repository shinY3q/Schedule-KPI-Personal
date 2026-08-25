import type { INPData, INPSubject } from '../types/inp';

const SELECTIVE_CATEGORY_NAMES = new Set([
  'selective',
  'selected',
  'обрані',
  'вибіркові',
]);

function hasSelectiveMarker(value: string | undefined): boolean {
  return /\(\s*Ф\s*\d+\s+Б(?:\s|\))/iu.test(value ?? '');
}

function isSelectiveSubject(subject: INPSubject): boolean {
  const storedCategory = String(subject.category ?? '').trim().toLocaleLowerCase('uk-UA');

  return SELECTIVE_CATEGORY_NAMES.has(storedCategory)
    || hasSelectiveMarker(subject.name)
    || hasSelectiveMarker(subject.cleanName);
}

/**
 * Updates older cached INP records using only category data and elective markers
 * that are actually present in the uploaded document.
 */
export function normalizeINPData(data: INPData): INPData {
  let changed = false;
  const subjects = data.subjects.map(subject => {
    const category: INPSubject['category'] = isSelectiveSubject(subject)
      ? 'selective'
      : 'normative';
    if (subject.category === category) return subject;

    changed = true;
    return { ...subject, category };
  });

  return changed ? { ...data, subjects } : data;
}
