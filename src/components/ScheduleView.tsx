import React, { useState } from 'react';
import {
  Clock,
  MapPin,
  User,
  CheckCircle2,
  Coffee
} from 'lucide-react';
import type { WeekSchedule, DaySchedule } from '../types/schedule';
import type { INPSubject } from '../types/inp';

interface ScheduleViewProps {
  weekSchedule: WeekSchedule;
  currentWeekNum: 1 | 2;
  onSwitchWeek: (week: 1 | 2) => void;
  onSelectSubject: (subject: INPSubject) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  weekSchedule,
  currentWeekNum,
  onSwitchWeek,
  onSelectSubject,
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
            {activeDay.lessons.map((lesson) => {
              const typeColorClass =
                lesson.lessonType === 'lecture'
                  ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/60'
                  : lesson.lessonType === 'practice'
                  ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-800/60'
                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/60';

              return (
                <button
                  type="button"
                  key={lesson.id}
                  onClick={() => {
                    if (lesson.matchedSubject) {
                      onSelectSubject(lesson.matchedSubject);
                    }
                  }}
                  aria-label={`Відкрити ${lesson.subjectName}, ${lesson.timeStart}–${lesson.timeEnd}`}
                  className="w-full text-left p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-750 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 cursor-pointer group"
                >
                  <div className="sm:w-36 flex-shrink-0">
                    <div className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100">
                      <Clock className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:scale-110" />
                      <span>{lesson.timeEnd ? `${lesson.timeStart} – ${lesson.timeEnd}` : lesson.timeStart}</span>
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-semibold text-slate-400 dark:text-slate-500 mt-0.5 pl-5 sm:pl-6">
                      {lesson.pairNumber}-а пара
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border transition-colors duration-200 ${typeColorClass}`}>
                        {lesson.lessonTypeLabel}
                      </span>
                      {lesson.matchedSubject?.category === 'selective' && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                          Вибіркова (ІНП)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 leading-snug">
                      {lesson.subjectName}
                    </h3>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span>{lesson.location || 'Не вказано'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                        <span>{lesson.lecturerName || 'Не вказано'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="self-end sm:self-center">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-750 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1 shadow-2xs">
                      <span className="theme-arrow text-slate-400 dark:text-slate-500 group-hover:text-white transition-all duration-200" />
                    </div>
                  </div>
                </button>
              );
            })}
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
