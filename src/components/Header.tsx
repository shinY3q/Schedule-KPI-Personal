import React, { useState, useEffect, useRef } from 'react';
import { Bell, User, Check, RefreshCw, Sun, Moon, Laptop, CheckCheck } from 'lucide-react';
import type { INPData } from '../types/inp';
import { useTheme } from '../context/ThemeContext';
import { safeStorage } from '../services/storage';

interface HeaderProps {
  inp: INPData;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  inp,
  onRefresh,
  isRefreshing = false,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [hasUnreadNotification, setHasUnreadNotification] = useState<boolean>(() => {
    return safeStorage.getItem('kpi_notification_read') !== 'true';
  });
  const { theme, setTheme } = useTheme();
  const notificationRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside notification popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowNotifications(false);
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showNotifications]);

  const markAsRead = () => {
    setHasUnreadNotification(false);
    safeStorage.setItem('kpi_notification_read', 'true');
  };

  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (nextState || hasUnreadNotification) {
      markAsRead();
    }
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    markAsRead();
  };

  return (
    <header className="min-h-16 bg-white/95 dark:bg-slate-900/95 supports-[backdrop-filter]:bg-white/85 dark:supports-[backdrop-filter]:bg-slate-900/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 px-3 sm:px-6 lg:px-8 py-2 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile-only logo */}
        <div className="md:hidden w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-0.5 flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-700 flex-shrink-0">
          <img src={`${import.meta.env.BASE_URL}KPI-1.png`} alt="КПІ" className="w-full h-full object-contain dark:hidden" />
          <img src={`${import.meta.env.BASE_URL}KPI-2-black-theme.png`} alt="КПІ" className="w-full h-full object-contain hidden dark:block" />
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <span>КПІ</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">Мій розклад</span>
            <span className="md:hidden max-[374px]:hidden text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800/60 ml-0.5">
              {inp.group || 'ІК-31'}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-3 lg:gap-4">
        {/* Quick Theme Switcher */}
        <div role="group" aria-label="Тема оформлення" className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setTheme('light')}
            title="Світла тема"
            aria-label="Увімкнути світлу тему"
            aria-pressed={theme === 'light'}
            className={`p-1.5 sm:p-2 rounded-lg transition-[color,background-color,box-shadow,transform] duration-200 cursor-pointer active:scale-90 ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            title="Темна тема"
            aria-label="Увімкнути темну тему"
            aria-pressed={theme === 'dark'}
            className={`p-1.5 sm:p-2 rounded-lg transition-[color,background-color,box-shadow,transform] duration-200 cursor-pointer active:scale-90 ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setTheme('system')}
            title="Системна тема"
            aria-label="Використовувати системну тему"
            aria-pressed={theme === 'system'}
            className={`p-1.5 sm:p-2 rounded-lg transition-[color,background-color,box-shadow,transform] duration-200 cursor-pointer active:scale-90 ${
              theme === 'system'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Laptop className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={onRefresh}
          title="Оновити розклад"
          aria-label={isRefreshing ? 'Розклад оновлюється' : 'Оновити розклад'}
          aria-busy={isRefreshing}
          className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-[color,background-color,transform] duration-200 relative cursor-pointer active:scale-90"
        >
          <RefreshCw
            aria-hidden="true"
            className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}
          />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            type="button"
            onClick={handleToggleNotifications}
            title="Сповіщення"
            aria-label={showNotifications ? 'Закрити сповіщення' : 'Відкрити сповіщення'}
            aria-expanded={showNotifications}
            aria-controls="notifications-panel"
            className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-[color,background-color,transform] duration-200 relative cursor-pointer active:scale-90"
          >
            <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
            {hasUnreadNotification && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div id="notifications-panel" role="region" aria-label="Сповіщення" className="fixed left-3 right-3 top-[4.5rem] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-popover-enter">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Сповіщення</span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCheck className="w-3 h-3" />
                    <span>Прочитано</span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCloseNotifications}
                  className="rounded-md text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  Закрити
                </button>
              </div>
              <div className="mt-3 space-y-2.5">
                <div className="p-3 bg-blue-50/80 dark:bg-slate-800/90 rounded-xl text-xs border border-blue-100 dark:border-slate-700 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 dark:text-slate-100">ІНП успішно завантажено</p>
                    <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Група <strong>{inp.group}</strong>, {inp.subjects.length} дисциплін враховано у вашому розкладі.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User avatar & info */}
        <div className="hidden sm:flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 text-white flex items-center justify-center font-semibold text-xs sm:text-sm shadow-sm flex-shrink-0">
            {inp.studentName ? inp.studentName.charAt(0) : <User className="w-4 h-4" />}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {inp.studentName.split(' ').slice(0, 2).join(' ')}
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {inp.group} • {inp.course} курс
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
