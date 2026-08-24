import type { INPData } from '../types/inp';
import type {
  GroupScheduleRaw,
  KPIDaySchedule,
  ProcessedLesson,
  DaySchedule,
  WeekSchedule,
  LessonType,
} from '../types/schedule';

export function normalizeSubjectName(text: string): string {
  if (!text) return '';
  let clean = text.toLowerCase();
  
  // Remove elective/course markers
  clean = clean.replace(/\(ф\d+\s+б\s+[^\)]+\)/gi, '');
  clean = clean.replace(/\(авторський курс[^\)]*\)/gi, '');
  clean = clean.replace(/\(сертифікатна програма[^\)]*\)/gi, '');
  clean = clean.replace(/\(частина\s+\d+\)/gi, '');
  clean = clean.replace(/частина\s+\d+/gi, '');
  
  // Normalize punctuation and symbols
  clean = clean.replace(/[\(\)\[\]\.\,\-\–\—\'\"`’«»]/g, ' ');
  clean = clean.replace(/i/g, 'і').replace(/e/g, 'е');
  clean = clean.replace(/\s+/g, ' ').trim();
  return clean;
}

export function isSubjectMatch(scheduleLessonName: string, inpSubjectName: string): boolean {
  const s1 = normalizeSubjectName(scheduleLessonName);
  const s2 = normalizeSubjectName(inpSubjectName);

  if (!s1 || !s2) return false;
  if (s1 === s2) return true;
  if (s1.includes(s2) || s2.includes(s1)) return true;

  // Specific keyword distinctions
  if (s1.includes('мереж') && !s2.includes('мереж')) return false;
  if (s2.includes('мереж') && !s1.includes('мереж')) return false;

  if (s1.includes('техніч') && !s2.includes('техніч')) return false;
  if (s2.includes('техніч') && !s1.includes('техніч')) return false;

  if (s1.includes('.net') && !s2.includes('.net')) return false;
  if (s2.includes('.net') && !s1.includes('.net')) return false;

  if (s1.includes('моделюван') && !s2.includes('моделюван')) return false;
  if (s2.includes('моделюван') && !s1.includes('моделюван')) return false;

  if (s1.includes('графік') && !s2.includes('графік')) return false;
  if (s2.includes('графік') && !s1.includes('графік')) return false;

  const words1 = s1.split(' ').filter(w => w.length > 2);
  const words2 = s2.split(' ').filter(w => w.length > 2);

  if (words1.length === 0 || words2.length === 0) return false;

  let matchCount = 0;
  for (const w1 of words1) {
    if (words2.some(w2 => w2.startsWith(w1.slice(0, 4)) || w1.startsWith(w2.slice(0, 4)))) {
      matchCount++;
    }
  }

  const ratio = matchCount / Math.max(words1.length, words2.length);
  return ratio >= 0.6;
}

export function determineLessonType(rawType: string, tagName: string): { type: LessonType; label: string } {
  const t = (rawType || '').toLowerCase();
  const tag = (tagName || '').toLowerCase();

  if (t.includes('лек') || tag.includes('lec')) {
    return { type: 'lecture', label: 'Лекція' };
  }
  if (t.includes('прак') || tag.includes('prac')) {
    return { type: 'practice', label: 'Практика' };
  }
  if (t.includes('лаб') || tag.includes('lab')) {
    return { type: 'lab', label: 'Лабораторна' };
  }
  return { type: 'other', label: rawType || 'Заняття' };
}

export function calculateEndTime(startTime: string): { timeStart: string; timeEnd: string; pairNumber: number } {
  const cleanStart = startTime.slice(0, 5);
  
  switch (cleanStart) {
    case '08:30':
      return { timeStart: '08:30', timeEnd: '10:05', pairNumber: 1 };
    case '10:25':
      return { timeStart: '10:25', timeEnd: '12:00', pairNumber: 2 };
    case '12:20':
      return { timeStart: '12:20', timeEnd: '13:55', pairNumber: 3 };
    case '13:15':
      return { timeStart: '13:15', timeEnd: '14:50', pairNumber: 3 };
    case '14:15':
      return { timeStart: '14:15', timeEnd: '15:50', pairNumber: 4 };
    case '15:05':
      return { timeStart: '15:05', timeEnd: '16:40', pairNumber: 4 };
    case '16:10':
      return { timeStart: '16:10', timeEnd: '17:45', pairNumber: 5 };
    case '18:30':
      return { timeStart: '18:30', timeEnd: '20:05', pairNumber: 6 };
    default:
      return { timeStart: cleanStart, timeEnd: '', pairNumber: 1 };
  }
}

const DAY_MAP: Record<string, { code: string; short: string; full: string; dayIndex: number }> = {
  'Пн': { code: 'mon', short: 'Пн', full: 'Понеділок', dayIndex: 1 },
  'Понеділок': { code: 'mon', short: 'Пн', full: 'Понеділок', dayIndex: 1 },
  'Вт': { code: 'tue', short: 'Вт', full: 'Вівторок', dayIndex: 2 },
  'Вв': { code: 'tue', short: 'Вт', full: 'Вівторок', dayIndex: 2 },
  'Вівторок': { code: 'tue', short: 'Вт', full: 'Вівторок', dayIndex: 2 },
  'Ср': { code: 'wed', short: 'Ср', full: 'Середа', dayIndex: 3 },
  'Середа': { code: 'wed', short: 'Ср', full: 'Середа', dayIndex: 3 },
  'Чт': { code: 'thu', short: 'Чт', full: 'Четвер', dayIndex: 4 },
  'Четвер': { code: 'thu', short: 'Чт', full: 'Четвер', dayIndex: 4 },
  'Пт': { code: 'fri', short: 'Пт', full: "П'ятниця", dayIndex: 5 },
  "П'ятниця": { code: 'fri', short: 'Пт', full: "П'ятниця", dayIndex: 5 },
  'Сб': { code: 'sat', short: 'Сб', full: 'Субота', dayIndex: 6 },
  'Субота': { code: 'sat', short: 'Сб', full: 'Субота', dayIndex: 6 },
};

export function filterAndProcessSchedule(
  rawSchedule: GroupScheduleRaw,
  inp: INPData,
  activeSemester?: number
): { week1: WeekSchedule; week2: WeekSchedule } {
  const targetSubjects = activeSemester
    ? inp.subjects.filter(s => s.semester === activeSemester)
    : inp.subjects;

  const processWeek = (daysRaw: KPIDaySchedule[], weekNum: 1 | 2): WeekSchedule => {
    const baseDate = weekNum === 1 ? new Date(2026, 8, 1) : new Date(2026, 8, 8);
    const dateRange = weekNum === 1 ? '01.09 - 07.09.2026' : '08.09 - 14.09.2026';

    const daysOrder = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
    const days: DaySchedule[] = daysOrder.map((dayKey, idx) => {
      const dayMeta = DAY_MAP[dayKey] || {
        code: `day-${idx}`,
        short: dayKey,
        full: dayKey,
        dayIndex: idx + 1,
      };

      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + idx);
      const dateFormatted = `${String(dayDate.getDate()).padStart(2, '0')}.${String(
        dayDate.getMonth() + 1
      ).padStart(2, '0')}`;

      const rawDay = daysRaw.find(
        d => d.day === dayKey || d.day.startsWith(dayKey) || (DAY_MAP[d.day] && DAY_MAP[d.day].short === dayKey)
      );

      const lessons: ProcessedLesson[] = [];

      if (rawDay && rawDay.pairs) {
        for (const pair of rawDay.pairs) {
          const matchedSubject = targetSubjects.find(subj =>
            isSubjectMatch(pair.name, subj.name) || isSubjectMatch(pair.name, subj.cleanName)
          );

          if (matchedSubject) {
            const { type, label } = determineLessonType(pair.type, pair.tag);
            const { timeStart, timeEnd, pairNumber } = calculateEndTime(pair.time);

            lessons.push({
              id: `${weekNum}-${dayKey}-${pair.time}-${pair.name}`,
              pairNumber,
              timeStart,
              timeEnd: timeEnd || '10:05',
              subjectName: pair.name,
              lessonType: type,
              lessonTypeLabel: label,
              lecturerName: pair.lecturer?.name || 'Викладач кафедри',
              location: pair.location || 'Корпус 18, ауд. 422',
              isMatched: true,
              matchedSubject,
              rawLesson: pair,
            });
          }
        }
      }

      lessons.sort((a, b) => a.timeStart.localeCompare(b.timeStart));

      return {
        dayCode: dayMeta.code,
        dayShort: dayMeta.short,
        dayFull: dayMeta.full,
        dateStr: dateFormatted,
        lessons,
      };
    });

    return {
      weekNumber: weekNum,
      weekLabel: `${weekNum} тиждень`,
      isOdd: weekNum === 1,
      dateRange,
      days,
    };
  };

  return {
    week1: processWeek(rawSchedule.scheduleFirstWeek || [], 1),
    week2: processWeek(rawSchedule.scheduleSecondWeek || [], 2),
  };
}
