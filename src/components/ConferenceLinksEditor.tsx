import React, { useEffect, useId, useRef, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  CircleAlert,
  Copy,
  ExternalLink,
  Link2,
  LockKeyhole,
  Plus,
  Save,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';
import type { INPSubject } from '../types/inp';
import {
  CONFERENCE_LINK_TYPES,
  normalizeConferenceUrl,
  type ConferenceLinkMode,
  type ConferenceLinkType,
  type SubjectConferenceLinkSet,
} from '../services/conferenceLinks';

interface ConferenceLinksEditorProps {
  subject: INPSubject;
  links: SubjectConferenceLinkSet;
  preferredType?: ConferenceLinkType;
  onUpdateConferenceLinks: (subject: INPSubject, links: SubjectConferenceLinkSet) => void;
}

type LinkSlot = 'shared' | ConferenceLinkType;
type LinkDrafts = Record<LinkSlot, string>;
type LinkErrors = Partial<Record<LinkSlot, string>>;
type Feedback = { tone: 'success' | 'error'; message: string } | null;

const SLOT_META: Record<LinkSlot, {
  label: string;
  description: string;
  Icon: LucideIcon;
  iconClassName: string;
  selectedClassName?: string;
}> = {
  shared: {
    label: 'Усі заняття',
    description: 'Лекції, практики й лабораторні',
    Icon: Link2,
    iconClassName: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
  },
  lecture: {
    label: 'Лекція',
    description: 'Тільки лекційні заняття',
    Icon: BookOpen,
    iconClassName: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300',
    selectedClassName: 'border-purple-300 bg-purple-50 text-purple-800 dark:border-purple-700 dark:bg-purple-950/60 dark:text-purple-200',
  },
  practice: {
    label: 'Практика',
    description: 'Практичні й лабораторні заняття',
    Icon: UsersRound,
    iconClassName: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    selectedClassName: 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200',
  },
};

const hasAnyStoredLink = (links: SubjectConferenceLinkSet): boolean =>
  Boolean(links.shared || links.lecture || links.practice);

const copyText = async (value: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return true;
    }
  } catch {
    // Continue with the Safari/older-browser fallback below.
  }

  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const copied = document.execCommand('copy');
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
};

export const ConferenceLinksEditor: React.FC<ConferenceLinksEditorProps> = ({
  subject,
  links,
  preferredType = 'lecture',
  onUpdateConferenceLinks,
}) => {
  const [isEditing, setIsEditing] = useState(() => hasAnyStoredLink(links));
  const [draftMode, setDraftMode] = useState<ConferenceLinkMode>(links.mode);
  const [drafts, setDrafts] = useState<LinkDrafts>({
    shared: links.shared ?? '',
    lecture: links.lecture ?? '',
    practice: links.practice ?? '',
  });
  const [addingType, setAddingType] = useState<ConferenceLinkType | null>(null);
  const [errors, setErrors] = useState<LinkErrors>({});
  const [feedback, setFeedback] = useState<Feedback>(null);
  const editorId = useId();
  const sharedInputRef = useRef<HTMLInputElement>(null);
  const lectureInputRef = useRef<HTMLInputElement>(null);
  const practiceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setDraftMode(links.mode);
    setDrafts({
      shared: links.shared ?? '',
      lecture: links.lecture ?? '',
      practice: links.practice ?? '',
    });
    setIsEditing((current) => current || hasAnyStoredLink(links));
  }, [links.mode, links.shared, links.lecture, links.practice]);

  const inputRefs: Record<LinkSlot, React.RefObject<HTMLInputElement | null>> = {
    shared: sharedInputRef,
    lecture: lectureInputRef,
    practice: practiceInputRef,
  };
  const visibleSpecificTypes = CONFERENCE_LINK_TYPES.filter(
    (type) => Boolean(links[type]) || Boolean(drafts[type]) || addingType === type,
  );
  const missingSpecificTypes = CONFERENCE_LINK_TYPES.filter(
    (type) => !visibleSpecificTypes.includes(type),
  );
  const selectableSpecificTypes = CONFERENCE_LINK_TYPES.filter(
    (type) => !links[type] && (!drafts[type] || addingType === type),
  );
  const hasInactiveLinks = draftMode === 'shared'
    ? Boolean(links.lecture || links.practice)
    : Boolean(links.shared);

  const focusSlot = (slot: LinkSlot) => {
    requestAnimationFrame(() => inputRefs[slot].current?.focus());
  };

  const startEditing = () => {
    setIsEditing(true);
    setErrors({});
    setFeedback(null);

    if (draftMode === 'shared') {
      focusSlot('shared');
      return;
    }

    const nextType = visibleSpecificTypes[0] ?? preferredType;
    setAddingType(visibleSpecificTypes.length === 0 ? nextType : null);
    focusSlot(nextType);
  };

  const handleModeChange = (mode: ConferenceLinkMode) => {
    setDraftMode(mode);
    setErrors({});
    setFeedback(null);

    if (mode === 'shared') {
      setAddingType(null);
      focusSlot('shared');
      return;
    }

    const nextType = visibleSpecificTypes[0] ?? preferredType;
    setAddingType(visibleSpecificTypes.length === 0 ? nextType : null);
    focusSlot(nextType);
  };

  const startAddingSpecific = () => {
    const nextType = missingSpecificTypes.includes(preferredType)
      ? preferredType
      : missingSpecificTypes[0];
    if (!nextType) return;

    setAddingType(nextType);
    setErrors({});
    setFeedback(null);
    focusSlot(nextType);
  };

  const handleDraftChange = (slot: LinkSlot, value: string) => {
    setDrafts((current) => ({ ...current, [slot]: value }));
    setErrors((current) => ({ ...current, [slot]: undefined }));
    setFeedback(null);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const activeSlots: LinkSlot[] = draftMode === 'shared'
      ? ['shared']
      : visibleSpecificTypes;

    if (activeSlots.length === 0) {
      startAddingSpecific();
      setFeedback({ tone: 'error', message: 'Додайте посилання для лекції або практики.' });
      return;
    }

    const nextErrors: LinkErrors = {};
    const normalizedValues: Partial<Record<LinkSlot, string | null>> = {};

    activeSlots.forEach((slot) => {
      const value = drafts[slot].trim();
      if (!value) {
        if (links[slot]) {
          normalizedValues[slot] = null;
        } else {
          nextErrors[slot] = `Вставте посилання для «${SLOT_META[slot].label}».`;
        }
        return;
      }

      const normalized = normalizeConferenceUrl(value);
      if (!normalized) {
        nextErrors[slot] = 'Введіть коректне HTTP/HTTPS-посилання.';
        return;
      }

      normalizedValues[slot] = normalized;
    });

    const firstInvalidSlot = activeSlots.find((slot) => nextErrors[slot]);
    if (firstInvalidSlot) {
      setErrors(nextErrors);
      setFeedback(null);
      inputRefs[firstInvalidSlot].current?.focus();
      return;
    }

    const nextLinks: SubjectConferenceLinkSet = { ...links, mode: draftMode };
    activeSlots.forEach((slot) => {
      const normalized = normalizedValues[slot];
      if (normalized === null) {
        delete nextLinks[slot];
      } else if (normalized) {
        nextLinks[slot] = normalized;
      }
    });

    onUpdateConferenceLinks(subject, nextLinks);
    setDrafts((current) => {
      const next = { ...current };
      activeSlots.forEach((slot) => {
        next[slot] = normalizedValues[slot] ?? '';
      });
      return next;
    });
    setAddingType(null);
    setErrors({});
    setFeedback({ tone: 'success', message: 'Налаштування посилань збережено на цьому пристрої.' });
  };

  const handleCopy = async (slot: LinkSlot) => {
    const normalized = normalizeConferenceUrl(drafts[slot]);
    if (!normalized) return;

    const copied = await copyText(normalized);
    setFeedback(
      copied
        ? { tone: 'success', message: `Посилання «${SLOT_META[slot].label}» скопійовано.` }
        : { tone: 'error', message: 'Не вдалося скопіювати. Виділіть посилання вручну.' },
    );
  };

  const renderLinkField = (slot: LinkSlot) => {
    const meta = SLOT_META[slot];
    const normalizedDraft = normalizeConferenceUrl(drafts[slot]);
    const fieldError = errors[slot];
    const isNew = !links[slot];

    return (
      <div key={slot} className="rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900/70 sm:p-4">
        <div className="grid min-w-0 grid-cols-1 gap-3 xl:grid-cols-[10rem_minmax(0,1fr)_auto_auto] xl:items-start">
          <label htmlFor={`${editorId}-${slot}`} className="flex min-h-11 items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
            <span className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${meta.iconClassName}`}>
              <meta.Icon aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block">{meta.label}</span>
              <span className="block text-[10px] font-medium leading-snug text-slate-400 dark:text-slate-500">
                {isNew ? meta.description : 'Посилання збережено'}
              </span>
            </span>
          </label>

          <div className="min-w-0">
            <div className="relative">
              <Link2 aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                ref={inputRefs[slot]}
                id={`${editorId}-${slot}`}
                type="url"
                inputMode="url"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                value={drafts[slot]}
                onChange={(event) => handleDraftChange(slot, event.target.value)}
                onBlur={() => {
                  if (drafts[slot].trim() && !normalizeConferenceUrl(drafts[slot])) {
                    setErrors((current) => ({ ...current, [slot]: 'Введіть коректне HTTP/HTTPS-посилання.' }));
                  }
                }}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? `${editorId}-${slot}-error` : `${editorId}-${slot}-hint`}
                placeholder="https://zoom.us/j/..."
                className={`min-h-11 w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-base text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 sm:text-sm ${
                  fieldError
                    ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700'
                    : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:focus:border-blue-500'
                }`}
              />
            </div>
            {fieldError ? (
              <p id={`${editorId}-${slot}-error`} role="alert" className="mt-1.5 text-xs font-medium text-red-600 dark:text-red-400">
                {fieldError}
              </p>
            ) : (
              <p id={`${editorId}-${slot}-hint`} className="sr-only">{meta.description}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleCopy(slot)}
            disabled={!normalizedDraft}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/50"
          >
            <Copy aria-hidden="true" className="h-4 w-4" />
            Копіювати
          </button>

          {normalizedDraft ? (
            <a
              href={normalizedDraft}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-50 active:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300 dark:hover:border-blue-700 dark:hover:bg-blue-950/50 dark:focus-visible:ring-offset-slate-900"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Відкрити
            </a>
          ) : (
            <button
              type="button"
              disabled
              className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-blue-700 opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-blue-300"
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Відкрити
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      {!isEditing ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-6 text-center dark:border-slate-700 dark:bg-slate-900/30">
          <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <Link2 aria-hidden="true" className="h-5 w-5" />
          </div>
          <h4 className="mt-3 text-sm font-bold text-slate-900 dark:text-slate-100">
            Посилання ще не додано
          </h4>
          <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Можна використати одну адресу для всіх занять або окремі — для лекцій і практик.
          </p>
          <button
            type="button"
            onClick={startEditing}
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Plus aria-hidden="true" className="h-4 w-4" />
            Додати посилання
          </button>
        </div>
      ) : (
        <>
          <fieldset>
            <legend className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Як використовувати посилання?
            </legend>
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleModeChange('shared')}
                aria-pressed={draftMode === 'shared'}
                className={`min-h-14 rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  draftMode === 'shared'
                    ? 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-600 dark:bg-blue-950/50 dark:text-blue-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/25'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <Link2 aria-hidden="true" className="h-4 w-4" />
                  Одне для всіх
                </span>
                <span className="mt-1 block text-[11px] font-medium leading-relaxed opacity-70">
                  Одна адреса для лекцій, практик і лабораторних.
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleModeChange('separate')}
                aria-pressed={draftMode === 'separate'}
                className={`min-h-14 rounded-2xl border px-3 py-3 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                  draftMode === 'separate'
                    ? 'border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-600 dark:bg-blue-950/50 dark:text-blue-100'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/25'
                }`}
              >
                <span className="flex items-center gap-2 text-xs font-bold">
                  <BookOpen aria-hidden="true" className="h-4 w-4" />
                  Окремі посилання
                </span>
                <span className="mt-1 block text-[11px] font-medium leading-relaxed opacity-70">
                  Різні адреси для лекцій та практик.
                </span>
              </button>
            </div>
          </fieldset>

          {hasInactiveLinks && draftMode !== links.mode && (
            <p className="rounded-xl bg-slate-100 px-3 py-2 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              Збережені адреси іншого режиму не видаляються. Вони знову з’являться, якщо повернути цей режим.
            </p>
          )}

          {draftMode === 'shared' ? (
            renderLinkField('shared')
          ) : (
            <div className="space-y-3">
              {addingType && selectableSpecificTypes.length > 0 && (
                <fieldset className="rounded-2xl border border-blue-200 bg-blue-50/60 p-3 dark:border-blue-900/70 dark:bg-blue-950/25 sm:p-4">
                  <legend className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    Для якого заняття посилання?
                  </legend>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Для лабораторних використовується адреса практики.
                  </p>
                  <div className={`mt-3 grid gap-2 ${selectableSpecificTypes.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    {selectableSpecificTypes.map((type) => {
                      const meta = SLOT_META[type];
                      const isSelected = addingType === type;
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setAddingType(type);
                            setErrors({});
                            setFeedback(null);
                            focusSlot(type);
                          }}
                          aria-pressed={isSelected}
                          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
                            isSelected
                              ? meta.selectedClassName
                              : 'border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-blue-800 dark:hover:bg-blue-950/40'
                          }`}
                        >
                          <meta.Icon aria-hidden="true" className="h-4 w-4" />
                          {meta.label}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              )}

              {visibleSpecificTypes.map((type) => renderLinkField(type))}

              {missingSpecificTypes.length > 0 && !addingType && (
                <button
                  type="button"
                  onClick={startAddingSpecific}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-xs font-bold text-blue-700 transition-colors hover:border-blue-300 hover:bg-blue-100 active:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-950"
                >
                  <Plus aria-hidden="true" className="h-4 w-4" />
                  Додати ще одне посилання
                </button>
              )}
            </div>
          )}
        </>
      )}

      {isEditing && (
        <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-2">
            <div
              role={feedback?.tone === 'error' ? 'alert' : 'status'}
              aria-live={feedback?.tone === 'error' ? 'assertive' : 'polite'}
              className={`flex min-h-5 items-center gap-2 text-xs font-semibold ${
                feedback?.tone === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : feedback
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-slate-500 dark:text-slate-400'
              }`}
            >
              {feedback && (
                feedback.tone === 'error'
                  ? <CircleAlert aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
                  : <CheckCircle2 aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
              )}
              {feedback?.message ?? 'Режим і адреси зміняться лише після збереження.'}
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500">
              <LockKeyhole aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0" />
              Посилання зберігаються лише у цьому браузері.
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
          >
            <Save aria-hidden="true" className="h-4 w-4" />
            Зберегти
          </button>
        </div>
      )}
    </form>
  );
};
