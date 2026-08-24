import React, { useState } from 'react';
import { Bell, User, Check, RefreshCw, Sun, Moon, Laptop } from 'lucide-react';
import type { INPData } from '../types/inp';
import { useTheme } from '../context/ThemeContext';
import kpiLogoLight from '../assets/KPI-1.png';
import kpiLogoDark from '../assets/KPI-2-black-theme.png';

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
    return localStorage.getItem('kpi_notification_read') !== 'true';
  });
  const { theme, setTheme } = useTheme();
  
  const [spinClass, setSpinClass] = useState('');
  React.useEffect(() => {
    if (isRefreshing) {
      setSpinClass('animate-spin text-blue-600 dark:text-blue-400');
    }
  }, [isRefreshing]);
  const handleToggleNotifications = () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);
    if (hasUnreadNotification) {
      setHasUnreadNotification(false);
      localStorage.setItem('kpi_notification_read', 'true');
    }
  };

  const handleCloseNotifications = () => {
    setShowNotifications(false);
    if (hasUnreadNotification) {
      setHasUnreadNotification(false);
      localStorage.setItem('kpi_notification_read', 'true');
    }
  };

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Mobile-only logo */}
        <div className="md:hidden w-8 h-8 rounded-lg bg-white dark:bg-slate-800 p-0.5 flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-700 flex-shrink-0">
          <img src={kpiLogoLight} alt="КПІ" className="w-full h-full object-contain dark:hidden" />
          <img src={kpiLogoDark} alt="КПІ" className="w-full h-full object-contain hidden dark:block" />
        </div>

        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
            <span>КПІ</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal hidden sm:inline">Мій розклад</span>
            <span className="md:hidden text-[10px] px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-bold border border-blue-200/60 dark:border-blue-800/60 ml-0.5">
              {inp.group || 'ІК-31'}
            </span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Theme Switcher */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setTheme('light')}
            title="Світла тема"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'light'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('dark')}
            title="Темна тема"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              theme === 'dark'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setTheme('system')}
            title="Системна тема"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
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
          onClick={onRefresh}
          title="Оновити розклад"
          className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors relative cursor-pointer active:scale-95"
        >
          <RefreshCw
            className={`w-4 h-4 ${spinClass}`}
            onAnimationIteration={() => {
              if (!isRefreshing) {
                setSpinClass('text-slate-500 dark:text-slate-400 transition-colors');
                setTimeout(() => setSpinClass(''), 50);
              }
            }}
          />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={handleToggleNotifications}
            title="Сповіщення"
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative cursor-pointer active:scale-95"
          >
            <Bell className="w-4 sm:w-5 h-4 sm:h-5" />
            {hasUnreadNotification && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] max-w-xs sm:w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">Сповіщення</span>
                <span
                  onClick={handleCloseNotifications}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer"
                >
                  Закрити
                </span>
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
        <div className="flex items-center gap-2.5 sm:gap-3 pl-2 sm:pl-3 border-l border-slate-200 dark:border-slate-800">
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
