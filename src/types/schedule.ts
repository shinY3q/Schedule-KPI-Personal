import type { INPSubject } from './inp';

export interface KPILecturer {
  id: string;
  name: string;
}

export interface KPILessonRaw {
  name: string;
  type: string; // 'Лек', 'Прак', 'Лаб'
  time: string; // '08:30:00'
  location: string | null;
  tag: string; // 'lec', 'prac', 'lab'
  lecturer: KPILecturer | null;
  dates: string[];
}

export interface KPIDaySchedule {
  day: string; // 'Пн', 'Вт', 'Вв', 'Ср', 'Чт', 'Пт', 'Сб'
  pairs: KPILessonRaw[];
}

export interface GroupScheduleRaw {
  groupCode: string;
  scheduleFirstWeek: KPIDaySchedule[];
  scheduleSecondWeek: KPIDaySchedule[];
}

export type LessonType = 'lecture' | 'practice' | 'lab' | 'other';

export interface ProcessedLesson {
  id: string;
  pairNumber: number;
  timeStart: string;
  timeEnd: string;
  subjectName: string;
  lessonType: LessonType;
  lessonTypeLabel: string;
  lecturerName: string;
  location: string;
  isMatched: boolean;
  matchedSubject?: INPSubject;
  rawLesson: KPILessonRaw;
}

export interface DaySchedule {
  dayCode: string;
  dayShort: string;
  dayFull: string;
  dateStr: string;
  lessons: ProcessedLesson[];
}

export interface WeekSchedule {
  weekNumber: 1 | 2;
  weekLabel: string;
  isOdd: boolean;
  dateRange: string;
  days: DaySchedule[];
}

export interface KPIGroup {
  id: number;
  name: string;
  faculty: string;
}
