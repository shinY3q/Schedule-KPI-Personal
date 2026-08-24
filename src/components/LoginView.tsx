import React, { useState } from 'react';
import { Upload, FileText, Sparkles, ShieldCheck } from 'lucide-react';
import type { INPData } from '../types/inp';
import { parsePdfINP } from '../services/pdfParser';
import kpiLogoLight from '../assets/KPI-1.png';
import kpiLogoDark from '../assets/KPI-2-black-theme.png';

interface LoginViewProps {
  onLoginSuccess: (inp: INPData) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg('');
    try {
      const parsed = await parsePdfINP(file);
      if (parsed.subjects.length === 0) {
        setErrorMsg('Не вдалося розпізнати предмети у PDF. Переконайтеся, що файл містить актуальний ІНП.');
        return;
      }
      onLoginSuccess(parsed);
    } catch (err) {
      console.error('Failed to parse uploaded PDF:', err);
      setErrorMsg('Помилка при обробці PDF. Перевірте формат файлу.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handleFileUpload(file);
      } else {
        setErrorMsg('Будь ласка, завантажте файл у форматі PDF.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-6 lg:p-8 transition-colors duration-250">
      <div className="max-w-2xl w-full bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden flex flex-col animate-page-enter">
        
        {/* Top Header Banner */}
        <div className="bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 p-6 sm:p-10 text-white relative overflow-hidden text-center flex flex-col items-center">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-blue-600/20 blur-2xl pointer-events-none animate-glow"></div>
          <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-2xl pointer-events-none"></div>

          {/* Theme-responsive KPI Logo */}
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-800 p-2 sm:p-2.5 flex items-center justify-center shadow-2xl border border-white/30 dark:border-slate-700 mb-4 sm:mb-5 flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <img src={kpiLogoLight} alt="КПІ ім. Ігоря Сікорського" className="w-full h-full object-contain dark:hidden" />
            <img src={kpiLogoDark} alt="КПІ ім. Ігоря Сікорського" className="w-full h-full object-contain hidden dark:block" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] sm:text-xs font-semibold text-blue-200 backdrop-blur-md mb-2 sm:mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>КПІ ім. Ігоря Сікорського</span>
          </div>

          <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight">
            КПІ <span className="text-blue-300">Мій розклад</span>
          </h1>

          <p className="text-blue-100/90 text-xs sm:text-sm max-w-lg mt-1.5 sm:mt-2 leading-relaxed">
            Персоналізований розклад навчальних занять на основі вашого Індивідуального навчального плану (ІНП).
          </p>
        </div>

        {/* Upload & Action Area */}
        <div className="p-5 sm:p-10 space-y-4 sm:space-y-6">
          
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 text-xs font-semibold text-center animate-slide-up">
              {errorMsg}
            </div>
          )}

          {/* Big Drag and Drop Box */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl sm:rounded-3xl p-6 sm:p-10 text-center transition-all duration-200 flex flex-col items-center justify-center gap-3 sm:gap-4 cursor-pointer ${
              dragOver
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 scale-[1.01]'
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 bg-slate-50/60 dark:bg-slate-800/40 hover:scale-[1.005]'
            }`}
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs transition-transform duration-200 group-hover:scale-110">
              <Upload className={`w-6 h-6 sm:w-8 sm:h-8 ${isUploading ? 'animate-bounce' : ''}`} />
            </div>

            <div className="space-y-1">
              <h3 className="text-sm sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                {isUploading ? 'Обробка навчального плану...' : 'Перетягніть сюди PDF-файл ІНП'}
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                або натисніть кнопку нижче для вибору файлу
              </p>
            </div>

            <label className="mt-1 sm:mt-2 w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer">
              <FileText className="w-4 h-4" />
              <span>Обрати файл ІНП (.pdf)</span>
              <input
                type="file"
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />
            </label>
          </div>

          {/* Feature Badges */}
          <div className="pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Точний персональний розклад занять</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Збереження розкладу у вашому браузері</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
