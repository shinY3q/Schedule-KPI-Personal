import { useState, useEffect } from 'react';
import type { INPData, INPSubject } from './types/inp';
import type { GroupScheduleRaw } from './types/schedule';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { ScheduleView } from './components/ScheduleView';
import { SubjectsView } from './components/SubjectsView';
import { SettingsView } from './components/SettingsView';
import { SubjectModal } from './components/SubjectModal';
import { LoginView } from './components/LoginView';
import { filterAndProcessSchedule } from './services/matcher';
import { findGroupByName, fetchGroupSchedule, fetchCurrentWeekInfo } from './services/kpiApi';
import { ThemeProvider } from './context/ThemeContext';
import { safeStorage } from './services/storage';
import { normalizeINPData } from './services/inpNormalization';

export function AppContent() {
  // If user previously uploaded INP and didn't log out or clear storage, stay logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return safeStorage.getItem('kpi_has_uploaded_inp') === 'true';
  });

  const [inpData, setInpData] = useState<INPData>(() => {
    const storedData = safeStorage.getJSON<INPData>('kpi_inp_data', {
      studentName: '',
      group: '',
      academicYear: '',
      course: 1,
      faculty: '',
      department: '',
      educationForm: '',
      educationLevel: '',
      specialty: '',
      studyProgram: '',
      totalCredits: 0,
      subjects: [],
      fileName: '',
      uploadDate: '',
    });
    const normalizedData = normalizeINPData(storedData);

    if (normalizedData !== storedData) {
      safeStorage.setJSON('kpi_inp_data', normalizedData);
    }

    return normalizedData;
  });

  const [rawSchedule, setRawSchedule] = useState<GroupScheduleRaw>(() => {
    return safeStorage.getJSON<GroupScheduleRaw>('kpi_raw_schedule', {
      groupCode: '',
      scheduleFirstWeek: [],
      scheduleSecondWeek: [],
    });
  });

  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    return (safeStorage.getItem('kpi_current_tab') as NavTab) || 'home';
  });

  const [currentWeekNum, setCurrentWeekNum] = useState<1 | 2>(() => {
    return (Number(safeStorage.getItem('kpi_current_week')) as 1 | 2) || 1;
  });

  const [selectedSubject, setSelectedSubject] = useState<INPSubject | null>(null);

  const [autoUpdate, setAutoUpdate] = useState<boolean>(() => {
    const saved = safeStorage.getItem('kpi_auto_update');
    return saved !== null ? saved === 'true' : true;
  });

  const [updateInterval, setUpdateInterval] = useState<string>(() => {
    return safeStorage.getItem('kpi_update_interval') || '30m';
  });

  // Sync tab changes to safeStorage
  useEffect(() => {
    safeStorage.setItem('kpi_current_tab', currentTab);
  }, [currentTab]);

  const loadScheduleForGroup = async (groupName: string) => {
    try {
      const groupObj = await findGroupByName(groupName);
      if (groupObj) {
        const schedule = await fetchGroupSchedule(groupObj.id);
        setRawSchedule(schedule);
        safeStorage.setJSON('kpi_raw_schedule', schedule);
      } else {
        const empty: GroupScheduleRaw = { groupCode: '', scheduleFirstWeek: [], scheduleSecondWeek: [] };
        setRawSchedule(empty);
        safeStorage.setJSON('kpi_raw_schedule', empty);
      }
    } catch (err) {
      console.warn('Could not fetch schedule from API, using cached/empty fallback:', err);
    }
  };

  useEffect(() => {
    fetchCurrentWeekInfo().then(info => {
      setCurrentWeekNum(info.currentWeek);
      safeStorage.setItem('kpi_current_week', String(info.currentWeek));
    });

    if (inpData?.group && isLoggedIn) {
      loadScheduleForGroup(inpData.group);
    }
  }, [inpData.group, isLoggedIn]);

  // Background auto-update interval timer
  useEffect(() => {
    if (!autoUpdate || !inpData?.group || !isLoggedIn) return;

    let intervalMs = 30 * 60 * 1000;
    if (updateInterval === '15m') intervalMs = 15 * 60 * 1000;
    else if (updateInterval === '30m') intervalMs = 30 * 60 * 1000;
    else if (updateInterval === '1h') intervalMs = 60 * 60 * 1000;
    else if (updateInterval === '24h') intervalMs = 24 * 60 * 60 * 1000;

    const timer = setInterval(() => {
      loadScheduleForGroup(inpData.group);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [autoUpdate, updateInterval, inpData.group, isLoggedIn]);

  const handleUpdateInp = (newInp: INPData) => {
    const normalizedInp = normalizeINPData(newInp);
    setInpData(normalizedInp);
    safeStorage.setJSON('kpi_inp_data', normalizedInp);
    safeStorage.setItem('kpi_has_uploaded_inp', 'true');
    safeStorage.removeItem('kpi_notification_read');
    loadScheduleForGroup(normalizedInp.group);
  };

  const handleLoginSuccess = (data: INPData) => {
    handleUpdateInp(data);
    setIsLoggedIn(true);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    safeStorage.removeItem('kpi_has_uploaded_inp');
    safeStorage.removeItem('kpi_notification_read');
    setIsLoggedIn(false);
  };

  const handleResetFirstVisit = () => {
    safeStorage.removeItem('kpi_has_uploaded_inp');
    safeStorage.removeItem('kpi_inp_data');
    safeStorage.removeItem('kpi_notification_read');
    safeStorage.removeItem('kpi_raw_schedule');
    setInpData({
      studentName: '',
      group: '',
      academicYear: '',
      course: 1,
      faculty: '',
      department: '',
      educationForm: '',
      educationLevel: '',
      specialty: '',
      studyProgram: '',
      totalCredits: 0,
      subjects: [],
      fileName: '',
      uploadDate: '',
    });
    setIsLoggedIn(false);
  };

  const { week1, week2 } = filterAndProcessSchedule(rawSchedule, inpData, 7);
  const activeWeekSchedule = currentWeekNum === 1 ? week1 : week2;

  if (!isLoggedIn) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 transition-colors duration-200 selection:bg-blue-200 dark:selection:bg-blue-700">
      <a
        href="#main-content"
        className="fixed left-3 top-3 z-[100] -translate-y-20 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition-transform focus:translate-y-0"
      >
        Перейти до вмісту
      </a>

      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={handleLogout}
        groupName={inpData.group}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen min-h-[100dvh] overflow-x-hidden">
        <Header
          inp={inpData}
        />

        <main id="main-content" tabIndex={-1} className="app-main flex-1 w-full">
          {currentTab === 'home' && (
            <HomeView
              inp={inpData}
              weekSchedule={activeWeekSchedule}
              currentWeekNum={currentWeekNum}
              onSwitchWeek={setCurrentWeekNum}
              onNavigateToSchedule={() => setCurrentTab('schedule')}
              onNavigateToSubjects={() => setCurrentTab('subjects')}
              onUploadNewInp={() => setCurrentTab('settings')}
            />
          )}

          {currentTab === 'schedule' && (
            <ScheduleView
              weekSchedule={activeWeekSchedule}
              currentWeekNum={currentWeekNum}
              onSwitchWeek={setCurrentWeekNum}
              onSelectSubject={setSelectedSubject}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsView
              inp={inpData}
              onSelectSubject={setSelectedSubject}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              inp={inpData}
              onUpdateInp={handleUpdateInp}
              onResetFirstVisit={handleResetFirstVisit}
              autoUpdate={autoUpdate}
              onAutoUpdateChange={(enabled) => {
                setAutoUpdate(enabled);
                safeStorage.setItem('kpi_auto_update', String(enabled));
              }}
              updateInterval={updateInterval}
              onUpdateIntervalChange={(interval) => {
                setUpdateInterval(interval);
                safeStorage.setItem('kpi_update_interval', interval);
              }}
            />
          )}
        </main>
      </div>

      {selectedSubject && (
        <SubjectModal
          subject={selectedSubject}
          onClose={() => setSelectedSubject(null)}
          weekSchedule={activeWeekSchedule}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
