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

export async function fetchCurrentWeekInfo(): Promise<CurrentTimeInfo> {
  try {
    const res = await fetch(`${BASE_URL}/time/current`);
    if (res.ok) {
      const data = await res.json();
      return {
        currentWeek: data.currentWeek === 2 ? 2 : 1,
        currentDay: data.currentDay || 1,
        currentLesson: data.currentLesson || 1,
      };
    }
  } catch {
    // academic calendar calculation fallback
  }

  const now = new Date();
  const sep1 = new Date(now.getFullYear(), 8, 1);
  const diffDays = Math.floor((now.getTime() - sep1.getTime()) / (1000 * 60 * 60 * 24));
  const weekNum = Math.floor(diffDays / 7) + 1;
  const isOdd = weekNum % 2 === 1;

  return {
    currentWeek: isOdd ? 1 : 2,
    currentDay: now.getDay() === 0 ? 7 : now.getDay(),
    currentLesson: 1,
  };
}
