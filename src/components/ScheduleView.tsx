import React, { useState } from 'react';
import {
  CheckCircle2,
  Coffee,
} from 'lucide-react';
import type { WeekSchedule, DaySchedule } from '../types/schedule';
import type { INPSubject } from '../types/inp';
import {
  getSubjectConferenceLink,
  type SubjectConferenceLinks,
} from '../services/conferenceLinks';
import { ScheduleLessonCard } from './ScheduleLessonCard';

interface ScheduleViewProps {
  weekSchedule: WeekSchedule;
  currentWeekNum: 1 | 2;
  onSwitchWeek: (week: 1 | 2) => void;
  onSelectSubject: (subject: INPSubject) => void;
  conferenceLinks: SubjectConferenceLinks;
  onSaveConferenceUrl: (subject: INPSubject, url: string) => void;
  onRemoveConferenceUrl: (subject: INPSubject) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  weekSchedule,
  currentWeekNum,
  onSwitchWeek,
  onSelectSubject,
  conferenceLinks,
  onSaveConferenceUrl,
  onRemoveConferenceUrl,
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);

  const activeDay: DaySchedule = weekSchedule.days[selectedDayIndex] || weekSchedule.days[0];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-page-enter">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Розклад занять
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Персоналізована сітка пар з урахуванням вибіркових дисциплін
          </p>
        </div>

        {/* Week navigation widget */}
        <div className="flex items-center justify-between sm:justify-center gap-2 sm:gap-3 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 w-full sm:w-auto transition-colors duration-200">
          <button
            type="button"
            onClick={() => onSwitchWeek(currentWeekNum === 1 ? 2 : 1)}
            title="Попередній тиждень"
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-2xs cursor-pointer flex items-center justify-center"
          >
            <span className="theme-arrow rotate-180" />
          </button>

          <div className="px-2 sm:px-3 text-center">
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {weekSchedule.weekLabel}
            </div>
            <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              {weekSchedule.dateRange}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onSwitchWeek(currentWeekNum === 1 ? 2 : 1)}
            title="Наступний тиждень"
            className="p-2 rounded-xl hover:bg-white dark:hover:bg-slate-700 active:scale-95 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-all duration-200 shadow-2xs cursor-pointer flex items-center justify-center"
          >
            <span className="theme-arrow" />
          </button>
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
                conferenceUrl={getSubjectConferenceLink(conferenceLinks, lesson.matchedSubject)}
                onSelectSubject={onSelectSubject}
                onSaveConferenceUrl={onSaveConferenceUrl}
                onRemoveConferenceUrl={onRemoveConferenceUrl}
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
  );
};
