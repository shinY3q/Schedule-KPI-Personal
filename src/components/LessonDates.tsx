import { Fragment } from 'react';
import { CalendarDays } from 'lucide-react';
import { getUpcomingLessonDates } from '../services/scheduleDates';

export function LessonDates({ dates }: { dates?: string[] }) {
  const upcomingDates = getUpcomingLessonDates(dates || []);
  if (upcomingDates.length === 0) return null;

  return (
    <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-blue-700 dark:text-blue-300">
      <CalendarDays aria-hidden="true" className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
      <span className="min-w-0">
        <span className="font-semibold">Лише у дати:</span>{' '}
        {upcomingDates.map((date, index) => (
          <Fragment key={date}>
            {index > 0 && ', '}
            <time dateTime={date} className="whitespace-nowrap">
              {date.split('-').reverse().join('.')}
            </time>
          </Fragment>
        ))}
      </span>
    </p>
  );
}
