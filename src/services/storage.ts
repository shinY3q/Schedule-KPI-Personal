/**
 * Safari-safe and cross-browser persistent storage utility.
 * Supports localStorage, sessionStorage, document.cookie fallback, and in-memory cache.
 */

const memoryStore = new Map<string, string>();

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  try {
    const match = document.cookie.match(new RegExp('(^| )' + encodeURIComponent(name) + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  } catch (e) {
    return null;
  }
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === 'undefined') return;
  try {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (e) {
    // ignore
  }
}

function removeCookie(name: string) {
  if (typeof document === 'undefined') return;
  try {
    document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
  } catch (e) {
    // ignore
  }
}

export const safeStorage = {
  getItem(key: string): string | null {
    // 1. Try localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const item = window.localStorage.getItem(key);
        if (item !== null) {
          memoryStore.set(key, item);
          return item;
        }
      }
    } catch (e) {
      console.warn(`[Storage] localStorage.getItem failed for ${key}:`, e);
    }

    // 2. Try cookie fallback
    const cookieVal = getCookie(key);
    if (cookieVal !== null) {
      memoryStore.set(key, cookieVal);
      return cookieVal;
    }

    // 3. Try in-memory fallback
    return memoryStore.get(key) || null;
  },

  setItem(key: string, value: string): void {
    // Always update in-memory cache
    memoryStore.set(key, value);

    // 1. Try localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (e) {
      console.warn(`[Storage] localStorage.setItem failed for ${key}:`, e);
    }

    // 2. For short config values (< 3500 chars), also persist in Cookie for Safari survival
    if (value.length < 3500) {
      setCookie(key, value);
    }
  },

  removeItem(key: string): void {
    memoryStore.delete(key);

    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn(`[Storage] localStorage.removeItem failed for ${key}:`, e);
    }

    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.removeItem(key);
      }
    } catch (e) {}

    removeCookie(key);
  },

  getJSON<T>(key: string, defaultValue: T): T {
    const raw = this.getItem(key);
    if (!raw) return defaultValue;
    try {
      return JSON.parse(raw) as T;
    } catch (e) {
      console.warn(`[Storage] Failed to parse JSON for key ${key}:`, e);
      return defaultValue;
    }
  },

  setJSON<T>(key: string, value: T): void {
    try {
      this.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`[Storage] Failed to stringify JSON for key ${key}:`, e);
    }
  }
};
