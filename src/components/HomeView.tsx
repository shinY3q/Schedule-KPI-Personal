import React from 'react';
import {
  Calendar,
  FileText,
  Upload,
  RefreshCw,
  Clock,
  MapPin,
  User,
  Check,
  CalendarDays,
  Sparkles
} from 'lucide-react';
import type { INPData } from '../types/inp';
import type { WeekSchedule, ProcessedLesson } from '../types/schedule';

interface HomeViewProps {
  inp: INPData;
  weekSchedule: WeekSchedule;
  currentWeekNum: 1 | 2;
  onSwitchWeek: (week: 1 | 2) => void;
  onNavigateToSchedule: () => void;
  onNavigateToSubjects: () => void;
  onUploadNewInp: () => void;
  onRefreshSchedule: () => void;
  isRefreshing?: boolean;
}

export const HomeView: React.FC<HomeViewProps> = ({
  inp,
  weekSchedule,
  currentWeekNum,
  onSwitchWeek,
  onNavigateToSchedule,
  onNavigateToSubjects,
  onUploadNewInp,
  onRefreshSchedule,
  isRefreshing = false,
}) => {
  const firstName = inp.studentName
    ? inp.studentName.split(' ')[1] || inp.studentName.split(' ')[0]
    : 'Студенте';

  const semester7Subjects = inp.subjects.filter(s => s.semester === 7);
  const totalSubjectsCount = semester7Subjects.length > 0 ? semester7Subjects.length : inp.subjects.length;

  const todayPairs: ProcessedLesson[] = [];
  weekSchedule.days.forEach(day => {
    day.lessons.forEach(l => {
      if (todayPairs.length < 3) {
        todayPairs.push(l);
      }
    });
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-page-enter">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 rounded-2xl sm:rounded-3xl p-5 sm:p-8 text-white shadow-lg relative overflow-hidden border border-blue-900/50 transition-all duration-300">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-glow" />
        
        <div className="space-y-1 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-blue-200 backdrop-blur-md mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Індивідуальний розклад активний</span>
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight">
            Вітаємо, {firstName}!
          </h1>
          <p className="text-blue-100/90 text-xs sm:text-sm font-medium leading-relaxed">
            Ваш персональний розклад занять сформовано згідно з Індивідуальним навчальним планом.
          </p>
        </div>

        <button
          type="button"
          onClick={onNavigateToSchedule}
          className="w-full sm:w-auto px-5 py-3 sm:py-3.5 rounded-2xl bg-white dark:bg-blue-600 hover:bg-blue-50 dark:hover:bg-blue-700 text-blue-900 dark:text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2.5 flex-shrink-0 active:scale-95 cursor-pointer group"
        >
          <Calendar className="w-4 h-4 text-blue-700 dark:text-white transition-transform duration-200 group-hover:scale-110" />
          <span>Переглянути розклад</span>
          <span className="theme-arrow text-blue-900 dark:text-white transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Main 3-Column Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        
        {/* Card 1: Academic Group */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Навчальна група
              </span>
              <span className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-xs font-bold border border-blue-100 dark:border-blue-900/60">
                КПІ ФІОТ
              </span>
            </div>
            
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-4xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {inp.group}
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60">
                Активна
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Курс:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inp.course} курс</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-400 dark:text-slate-500">Навчальний рік:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inp.academicYear}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400 dark:text-slate-500">Спеціальність:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[150px]" title={inp.specialty}>
                  126 ІСТ
                </span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToSubjects}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1.5 group cursor-pointer transition-colors duration-200"
            >
              <span>Переглянути предмети курсу</span>
              <span className="theme-arrow text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>

        {/* Card 2: Current Week & Schedule Selector */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Поточний тиждень
              </span>
              <CalendarDays className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>

            <div className="mb-4">
              <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {currentWeekNum} тиждень
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                {currentWeekNum === 1 ? '01.09 – 07.09.2026' : '08.09 – 14.09.2026'}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/80 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/60 dark:border-slate-700/60 mb-4">
              <button
                type="button"
                onClick={() => onSwitchWeek(1)}
                aria-pressed={currentWeekNum === 1}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  currentWeekNum === 1
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                1 тиждень
              </button>
              <button
                type="button"
                onClick={() => onSwitchWeek(2)}
                aria-pressed={currentWeekNum === 2}
                className={`flex-1 py-2 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer active:scale-95 ${
                  currentWeekNum === 2
                    ? 'bg-blue-600 text-white shadow-xs scale-[1.02]'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                2 тиждень
              </button>
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
              <span className="text-slate-400 dark:text-slate-500 font-medium">Наступний тиждень:</span>
              <div className="font-semibold text-slate-700 dark:text-slate-300">
                {currentWeekNum === 1 ? '2 тиждень • 08.09 – 14.09' : '1 тиждень • 15.09 – 21.09'}
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onNavigateToSchedule}
              className="w-full py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100/80 dark:hover:bg-blue-900/50 active:scale-[0.98] text-blue-700 dark:text-blue-400 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Відкрити сітку розкладу</span>
            </button>
          </div>
        </div>

        {/* Card 3: INP File Badge & Info */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                ІНП файл
              </span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/60">
                <Check className="w-3 h-3" />
                Оброблено
              </span>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 mb-4 transition-colors duration-200">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={inp.fileName}>
                  {inp.fileName || 'ІНП_ІК-31_2026.pdf'}
                </div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500">
                  Завантажено: {inp.uploadDate || '25.05.2026'}
                </div>
              </div>
            </div>

            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Всього дисциплін:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inp.subjects.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 dark:text-slate-500">Кредитів ECTS:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inp.totalCredits || 60.5} кр.</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onUploadNewInp}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 active:scale-[0.98] text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Завантажити новий файл</span>
            </button>
          </div>
        </div>

      </div>

      {/* Summary Footer Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-all duration-200 hover:shadow-sm">
        <div className="flex flex-wrap items-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-500 flex-shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Предметів у семестрі:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">{totalSubjectsCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="text-slate-500 dark:text-slate-400">Вибіркових:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {inp.subjects.filter(s => s.category === 'selective').length}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 w-full sm:w-auto justify-between sm:justify-end">
          <span>Оновлено: {new Date().toLocaleDateString('uk-UA')}</span>
          <button
            type="button"
            onClick={onRefreshSchedule}
            title="Оновити зараз"
            aria-label={isRefreshing ? 'Розклад оновлюється' : 'Оновити розклад зараз'}
            aria-busy={isRefreshing}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition-all duration-200 active:scale-90 cursor-pointer"
          >
            <RefreshCw
              aria-hidden="true"
              className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100">
              Огляд персональних занять на {weekSchedule.weekLabel}
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Всі нерелевантні вибіркові дисципліни інших студентів відфільтровано
            </p>
          </div>
          <button
            type="button"
            onClick={onNavigateToSchedule}
            className="self-start sm:self-auto rounded-lg text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 cursor-pointer group transition-colors duration-200 flex-shrink-0"
          >
            <span>Вся сітка</span>
            <span className="theme-arrow text-blue-600 dark:text-blue-400 transition-transform duration-200 group-hover:translate-x-1" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pt-1">
          {todayPairs.map((pair, idx) => (
            <button
              type="button"
              key={idx}
              aria-label={`Відкрити розклад: ${pair.subjectName}, ${pair.timeStart}–${pair.timeEnd}`}
              className="w-full text-left p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/80 hover:border-blue-300 dark:hover:border-blue-500/50 hover:bg-blue-50/40 dark:hover:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] transition-all duration-200 space-y-2.5 cursor-pointer"
              onClick={onNavigateToSchedule}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  {pair.timeStart} – {pair.timeEnd}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-colors duration-200 ${
                    pair.lessonType === 'lecture'
                      ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300'
                      : pair.lessonType === 'practice'
                      ? 'bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300'
                      : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                  }`}
                >
                  {pair.lessonTypeLabel}
                </span>
              </div>

              <div className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                {pair.subjectName}
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-400 space-y-1 pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                <div className="flex items-center gap-1.5 truncate">
                  <User className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate">{pair.lecturerName}</span>
                </div>
                <div className="flex items-center gap-1.5 truncate">
                  <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                  <span className="truncate">{pair.location}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
