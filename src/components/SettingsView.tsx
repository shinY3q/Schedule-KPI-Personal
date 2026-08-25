import React, { useState } from 'react';
import {
  FileText,
  CheckCircle2,
  LogOut,
  Sun,
  Moon,
  Laptop
} from 'lucide-react';
import type { INPData } from '../types/inp';
import { useTheme } from '../context/ThemeContext';
import { safeStorage } from '../services/storage';

interface SettingsViewProps {
  inp: INPData;
  onUpdateInp: (newInp: INPData) => void;
  onResetFirstVisit: () => void;
  autoUpdate?: boolean;
  onAutoUpdateChange?: (enabled: boolean) => void;
  updateInterval?: string;
  onUpdateIntervalChange?: (interval: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  inp,
  onUpdateInp,
  onResetFirstVisit,
  autoUpdate: propAutoUpdate,
  onAutoUpdateChange,
  updateInterval: propUpdateInterval,
  onUpdateIntervalChange,
}) => {
  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => {
    if (propAutoUpdate !== undefined) return propAutoUpdate;
    const saved = safeStorage.getItem('kpi_auto_update');
    return saved !== null ? saved === 'true' : true;
  });

  const [updateInterval, setUpdateInterval] = useState<string>(() => {
    if (propUpdateInterval !== undefined) return propUpdateInterval;
    return safeStorage.getItem('kpi_update_interval') || '30m';
  });

  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const { theme, setTheme } = useTheme();

  const handleToggleAutoUpdate = () => {
    const next = !autoUpdate;
    setAutoUpdate(next);
    safeStorage.setItem('kpi_auto_update', String(next));
    onAutoUpdateChange?.(next);
  };

  const handleIntervalChange = (val: string) => {
    setUpdateInterval(val);
    safeStorage.setItem('kpi_update_interval', val);
    onUpdateIntervalChange?.(val);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    try {
      const { parsePdfINP } = await import('../services/pdfParser');
      const parsed = await parsePdfINP(file);
      onUpdateInp(parsed);
      setSuccessMsg('ІНП успішно оновлено!');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-4 sm:space-y-6 animate-page-enter">
      
      {/* Title */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-all duration-200 hover:shadow-sm">
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Налаштування
        </h1>
        <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Керування файлом ІНП, синхронізацією розкладу та темою оформлення
        </p>
      </div>

      {successMsg && (
        <div role="status" aria-live="polite" className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-slide-up">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Left Card: Preferences & INP */}
        <div className="space-y-4 sm:space-y-6">
          
          {/* INP File Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm">
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Файл ІНП
            </h2>

            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/60 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors duration-200">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-4 sm:w-5 h-4 sm:h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" title={inp.fileName}>
                    {inp.fileName || 'ІНП_ІК-31_2026.pdf'}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500">
                    {inp.uploadDate ? `Завантажено: ${inp.uploadDate}` : 'Завантажено'} • Група: {inp.group || 'ІК-31'}
                  </div>
                </div>
              </div>

              <label aria-disabled={isUploading} className={`w-full sm:w-auto min-h-10 px-3.5 py-2 rounded-xl bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-650 active:scale-95 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0 shadow-2xs has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-blue-500 has-[:focus-visible]:ring-offset-2 ${isUploading ? 'pointer-events-none opacity-70' : ''}`}>
                <span>{isUploading ? 'Обробка...' : 'Змінити файл'}</span>
                <input
                  type="file"
                  accept=".pdf"
                  disabled={isUploading}
                  className="sr-only"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>

            {/* Drag and drop secondary area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              className={`p-4 border-2 border-dashed rounded-2xl text-center transition-all duration-200 ${
                dragOver
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 scale-[1.01]'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:border-blue-400'
              }`}
            >
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Перетягніть сюди PDF-файл навчального плану для оновлення розкладу
              </span>
            </div>
          </div>

          {/* Schedule Auto-Update */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Оновлення розкладу
            </h2>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Автоматичне оновлення
                </div>
                <div className="text-xs text-slate-400 dark:text-slate-500">
                  Синхронізація розкладу у фоновому режимі
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={autoUpdate}
                aria-label="Автоматичне оновлення розкладу"
                onClick={handleToggleAutoUpdate}
                className={`switch-btn ${autoUpdate ? 'switch-on' : ''}`}
              />
            </div>

            {autoUpdate && (
              <div className="pt-2 animate-slide-up">
                <label htmlFor="update-interval" className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  Час оновлення
                </label>
                <select
                  id="update-interval"
                  value={updateInterval}
                  onChange={(e) => handleIntervalChange(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-blue-500 transition-colors duration-200 cursor-pointer"
                >
                  <option value="15m">Кожні 15 хвилин</option>
                  <option value="30m">Кожні 30 хвилин</option>
                  <option value="1h">Кожну 1 годину</option>
                  <option value="24h">Раз на добу</option>
                </select>
              </div>
            )}
          </div>

          {/* Theme Selector */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 transition-all duration-200 hover:shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              Тема оформлення
            </h2>

            {/* Theme 3-option radio pill */}
            <div>
              <div className="grid grid-cols-3 gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  aria-pressed={theme === 'light'}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    theme === 'light'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Sun className="w-3.5 h-3.5" />
                  <span>Світла</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  aria-pressed={theme === 'dark'}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    theme === 'dark'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Moon className="w-3.5 h-3.5" />
                  <span>Темна</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  aria-pressed={theme === 'system'}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                    theme === 'system'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs scale-[1.02]'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Системна</span>
                </button>
              </div>
            </div>

            {/* Logout button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={onResetFirstVisit}
                className="w-full py-3 px-4 rounded-2xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 active:scale-[0.98] border border-red-200 dark:border-red-800/60 text-red-700 dark:text-red-300 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
              >
                <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span>Вийти з розкладу</span>
              </button>
            </div>
          </div>

        </div>

        {/* Right Card: About Application with Theme-Adaptive KPI Logo */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between items-center text-center space-y-6 transition-all duration-200 hover:shadow-sm">
          <div className="space-y-4 flex flex-col items-center">
            <div className="w-28 h-28 rounded-3xl bg-white dark:bg-slate-800 p-2 flex items-center justify-center shadow-xl border border-slate-200 dark:border-slate-700 transition-transform duration-300 hover:scale-105">
              <img src={`${import.meta.env.BASE_URL}KPI-1.png`} alt="КПІ ім. Ігоря Сікорського" className="w-full h-full object-contain dark:hidden" />
              <img src={`${import.meta.env.BASE_URL}KPI-2-black-theme.png`} alt="КПІ ім. Ігоря Сікорського" className="w-full h-full object-contain hidden dark:block" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                КПІ <span className="text-blue-600 dark:text-blue-400">Мій розклад</span>
              </h2>
              <div className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-600 dark:text-slate-300">
                Версія 1.0.0
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Персональний розклад навчальних занять для студентів Національного технічного університету України «Київський політехнічний інститут імені Ігоря Сікорського».
            </p>
          </div>

          <div className="space-y-3 pt-6 border-t border-slate-100 dark:border-slate-800 w-full text-xs">
            <div className="text-[11px] text-slate-400 dark:text-slate-500">
              © 2026 КПІ ім. Ігоря Сікорського. Всі права захищено.
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
