import React, { useState } from 'react';
import { GraduationCap, Sparkles, Layers, Video } from 'lucide-react';
import type { INPData, INPSubject } from '../types/inp';
import {
  getSubjectConferenceLink,
  type SubjectConferenceLinks,
} from '../services/conferenceLinks';

interface SubjectsViewProps {
  inp: INPData;
  onSelectSubject: (subject: INPSubject) => void;
  conferenceLinks: SubjectConferenceLinks;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  inp,
  onSelectSubject,
  conferenceLinks,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(7);

  const filteredSubjects = inp.subjects.filter(
    (s) => s.semester === selectedSemester
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-page-enter">
      
      {/* Top Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all duration-200 hover:shadow-sm">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Мої предмети
          </h1>
          <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Предмети з вашого Індивідуального навчального плану ({inp.course} курс, {inp.academicYear})
          </p>
        </div>

        {/* Semester Tabs */}
        <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl grid grid-cols-2 sm:flex sm:items-center gap-1 w-full sm:w-auto border border-slate-200/60 dark:border-slate-700 transition-colors duration-200">
          <button
            type="button"
            onClick={() => setSelectedSemester(7)}
            aria-pressed={selectedSemester === 7}
            className={`px-3 sm:px-5 py-2 rounded-xl text-xs font-bold text-center transition-all duration-200 cursor-pointer active:scale-95 ${
              selectedSemester === 7
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            7 семестр (Осінь)
          </button>
          <button
            type="button"
            onClick={() => setSelectedSemester(8)}
            aria-pressed={selectedSemester === 8}
            className={`px-3 sm:px-5 py-2 rounded-xl text-xs font-bold text-center transition-all duration-200 cursor-pointer active:scale-95 ${
              selectedSemester === 8
                ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-sm scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            8 семестр (Весна)
          </button>
        </div>
      </div>

      {/* Subjects Cards List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Список дисциплін {selectedSemester} семестру
            </span>
          </div>
          <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">
            Всього {filteredSubjects.length} дисциплін
          </span>
        </div>

        <div className="space-y-3 pt-1">
          {filteredSubjects.map((subject) => {
            const isNormative = subject.category === 'normative';
            const hasConferenceLink = Boolean(getSubjectConferenceLink(conferenceLinks, subject));

            return (
              <button
                type="button"
                key={subject.id}
                onClick={() => onSelectSubject(subject)}
                aria-label={`Відкрити дисципліну: ${subject.name}`}
                className="w-full text-left p-4 sm:p-5 rounded-2xl bg-slate-50/60 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/70 dark:border-slate-750 hover:border-blue-300 dark:hover:border-blue-500/50 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.99] transition-all duration-200 flex items-center justify-between gap-3 sm:gap-4 cursor-pointer group"
              >
                <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                  <div
                    className={`w-9 sm:w-11 h-9 sm:h-11 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-2xs transition-transform duration-200 group-hover:scale-105 mt-0.5 sm:mt-0 ${
                      isNormative
                        ? 'bg-blue-100/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300'
                        : 'bg-amber-100/80 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {isNormative ? (
                      <GraduationCap className="w-4 sm:w-5 h-4 sm:h-5" />
                    ) : (
                      <Sparkles className="w-4 sm:w-5 h-4 sm:h-5" />
                    )}
                  </div>

                  <div className="space-y-1 min-w-0 flex-1">
                    <h3 className="text-xs sm:text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200 line-clamp-2 leading-snug">
                      {subject.name}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-0.5">
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors duration-200 ${
                          isNormative
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/60'
                        }`}
                      >
                        {isNormative ? 'Нормативний' : 'Вибірковий'}
                      </span>
                      <span className="text-[11px] sm:text-xs text-slate-400 dark:text-slate-500 font-medium">
                        Каф. {subject.department}
                      </span>
                      <span className="sm:hidden text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {subject.credits} кр.
                      </span>
                      {hasConferenceLink && (
                        <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                          <Video aria-hidden="true" className="w-3 h-3" />
                          Онлайн-посилання
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                  <div className="text-right hidden sm:block">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      {subject.credits} кред. ECTS
                    </div>
                    <div className="text-[11px] text-slate-400 dark:text-slate-500">
                      {subject.control} • {subject.hours} год
                    </div>
                  </div>

                  <div className="w-7 sm:w-8 h-7 sm:h-8 rounded-full bg-slate-100 dark:bg-slate-750 group-hover:bg-blue-600 dark:group-hover:bg-blue-500 flex items-center justify-center transition-all duration-200 group-hover:translate-x-1 shadow-2xs">
                    <span className="theme-arrow text-slate-400 dark:text-slate-500 group-hover:text-white transition-all duration-200" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <span>Всього предметів у семестрі: <strong className="text-slate-800 dark:text-slate-200">{filteredSubjects.length}</strong></span>
          <span>
            Сума кредитів:{' '}
            <strong className="text-slate-800 dark:text-slate-200">
              {filteredSubjects.reduce((sum, s) => sum + s.credits, 0)} кр.
            </strong>
          </span>
        </div>

      </div>

    </div>
  );
};
