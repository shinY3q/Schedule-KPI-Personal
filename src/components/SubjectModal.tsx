import React, { useEffect, useRef, useState } from 'react';
import {
  Clock,
  MapPin,
  User,
  ExternalLink,
  GraduationCap,
  X,
  Video,
} from 'lucide-react';
import type { INPSubject } from '../types/inp';
import type { WeekSchedule } from '../types/schedule';
import {
  hasActiveConferenceLinks,
  type SubjectConferenceLinkSet,
} from '../services/conferenceLinks';
import { ConferenceLinksEditor } from './ConferenceLinksEditor';

interface SubjectModalProps {
  subject: INPSubject | null;
  onClose: () => void;
  weekSchedule: WeekSchedule;
  conferenceLinks: SubjectConferenceLinkSet;
  onUpdateConferenceLinks: (subject: INPSubject, links: SubjectConferenceLinkSet) => void;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  subject,
  onClose,
  weekSchedule,
  conferenceLinks,
  onUpdateConferenceLinks,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'online' | 'info' | 'materials'>('schedule');
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [onClose]);

  if (!subject) return null;

  const hasConferenceLinks = hasActiveConferenceLinks(conferenceLinks);

  const occurrences: { day: string; time: string; type: string; location: string; teacher: string }[] = [];

  weekSchedule.days.forEach((d) => {
    d.lessons.forEach((l) => {
      if (
        l.subjectName.toLowerCase().includes(subject.cleanName.toLowerCase()) ||
        subject.name.toLowerCase().includes(l.subjectName.toLowerCase())
      ) {
        occurrences.push({
          day: d.dayFull,
          time: l.timeEnd ? `${l.timeStart} – ${l.timeEnd}` : l.timeStart,
          type: l.lessonTypeLabel,
          location: l.location,
          teacher: l.lecturerName,
        });
      }
    });
  });

  return (
    <div
      className="fixed inset-0 bg-slate-950/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 z-50 animate-backdrop-enter"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="subject-modal-title"
        className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl max-w-3xl w-full max-h-[calc(100dvh-0.75rem)] sm:max-h-[calc(100dvh-3rem)] overflow-y-auto overscroll-contain shadow-2xl border border-slate-200 dark:border-slate-800 animate-modal-enter p-5 sm:p-8 space-y-4 sm:space-y-6"
        onMouseDown={(event) => event.stopPropagation()}
      >
        
        {/* Back Button */}
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Закрити вікно дисципліни"
          className="inline-flex min-h-9 items-center gap-2 rounded-xl px-2 -ml-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 active:scale-95 transition-all duration-200 cursor-pointer group"
        >
          <X aria-hidden="true" className="w-4 h-4 transition-transform duration-200 group-hover:rotate-90" />
          <span>Закрити</span>
        </button>

        {/* Header Subject Info */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`text-[11px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 rounded-lg border transition-colors duration-200 ${
                subject.category === 'normative'
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
              }`}
            >
              {subject.category === 'normative' ? 'Нормативна дисципліна' : 'Вибіркова дисципліна'}
            </span>
            <span className="text-[11px] sm:text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 sm:px-2.5 py-0.5 rounded-lg">
              {subject.semester} семестр
            </span>
            <span className="text-[11px] sm:text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 sm:px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900/60">
              {subject.credits} кредити ECTS
            </span>
          </div>

          <h2 id="subject-modal-title" className="text-lg sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug">
            {subject.name}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs text-slate-600 dark:text-slate-400 pt-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span>Кафедра: <strong className="text-slate-800 dark:text-slate-200">{subject.department}</strong></span>
            </div>
            <div className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-slate-400 dark:text-slate-500 flex-shrink-0" />
              <span>Форма контролю: <strong className="text-slate-800 dark:text-slate-200">{subject.control}</strong></span>
            </div>
          </div>
        </div>

        {/* Sub-tabs Navigation */}
        <div role="tablist" aria-label="Розділи дисципліни" className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800">
          <button
            type="button"
            role="tab"
            id="subject-tab-schedule"
            aria-selected={activeTab === 'schedule'}
            aria-controls="subject-panel-schedule"
            onClick={() => setActiveTab('schedule')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-all duration-200 relative cursor-pointer flex-shrink-0 ${
              activeTab === 'schedule'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Розклад
            {activeTab === 'schedule' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-slide-up" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            id="subject-tab-online"
            aria-selected={activeTab === 'online'}
            aria-controls="subject-panel-online"
            onClick={() => setActiveTab('online')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-all duration-200 relative cursor-pointer flex-shrink-0 inline-flex items-center gap-1.5 ${
              activeTab === 'online'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Video aria-hidden="true" className="w-3.5 h-3.5" />
            Онлайн
            {hasConferenceLinks && (
              <>
                <span aria-hidden="true" className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="sr-only">, посилання додано</span>
              </>
            )}
            {activeTab === 'online' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-slide-up" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            id="subject-tab-info"
            aria-selected={activeTab === 'info'}
            aria-controls="subject-panel-info"
            onClick={() => setActiveTab('info')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-all duration-200 relative cursor-pointer flex-shrink-0 ${
              activeTab === 'info'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Інформація
            {activeTab === 'info' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-slide-up" />
            )}
          </button>

          <button
            type="button"
            role="tab"
            id="subject-tab-materials"
            aria-selected={activeTab === 'materials'}
            aria-controls="subject-panel-materials"
            onClick={() => setActiveTab('materials')}
            className={`pb-3 px-3 sm:px-4 text-xs font-bold transition-all duration-200 relative cursor-pointer flex-shrink-0 ${
              activeTab === 'materials'
                ? 'text-blue-600 dark:text-blue-400'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Матеріали
            {activeTab === 'materials' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-slide-up" />
            )}
          </button>
        </div>

        {/* Sub-tab Content: Розклад */}
        {activeTab === 'schedule' && (
          <div id="subject-panel-schedule" role="tabpanel" aria-labelledby="subject-tab-schedule" className="space-y-4 animate-slide-up">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{weekSchedule.weekLabel}</span>
              <span className="text-slate-400 dark:text-slate-500">{weekSchedule.dateRange}</span>
            </div>

            {occurrences.length > 0 ? (
              <div className="space-y-3">
                {occurrences.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-sm transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1">
                        {item.day}
                      </div>
                      <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.time}</span>
                        <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold text-[10px]">
                          {item.type}
                        </span>
                      </div>
                    </div>

                    <div className="text-slate-500 dark:text-slate-400 sm:text-right space-y-0.5">
                      <div className="flex items-center sm:justify-end gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{item.location}</span>
                      </div>
                      <div className="flex items-center sm:justify-end gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span>{item.teacher}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-100 dark:border-slate-800">
                На цьому тижні немає запланованих занять з цієї дисципліни.
              </div>
            )}

            <p className="text-[11px] text-slate-400 dark:text-slate-500 text-center">
              Розклад може змінюватися. Дані синхронізуються автоматично з schedule.kpi.ua
            </p>
          </div>
        )}

        {/* Sub-tab Content: Онлайн */}
        {activeTab === 'online' && (
          <div id="subject-panel-online" role="tabpanel" aria-labelledby="subject-tab-online" className="space-y-4 animate-slide-up">
            <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4 dark:border-blue-900/60 dark:bg-blue-950/30 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
                  <Video aria-hidden="true" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    Онлайн-заняття
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    Використовуйте одну адресу для всіх занять або окремі — для лекцій і практик. Розклад автоматично відкриє активний варіант.
                  </p>
                </div>
              </div>
            </div>

            <ConferenceLinksEditor
              subject={subject}
              links={conferenceLinks}
              onUpdateConferenceLinks={onUpdateConferenceLinks}
            />
          </div>
        )}

        {/* Sub-tab Content: Інформація */}
        {activeTab === 'info' && (
          <div id="subject-panel-info" role="tabpanel" aria-labelledby="subject-tab-info" className="space-y-4 text-xs animate-slide-up">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Лекції</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{subject.lectures} год</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Практики</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{subject.practices} год</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">Лабораторні</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{subject.labs} год</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-slate-400 dark:text-slate-500 block text-[11px]">СРС</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-200">{subject.selfStudy} год</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Загальний обсяг:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{subject.hours} академічних годин</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50">
                <span className="text-slate-500 dark:text-slate-400">Модульний контроль (МКР):</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{subject.mkr ?? '—'} шт.</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 dark:text-slate-400">Індивідуальне завдання:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{subject.individualTask || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Sub-tab Content: Матеріали */}
        {activeTab === 'materials' && (
          <div id="subject-panel-materials" role="tabpanel" aria-labelledby="subject-tab-materials" className="space-y-3 text-xs animate-slide-up">
            <a
              href="https://ecampus.kpi.ua"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold">
                  Е
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Електронний Кампус КПІ
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">ecampus.kpi.ua</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </a>

            <a
              href="https://do.ipo.kpi.ua"
              target="_blank"
              rel="noreferrer"
              className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 hover:border-blue-200 dark:hover:border-blue-500/50 flex items-center justify-between transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
                  С
                </div>
                <div>
                  <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                    Сікорський Дистанційне Навчання
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500">do.ipo.kpi.ua</div>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </a>
          </div>
        )}

      </div>
    </div>
  );
};
