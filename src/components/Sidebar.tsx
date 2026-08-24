import React from 'react';
import { Home, Calendar, BookOpen, Settings, LogOut } from 'lucide-react';

export type NavTab = 'home' | 'schedule' | 'subjects' | 'settings';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onLogout: () => void;
  groupName: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  onLogout,
  groupName,
}) => {
  const navItems = [
    { id: 'home' as NavTab, label: 'Головна', icon: Home },
    { id: 'schedule' as NavTab, label: 'Розклад', icon: Calendar },
    { id: 'subjects' as NavTab, label: 'Предмети', icon: BookOpen },
    { id: 'settings' as NavTab, label: 'Налаштування', icon: Settings },
  ];

  return (
    <>
      {/* Desktop Sidebar (md and up) */}
      <aside className="hidden md:flex md:w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col justify-between md:h-screen md:sticky top-0 select-none shadow-xs z-30 transition-colors duration-300">
        <div>
          {/* Logo Branding with Theme-responsive KPI Logo */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 p-1 flex items-center justify-center shadow-md border border-slate-100 dark:border-slate-700 overflow-hidden flex-shrink-0 transition-transform duration-200 hover:scale-105">
              <img src={`${import.meta.env.BASE_URL}KPI-1.png`} alt="КПІ Логотип" className="w-full h-full object-contain dark:hidden" />
              <img src={`${import.meta.env.BASE_URL}KPI-2-black-theme.png`} alt="КПІ Логотип" className="w-full h-full object-contain hidden dark:block" />
            </div>
            <div>
              <div className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                <span>КПІ</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 font-semibold border border-blue-200/60 dark:border-blue-800/60">
                  {groupName || 'ІК-31'}
                </span>
              </div>
              <div className="text-xs text-slate-400 dark:text-slate-500 font-medium">Мій розклад</div>
            </div>
          </div>

          {/* Navigation items */}
          <nav className="p-3 sm:p-4 space-y-1.5 flex flex-col">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 text-left cursor-pointer active:scale-[0.98] outline-none ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 font-semibold shadow-xs border border-blue-100 dark:border-blue-900/60'
                      : 'bg-transparent border border-transparent shadow-none text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 transition-colors duration-200 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto block w-1.5 h-4 bg-blue-600 dark:bg-blue-500 rounded-full animate-slide-up" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-medium text-sm text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 active:scale-[0.98] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Вийти</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 flex items-center justify-around shadow-lg transition-colors duration-300">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all duration-200 cursor-pointer active:scale-95 outline-none ${
                isActive
                  ? 'text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full animate-ping" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
