import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  CalendarCheck2,
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import type { WeekSchedule, DaySchedule } from '../types/schedule';
import type { INPSubject } from '../types/inp';
import {
  getSubjectConferenceLinks,
  type SubjectConferenceLinkSet,
  type SubjectConferenceLinks,
} from '../services/conferenceLinks';
import { getCurrentWeekInfo } from '../services/kpiApi';
import { ScheduleLessonCard } from './ScheduleLessonCard';

const DAY_CODE_BY_WEEKDAY: Partial<Record<number, string>> = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
};

const getCurrentScheduleDayIndex = (days: DaySchedule[]): number => {
  const currentDayCode = DAY_CODE_BY_WEEKDAY[getCurrentWeekInfo().currentDay];
  const currentDayIndex = days.findIndex((day) => day.dayCode === currentDayCode);

  return currentDayIndex >= 0 ? currentDayIndex : 0;
};

interface ScheduleViewProps {
  weekSchedule: WeekSchedule;
  currentWeekNum: 1 | 2;
  actualWeekNum: 1 | 2;
  onSwitchWeek: (week: 1 | 2) => void;
  onSelectSubject: (subject: INPSubject) => void;
  conferenceLinks: SubjectConferenceLinks;
  onUpdateConferenceLinks: (subject: INPSubject, links: SubjectConferenceLinkSet) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  weekSchedule,
  currentWeekNum,
  actualWeekNum,
  onSwitchWeek,
  onSelectSubject,
  conferenceLinks,
  onUpdateConferenceLinks,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(() => (
    getCurrentScheduleDayIndex(weekSchedule.days)
  ));
  const [weekNotice, setWeekNotice] = useState<{
    id: number;
    message: string;
    isExiting: boolean;
  } | null>(null);
  const weekNoticeTimerRef = useRef<number | null>(null);

  const activeDay: DaySchedule = weekSchedule.days[selectedDayIndex] || weekSchedule.days[0];
  const isViewingCurrentWeek = currentWeekNum === actualWeekNum;

  useEffect(() => () => {
    if (weekNoticeTimerRef.current !== null) {
      window.clearTimeout(weekNoticeTimerRef.current);
    }
  }, []);

  useEffect(() => {
    if (weekNoticeTimerRef.current !== null) {
      window.clearTimeout(weekNoticeTimerRef.current);
      weekNoticeTimerRef.current = null;
    }
    setWeekNotice(null);
  }, [currentWeekNum]);

  const handleGoToCurrentWeek = () => {
    if (!isViewingCurrentWeek) {
      onSwitchWeek(actualWeekNum);
      setSelectedDayIndex(getCurrentScheduleDayIndex(weekSchedule.days));
      setWeekNotice(null);
      return;
    }

    if (weekNoticeTimerRef.current !== null) {
      window.clearTimeout(weekNoticeTimerRef.current);
    }

    setWeekNotice({
      id: Date.now(),
      message: `Зараз показано ${actualWeekNum}-й тиждень — ви вже переглядаєте актуальний розклад.`,
      isExiting: false,
    });
    weekNoticeTimerRef.current = window.setTimeout(() => {
      setWeekNotice((notice) => notice ? { ...notice, isExiting: true } : null);
      weekNoticeTimerRef.current = window.setTimeout(() => {
        setWeekNotice(null);
        weekNoticeTimerRef.current = null;
      }, 180);
    }, 3320);
  };

  return (
    <>
      {weekNotice && typeof document !== 'undefined' && createPortal(
        <div
          key={weekNotice.id}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="pointer-events-none fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] left-1/2 z-[60] w-[calc(100%-2rem)] max-w-[22rem] -translate-x-1/2 md:bottom-3"
        >
          <div className={`flex items-start gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-3.5 shadow-xl shadow-slate-950/10 backdrop-blur-sm motion-reduce:animate-none dark:border-emerald-800/80 dark:bg-slate-900/95 ${
            weekNotice.isExiting ? 'animate-toast-exit' : 'animate-slide-up'
          }`}>
            <span className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-extrabold text-slate-900 dark:text-slate-100">
                Ви вже на поточному тижні
              </span>
              <span className="mt-0.5 block text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
                {weekNotice.message}
              </span>
            </span>
          </div>
        </div>,
        document.body,
      )}

      <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-page-enter">
        {/* Top Header Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Розклад занять
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Персоналізована сітка пар з урахуванням вибіркових дисциплін
          </p>
        </div>

        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-stretch lg:w-auto">
          <button
            type="button"
            onClick={handleGoToCurrentWeek}
            aria-label={isViewingCurrentWeek
              ? `Поточний ${actualWeekNum}-й тиждень уже відкрито`
              : `Перейти до поточного ${actualWeekNum}-го тижня`}
            className={`inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-2xl border px-4 py-2.5 text-xs font-bold transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 ${
              isViewingCurrentWeek
                ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 active:bg-emerald-200 focus-visible:ring-emerald-500 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-950'
                : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 active:bg-blue-200 focus-visible:ring-blue-500 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-950'
            }`}
          >
            <CalendarCheck2 aria-hidden="true" className="h-4 w-4" />
            Поточний тиждень
          </button>

          {/* Week navigation widget */}
          <div className="flex w-full items-center justify-between gap-2 rounded-2xl border border-slate-200/60 bg-slate-50 p-1.5 transition-colors duration-200 dark:border-slate-700/60 dark:bg-slate-800/80 sm:w-auto sm:justify-center sm:gap-3">
            <button
              type="button"
              onClick={() => onSwitchWeek(currentWeekNum === 1 ? 2 : 1)}
              aria-label="Показати попередній тиждень"
              title="Попередній тиждень"
              className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl text-slate-600 shadow-2xs transition-all duration-200 hover:bg-white hover:text-slate-900 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <span aria-hidden="true" className="theme-arrow rotate-180" />
            </button>

            <div className="min-w-24 px-2 text-center sm:px-3">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {weekSchedule.weekLabel}
              </div>
              {weekSchedule.dateRange && (
                <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 sm:text-[11px]">
                  {weekSchedule.dateRange}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onSwitchWeek(currentWeekNum === 1 ? 2 : 1)}
              aria-label="Показати наступний тиждень"
              title="Наступний тиждень"
              className="flex min-h-11 min-w-11 cursor-pointer items-center justify-center rounded-xl text-slate-600 shadow-2xs transition-all duration-200 hover:bg-white hover:text-slate-900 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
            >
              <span aria-hidden="true" className="theme-arrow" />
            </button>
          </div>
        </div>
      </div>

      {/* Day Selector Pills */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-1.5 sm:p-2 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 hover:shadow-sm">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
          {weekSchedule.days.map((day, idx) => {
            const isActive = selectedDayIndex === idx;
            const hasPairs = day.lessons.length > 0;
            return (
              <button
                type="button"
                key={day.dayCode}
                onClick={() => setSelectedDayIndex(idx)}
                aria-pressed={isActive}
                aria-label={`${day.dayFull}, ${day.dateStr}: ${day.lessons.length} занять`}
                className={`py-2 sm:py-3 px-1.5 sm:px-2 rounded-xl text-center transition-all duration-200 flex flex-col items-center gap-0.5 sm:gap-1 cursor-pointer active:scale-95 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 scale-[1.02]'
                    : 'bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-600 dark:text-slate-300'
                }`}
              >
                <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider">
                  {day.dayShort}
                </div>
                <div className={`text-[10px] sm:text-xs font-medium ${isActive ? 'text-blue-100' : 'text-slate-400 dark:text-slate-500'}`}>
                  {day.dateStr}
                </div>
                {hasPairs && (
                  <span
                    className={`w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full transition-transform duration-200 ${
                      isActive ? 'bg-white scale-125' : 'bg-blue-500 dark:bg-blue-400'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lessons Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm">
        
        {/* Day Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
              {activeDay.dayFull}{activeDay.dateStr ? `, ${activeDay.dateStr}` : ''}
            </h2>
            <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500">
              {activeDay.lessons.length > 0
                ? `Заплановано ${activeDay.lessons.length} ${
                    activeDay.lessons.length === 1 ? 'пару' : 'пари'
                  }`
                : 'Занять немає'}
            </span>
          </div>

          <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 sm:px-3 py-1 rounded-full border border-blue-100 dark:border-blue-900/60">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Відфільтровано за ІНП</span>
          </span>
        </div>

        {/* List of lessons */}
        {activeDay.lessons.length > 0 ? (
          <div className="space-y-3 pt-1">
            {activeDay.lessons.map((lesson) => (
              <ScheduleLessonCard
                key={lesson.id}
                lesson={lesson}
                conferenceLinks={getSubjectConferenceLinks(conferenceLinks, lesson.matchedSubject)}
                onSelectSubject={onSelectSubject}
                onUpdateConferenceLinks={onUpdateConferenceLinks}
              />
            ))}
          </div>
        ) : (
          <div className="py-16 text-center space-y-3 animate-slide-up">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 flex items-center justify-center mx-auto">
              <Coffee className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                Занять немає
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto mt-1">
                У цей день у вашому індивідуальному плані немає запланованих пар. День для самостійної роботи та відпочинку.
              </p>
            </div>
          </div>
        )}

        </div>

      </div>
    </>
  );
};
