import React, { useId, useState } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  Clock,
  Info,
  MapPin,
  User,
  Video,
} from 'lucide-react';
import type { INPSubject } from '../types/inp';
import type { ProcessedLesson } from '../types/schedule';
import {
  getActiveConferenceLinksCount,
  getConferenceLinkFromSet,
  getConferenceLinkTypeForLesson,
  type ConferenceLinkType,
  type SubjectConferenceLinkSet,
} from '../services/conferenceLinks';
import { ConferenceLinksEditor } from './ConferenceLinksEditor';

interface ScheduleLessonCardProps {
  lesson: ProcessedLesson;
  conferenceLinks: SubjectConferenceLinkSet;
  onSelectSubject: (subject: INPSubject) => void;
  onUpdateConferenceLinks: (subject: INPSubject, links: SubjectConferenceLinkSet) => void;
}

const LINK_TYPE_LABELS: Record<ConferenceLinkType, string> = {
  lecture: 'Лекція',
  practice: 'Практика',
};

export const ScheduleLessonCard: React.FC<ScheduleLessonCardProps> = ({
  lesson,
  conferenceLinks,
  onSelectSubject,
  onUpdateConferenceLinks,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const panelId = useId();
  const subject = lesson.matchedSubject;
  const currentLinkType = getConferenceLinkTypeForLesson(lesson.lessonType);
  const currentConferenceUrl = getConferenceLinkFromSet(conferenceLinks, currentLinkType);
  const configuredLinksCount = getActiveConferenceLinksCount(conferenceLinks);
  const isSharedMode = conferenceLinks.mode === 'shared';
  const configuredLinksSummary = isSharedMode
    ? currentConferenceUrl ? 'Спільне посилання додано.' : 'Спільне посилання не додано.'
    : `Додано ${configuredLinksCount} з 2.`;

  const typeColorClass =
    lesson.lessonType === 'lecture'
      ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
      : lesson.lessonType === 'practice'
      ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
      : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';

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
            <div className="flex min-w-0 flex-1 items-center gap-2 lg:min-w-44 lg:flex-none">
              <span
                className={`inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${
                  currentConferenceUrl
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
                <span className={`mt-0.5 flex items-center gap-1 text-[10px] font-semibold ${currentConferenceUrl ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                  {currentConferenceUrl && <CheckCircle2 aria-hidden="true" className="h-3 w-3" />}
                  {isSharedMode ? 'Для всіх занять' : LINK_TYPE_LABELS[currentLinkType]}: {currentConferenceUrl ? 'додано' : 'не додано'}
                </span>
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsExpanded((current) => !current)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              aria-label={`${isExpanded ? 'Згорнути' : 'Розгорнути'} онлайн-посилання для ${lesson.subjectName}. ${configuredLinksSummary}`}
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
        <div
          id={panelId}
          className="animate-slide-up border-t border-slate-200/80 bg-white/80 p-4 dark:border-slate-700/80 dark:bg-slate-900/35 sm:p-5"
        >
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">Онлайн-посилання</h4>
              <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                {isSharedMode
                  ? 'Одна адреса для всіх типів занять'
                  : 'Окремі адреси для лекцій і практичних занять'}
              </p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              {isSharedMode
                ? currentConferenceUrl ? 'Спільне посилання' : 'Не додано'
                : `Додано ${configuredLinksCount} з 2`}
            </span>
          </div>

          <ConferenceLinksEditor
            subject={subject}
            links={conferenceLinks}
            preferredType={currentLinkType}
            onUpdateConferenceLinks={onUpdateConferenceLinks}
          />
        </div>
      )}
    </article>
  );
};
