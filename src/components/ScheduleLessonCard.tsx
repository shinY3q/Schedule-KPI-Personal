import React, { useEffect, useId, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Copy,
  CircleAlert,
  ExternalLink,
  Info,
  Link2,
  MapPin,
  Save,
  User,
  Video,
  Clock,
} from 'lucide-react';
import type { INPSubject } from '../types/inp';
import type { ProcessedLesson } from '../types/schedule';
import { normalizeConferenceUrl } from '../services/conferenceLinks';

interface ScheduleLessonCardProps {
  lesson: ProcessedLesson;
  conferenceUrl?: string;
  onSelectSubject: (subject: INPSubject) => void;
  onSaveConferenceUrl: (subject: INPSubject, url: string) => void;
  onRemoveConferenceUrl: (subject: INPSubject) => void;
}

type Feedback = {
  tone: 'success' | 'error';
  message: string;
} | null;

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

export const ScheduleLessonCard: React.FC<ScheduleLessonCardProps> = ({
  lesson,
  conferenceUrl,
  onSelectSubject,
  onSaveConferenceUrl,
  onRemoveConferenceUrl,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [conferenceInput, setConferenceInput] = useState(conferenceUrl ?? '');
  const [conferenceError, setConferenceError] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setConferenceInput(conferenceUrl ?? '');
  }, [conferenceUrl]);

  const subject = lesson.matchedSubject;
  const normalizedDraft = normalizeConferenceUrl(conferenceInput);
  const hasSavedLink = Boolean(conferenceUrl);

  const typeColorClass =
    lesson.lessonType === 'lecture'
      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
      : lesson.lessonType === 'practice'
      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!subject) return;

    if (!conferenceInput.trim()) {
      if (hasSavedLink) {
        onRemoveConferenceUrl(subject);
        setConferenceError('');
        setFeedback({ tone: 'success', message: 'Онлайн-посилання видалено.' });
      } else {
        setConferenceError('Вставте посилання на конференцію перед збереженням.');
        setFeedback(null);
        inputRef.current?.focus();
      }
      return;
    }

    if (!normalizedDraft) {
      setConferenceError('Введіть коректне HTTP/HTTPS-посилання на конференцію.');
      setFeedback(null);
      inputRef.current?.focus();
      return;
    }

    onSaveConferenceUrl(subject, normalizedDraft);
    setConferenceInput(normalizedDraft);
    setConferenceError('');
    setFeedback({ tone: 'success', message: 'Посилання збережено на цьому пристрої.' });
  };

  const handleCopy = async () => {
    if (!normalizedDraft) return;
    const copied = await copyText(normalizedDraft);
    setFeedback(
      copied
        ? { tone: 'success', message: 'Посилання скопійовано.' }
        : { tone: 'error', message: 'Не вдалося скопіювати. Виділіть посилання вручну.' },
    );
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-slate-50/60 transition-[border-color,background-color,box-shadow] duration-200 dark:bg-slate-800/60 ${
        isExpanded
          ? 'border-blue-300 bg-white shadow-md dark:border-blue-500/50 dark:bg-slate-800'
          : 'border-slate-200/80 hover:border-blue-300 hover:bg-white hover:shadow-sm dark:border-slate-750 dark:hover:border-blue-500/50 dark:hover:bg-slate-800'
      }`}
    >
      <div className="flex flex-col gap-4 p-4 sm:p-5 lg:flex-row lg:items-center">
        <div className="flex-shrink-0 lg:w-36">
          <div className="flex items-center gap-2 text-xs font-extrabold text-slate-800 dark:text-slate-100 sm:text-sm">
            <Clock aria-hidden="true" className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400 sm:h-4 sm:w-4" />
            <span className="tabular-nums">
              {lesson.timeEnd ? `${lesson.timeStart} – ${lesson.timeEnd}` : lesson.timeStart}
            </span>
          </div>
          <div className="mt-0.5 pl-5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 sm:pl-6 sm:text-[11px]">
            {lesson.pairNumber}-а пара
          </div>
        </div>

        <div className="min-w-0 flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`rounded-lg border px-2.5 py-0.5 text-xs font-bold transition-colors duration-200 ${typeColorClass}`}>
              {lesson.lessonTypeLabel}
            </span>
            {subject?.category === 'selective' && (
              <span className="rounded-md border border-blue-200 bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
                Вибіркова (ІНП)
              </span>
            )}
          </div>

          <div className="flex min-w-0 items-start gap-2">
            <h3 className="min-w-0 flex-1 text-base font-bold leading-snug text-slate-900 dark:text-slate-100">
              {lesson.subjectName}
            </h3>
            {subject && (
              <button
                type="button"
                onClick={() => onSelectSubject(subject)}
                aria-label={`Відкрити інформацію про дисципліну ${lesson.subjectName}`}
                title="Інформація про дисципліну"
                className="-my-2 inline-flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition-colors duration-150 hover:bg-blue-50 hover:text-blue-700 active:bg-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-400 dark:hover:bg-blue-950/60 dark:hover:text-blue-300"
              >
                <Info aria-hidden="true" className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex min-w-0 items-center gap-1.5">
              <MapPin aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{lesson.location || 'Не вказано'}</span>
            </div>
            <div className="flex min-w-0 items-center gap-1.5">
              <User aria-hidden="true" className="h-3.5 w-3.5 flex-shrink-0 text-slate-400 dark:text-slate-500" />
              <span className="min-w-0 [overflow-wrap:anywhere]">{lesson.lecturerName || 'Не вказано'}</span>
            </div>
          </div>
        </div>

        {subject && (
          <div className="flex items-center gap-2 border-t border-slate-200/70 pt-3 dark:border-slate-700/70 lg:border-0 lg:pt-0">
            <div className="flex min-w-0 flex-1 items-center gap-2 lg:min-w-40 lg:flex-none">
              <span
                className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                  hasSavedLink
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-750 dark:text-slate-400'
                }`}
              >
                <Video aria-hidden="true" className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-xs font-bold text-slate-800 dark:text-slate-200">
                  Онлайн-конференція
                </span>
                <span className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${hasSavedLink ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {hasSavedLink && <CheckCircle2 aria-hidden="true" className="h-3 w-3" />}
                  {hasSavedLink ? 'Посилання додано' : 'Посилання не додано'}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsExpanded((current) => !current);
                setConferenceError('');
                setFeedback(null);
              }}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-label={`${isExpanded ? 'Згорнути' : 'Розгорнути'} онлайн-посилання для ${lesson.subjectName}`}
              className="inline-flex min-h-11 min-w-11 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-colors duration-150 hover:bg-blue-100 hover:text-blue-700 active:bg-blue-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:bg-slate-750 dark:text-slate-400 dark:hover:bg-blue-950 dark:hover:text-blue-300"
            >
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${isExpanded ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}
      </div>

      {subject && isExpanded && (
        <form
          id={panelId}
          onSubmit={handleSubmit}
          noValidate
          className="animate-slide-up border-t border-slate-200/80 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-900/35 sm:p-5"
        >
          <div className="space-y-2">
            <label htmlFor={`${panelId}-input`} className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              Онлайн-посилання
            </label>
            <div className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-[minmax(0,1fr)_auto_auto]">
              <div className="relative min-w-0">
                <Link2 aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                <input
                  ref={inputRef}
                  id={`${panelId}-input`}
                  type="url"
                  inputMode="url"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={conferenceInput}
                  onChange={(event) => {
                    setConferenceInput(event.target.value);
                    setConferenceError('');
                    setFeedback(null);
                  }}
                  onBlur={() => {
                    if (conferenceInput.trim() && !normalizeConferenceUrl(conferenceInput)) {
                      setConferenceError('Введіть коректне HTTP/HTTPS-посилання на конференцію.');
                    }
                  }}
                  aria-invalid={Boolean(conferenceError)}
                  aria-describedby={conferenceError ? `${panelId}-error` : `${panelId}-help`}
                  placeholder="https://zoom.us/j/..."
                  className={`min-h-11 w-full rounded-xl border bg-white py-2.5 pl-10 pr-3 text-base text-slate-900 outline-none transition-[border-color,box-shadow] placeholder:text-slate-400 focus:ring-2 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-600 sm:text-sm ${
                    conferenceError
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20 dark:border-red-700'
                      : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 dark:border-slate-700 dark:focus:border-blue-500'
                  }`}
                />
              </div>

              <button
                type="button"
                onClick={handleCopy}
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

            {conferenceError ? (
              <p id={`${panelId}-error`} role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                {conferenceError}
              </p>
            ) : (
              <p id={`${panelId}-help`} className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                {hasSavedLink
                  ? 'Змініть адресу та збережіть. Щоб видалити посилання, очистьте поле й натисніть «Зберегти».'
                  : 'Вставте посилання Zoom, Google Meet, Microsoft Teams або іншого сервісу.'}
              </p>
            )}
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-200/70 pt-4 dark:border-slate-700/70 sm:flex-row sm:items-center sm:justify-between">
            <div
              role={feedback?.tone === 'error' ? 'alert' : 'status'}
              aria-live={feedback?.tone === 'error' ? 'assertive' : 'polite'}
              className={`flex min-h-5 items-center gap-2 text-xs font-semibold ${
                feedback?.tone === 'error'
                  ? 'text-red-600 dark:text-red-400'
                  : feedback
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {feedback && (
                feedback.tone === 'error'
                  ? <CircleAlert aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
                  : <CheckCircle2 aria-hidden="true" className="h-4 w-4 flex-shrink-0" />
              )}
              {feedback?.message ?? 'Посилання зберігається лише у цьому браузері.'}
            </div>

            <button
              type="submit"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/20 transition-colors hover:bg-blue-700 active:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
            >
              <Save aria-hidden="true" className="h-4 w-4" />
              Зберегти
            </button>
          </div>
        </form>
      )}
    </article>
  );
};
