import type { INPSubject } from '../types/inp';

export const CONFERENCE_LINKS_STORAGE_KEY = 'kpi_subject_conference_links';

export type SubjectConferenceLinks = Record<string, string>;

const normalizeKeyPart = (value: string): string =>
  value.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('uk-UA');

export const getSubjectConferenceKey = (subject: INPSubject): string =>
  [subject.semester, normalizeKeyPart(subject.department), normalizeKeyPart(subject.cleanName || subject.name)].join('|');

export const normalizeConferenceUrl = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const candidate = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const url = new URL(candidate);
    if (!['https:', 'http:'].includes(url.protocol) || !url.hostname) return null;
    if (url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
};

export const getSubjectConferenceLink = (
  links: SubjectConferenceLinks,
  subject?: INPSubject,
): string | undefined => {
  if (!subject) return undefined;
  return normalizeConferenceUrl(links[getSubjectConferenceKey(subject)] ?? '') ?? undefined;
};
