/** Calendar date in the timezone used by KPI, independent of the device timezone. */
export function getKyivDateKey(now: Date = new Date()): string {
  // Older Safari versions recognize the previous spelling of the IANA timezone.
  for (const timeZone of ['Europe/Kyiv', 'Europe/Kiev']) {
    try {
      const parts = new Intl.DateTimeFormat('en-GB', {
        timeZone, year: 'numeric', month: '2-digit', day: '2-digit',
      }).formatToParts(now);
      const getPart = (type: string) => parts.find((part) => part.type === type)?.value;
      return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
    } catch {
      // Try the legacy timezone name before falling back to the local calendar.
    }
  }

  return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')].join('-');
}

/** An empty date list means a recurring lesson; dated lessons expire after their last date. */
export function hasUpcomingLessonDate(dates: string[], today: string): boolean {
  return dates.length === 0 || getUpcomingLessonDates(dates, today).length > 0;
}

export function getUpcomingLessonDates(dates: string[], today: string = getKyivDateKey()): string[] {
  return [...new Set(dates.filter((date) => (
    /^\d{4}-\d{2}-\d{2}$/.test(date) && date >= today
  )))].sort();
}
