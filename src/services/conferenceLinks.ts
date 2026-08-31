import type { INPSubject } from '../types/inp';
import type { LessonType } from '../types/schedule';

export const CONFERENCE_LINKS_STORAGE_KEY = 'kpi_subject_conference_links';

export type ConferenceLinkType = 'lecture' | 'practice';
export type ConferenceLinkMode = 'shared' | 'separate';

export interface SubjectConferenceLinkSet {
  mode: ConferenceLinkMode;
  shared?: string;
  lecture?: string;
  practice?: string;
}

export type SubjectConferenceLinks = Record<string, SubjectConferenceLinkSet>;

export const CONFERENCE_LINK_TYPES: ConferenceLinkType[] = ['lecture', 'practice'];

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

export const normalizeSubjectConferenceLinkSet = (value: unknown): SubjectConferenceLinkSet => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { mode: 'shared' };
  }

  const storedLinks = value as Record<string, unknown>;
  const shared = typeof storedLinks.shared === 'string'
    ? normalizeConferenceUrl(storedLinks.shared) ?? undefined
    : undefined;
  const lecture = typeof storedLinks.lecture === 'string'
    ? normalizeConferenceUrl(storedLinks.lecture) ?? undefined
    : undefined;
  const practice = typeof storedLinks.practice === 'string'
    ? normalizeConferenceUrl(storedLinks.practice) ?? undefined
    : undefined;
  const mode: ConferenceLinkMode = storedLinks.mode === 'shared' || storedLinks.mode === 'separate'
    ? storedLinks.mode
    : shared
      ? 'shared'
      : lecture || practice
        ? 'separate'
        : 'shared';

  return { mode, shared, lecture, practice };
};

export const normalizeConferenceLinksStorage = (value: unknown): SubjectConferenceLinks => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};

  const normalized: SubjectConferenceLinks = {};

  Object.entries(value).forEach(([subjectKey, storedValue]) => {
    if (typeof storedValue === 'string') {
      const legacyUrl = normalizeConferenceUrl(storedValue);
      if (legacyUrl) {
        // Before separate lesson links existed, one URL applied to every lesson.
        normalized[subjectKey] = { mode: 'shared', shared: legacyUrl };
      }
      return;
    }

    const storedLinks = normalizeSubjectConferenceLinkSet(storedValue);

    if (storedLinks.shared || storedLinks.lecture || storedLinks.practice) {
      normalized[subjectKey] = storedLinks;
    }
  });

  return normalized;
};

export const getSubjectConferenceLinks = (
  links: SubjectConferenceLinks,
  subject?: INPSubject,
): SubjectConferenceLinkSet => {
  if (!subject) return { mode: 'shared' };

  const storedLinks = links[getSubjectConferenceKey(subject)];
  return normalizeSubjectConferenceLinkSet(storedLinks);
};

export const getConferenceLinkFromSet = (
  links: SubjectConferenceLinkSet,
  type: ConferenceLinkType,
): string | undefined => links.mode === 'shared' ? links.shared : links[type];

export const getActiveConferenceLinksCount = (links: SubjectConferenceLinkSet): number =>
  links.mode === 'shared'
    ? Number(Boolean(links.shared))
    : Number(Boolean(links.lecture)) + Number(Boolean(links.practice));

export const hasActiveConferenceLinks = (links: SubjectConferenceLinkSet): boolean =>
  getActiveConferenceLinksCount(links) > 0;

export const getSubjectConferenceLink = (
  links: SubjectConferenceLinks,
  subject?: INPSubject,
  type: ConferenceLinkType = 'lecture',
): string | undefined => {
  return getConferenceLinkFromSet(getSubjectConferenceLinks(links, subject), type);
};

export const getConferenceLinkTypeForLesson = (lessonType: LessonType): ConferenceLinkType =>
  lessonType === 'lecture' ? 'lecture' : 'practice';
