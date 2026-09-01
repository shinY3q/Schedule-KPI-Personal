import type { GroupScheduleRaw, KPIGroup } from '../types/schedule';

const BASE_URL = 'https://api.campus.kpi.ua';

let cachedGroups: KPIGroup[] | null = null;

export async function fetchAllGroups(): Promise<KPIGroup[]> {
  if (cachedGroups && cachedGroups.length > 0) {
    return cachedGroups;
  }

  try {
    const res = await fetch(`${BASE_URL}/group/all`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (Array.isArray(data)) {
      cachedGroups = data;
      return data;
    } else if (data?.data && Array.isArray(data.data)) {
      cachedGroups = data.data;
      return data.data;
    }
  } catch (err) {
    console.warn('Direct fetch to campus API failed, trying CORS proxy or fallback...', err);
  }

  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`${BASE_URL}/group/all`)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        cachedGroups = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Proxy fetch failed:', err);
  }

  return [];
}

export async function findGroupByName(groupName: string): Promise<KPIGroup | null> {
  const cleanQuery = groupName.trim().toLowerCase().replace('-', '–');
  const asciiQuery = groupName.trim().toLowerCase().replace('і', 'i').replace('–', '-');
  
  const groups = await fetchAllGroups();
  
  const exact = groups.find(g => {
    const gName = g.name.toLowerCase();
    const gAscii = gName.replace('і', 'i').replace('–', '-');
    return gName === cleanQuery || gName === groupName.toLowerCase() || gAscii === asciiQuery;
  });

  if (exact) return exact;

  const partial = groups.find(g => {
    const gName = g.name.toLowerCase();
    return gName.includes(cleanQuery) || cleanQuery.includes(gName);
  });

  return partial || null;
}

export async function fetchGroupSchedule(groupId: number | string): Promise<GroupScheduleRaw> {
  try {
    const res = await fetch(`${BASE_URL}/schedule/lessons?groupId=${groupId}`, {
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) throw new Error(`HTTP error ${res.status}`);
    const data = await res.json();
    if (data && data.scheduleFirstWeek && data.scheduleSecondWeek) {
      return data as GroupScheduleRaw;
    }
  } catch (err) {
    console.warn('Direct fetchGroupSchedule failed, trying fallback...', err);
  }

  try {
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(`${BASE_URL}/schedule/lessons?groupId=${groupId}`)}`;
    const res = await fetch(proxyUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.scheduleFirstWeek && data.scheduleSecondWeek) {
        return data as GroupScheduleRaw;
      }
    }
  } catch (err) {
    console.warn('Proxy fetchGroupSchedule failed:', err);
  }

  return {
    groupCode: String(groupId),
    scheduleFirstWeek: [],
    scheduleSecondWeek: [],
  };
}

export interface CurrentTimeInfo {
  currentWeek: 1 | 2;
  currentDay: number;
  currentLesson: number;
}

const DAY_IN_MS = 24 * 60 * 60 * 1000;

interface CalendarDateParts {
  year: number;
  month: number;
  day: number;
}

const getKyivCalendarDate = (date: Date): CalendarDateParts => {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Europe/Kyiv',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
    const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

    return {
      year: Number(values.year),
      month: Number(values.month),
      day: Number(values.day),
    };
  } catch {
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate(),
    };
  }
};

const getMondayTimestamp = (dateTimestamp: number): number => {
  const dayOfWeek = new Date(dateTimestamp).getUTCDay();
  const daysSinceMonday = (dayOfWeek + 6) % 7;
  return dateTimestamp - daysSinceMonday * DAY_IN_MS;
};

export function getCurrentWeekInfo(now: Date = new Date()): CurrentTimeInfo {
  const currentDate = getKyivCalendarDate(now);
  const currentDateTimestamp = Date.UTC(currentDate.year, currentDate.month - 1, currentDate.day);
  const currentMondayTimestamp = getMondayTimestamp(currentDateTimestamp);
  const academicYearStart = currentDate.month >= 9 ? currentDate.year : currentDate.year - 1;
  const septemberFirstTimestamp = Date.UTC(academicYearStart, 8, 1);
  const firstAcademicMondayTimestamp = getMondayTimestamp(septemberFirstTimestamp);
  const academicWeekIndex = Math.floor(
    (currentMondayTimestamp - firstAcademicMondayTimestamp) / (7 * DAY_IN_MS),
  );
  const currentWeek: 1 | 2 = Math.abs(academicWeekIndex % 2) === 0 ? 1 : 2;
  const currentDay = new Date(currentDateTimestamp).getUTCDay() || 7;

  return {
    currentWeek,
    currentDay,
    currentLesson: 1,
  };
}

export async function fetchCurrentWeekInfo(): Promise<CurrentTimeInfo> {
  return getCurrentWeekInfo();
}
