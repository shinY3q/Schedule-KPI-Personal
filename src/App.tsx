import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import type { NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { HomeView } from './components/HomeView';
import { ScheduleView } from './components/ScheduleView';
import { SubjectsView } from './components/SubjectsView';
import { SettingsView } from './components/SettingsView';
import { SubjectModal } from './components/SubjectModal';
import type { INPData, INPSubject } from './types/inp';
import type { GroupScheduleRaw } from './types/schedule';

import { filterAndProcessSchedule } from './services/matcher';
import { findGroupByName, fetchGroupSchedule, fetchCurrentWeekInfo } from './services/kpiApi';
import { ThemeProvider } from './context/ThemeContext';

export function AppContent() {
  // If user previously uploaded INP and didn't log out or clear storage, stay logged in
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('kpi_has_uploaded_inp') === 'true';
  });

  const [inpData, setInpData] = useState<INPData>(() => {
    const saved = localStorage.getItem('kpi_inp_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved INP data:', e);
      }
    }
    return {
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
    };
  });

  const [rawSchedule, setRawSchedule] = useState<GroupScheduleRaw>(() => {
    const saved = sessionStorage.getItem('kpi_raw_schedule');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return { groupCode: '', scheduleFirstWeek: [], scheduleSecondWeek: [] };
  });

  const [currentTab, setCurrentTab] = useState<NavTab>(() => {
    return (sessionStorage.getItem('kpi_current_tab') as NavTab) || 'home';
  });

  const [currentWeekNum, setCurrentWeekNum] = useState<1 | 2>(() => {
    return (Number(sessionStorage.getItem('kpi_current_week')) as 1 | 2) || 1;
  });

  const [selectedSubject, setSelectedSubject] = useState<INPSubject | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Sync tab changes to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('kpi_current_tab', currentTab);
  }, [currentTab]);

  const loadScheduleForGroup = async (groupName: string) => {
    setIsRefreshing(true);
    try {
      const groupObj = await findGroupByName(groupName);
      if (groupObj) {
        const schedule = await fetchGroupSchedule(groupObj.id);
        setRawSchedule(schedule);
        sessionStorage.setItem('kpi_raw_schedule', JSON.stringify(schedule));
      } else {
        const empty: GroupScheduleRaw = { groupCode: '', scheduleFirstWeek: [], scheduleSecondWeek: [] };
        setRawSchedule(empty);
        sessionStorage.setItem('kpi_raw_schedule', JSON.stringify(empty));
      }
    } catch (err) {
      console.warn('Could not fetch schedule from API, using empty fallback:', err);
      // We don't overwrite with RAW_SCHEDULE_IK31 here either
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCurrentWeekInfo().then(info => {
      setCurrentWeekNum(info.currentWeek);
      sessionStorage.setItem('kpi_current_week', String(info.currentWeek));
    });

    if (inpData?.group && isLoggedIn) {
      loadScheduleForGroup(inpData.group);
    }
  }, [inpData.group, isLoggedIn]);

  const handleUpdateInp = (newInp: INPData) => {
    setInpData(newInp);
    localStorage.setItem('kpi_inp_data', JSON.stringify(newInp));
    localStorage.setItem('kpi_has_uploaded_inp', 'true');
    localStorage.removeItem('kpi_notification_read');
    loadScheduleForGroup(newInp.group);
  };

  const handleLoginSuccess = (data: INPData) => {
    handleUpdateInp(data);
    setIsLoggedIn(true);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    localStorage.removeItem('kpi_has_uploaded_inp');
    localStorage.removeItem('kpi_notification_read');
    setIsLoggedIn(false);
  };

  const handleResetFirstVisit = () => {
    localStorage.removeItem('kpi_has_uploaded_inp');
    localStorage.removeItem('kpi_inp_data');
    localStorage.removeItem('kpi_notification_read');
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row text-slate-800 dark:text-slate-100 transition-colors duration-200">
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onLogout={handleLogout}
        groupName={inpData.group}
      />

      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        <Header
          inp={inpData}
          onRefresh={() => loadScheduleForGroup(inpData.group)}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 pb-24 md:pb-16">
          {currentTab === 'home' && (
            <HomeView
              inp={inpData}
              weekSchedule={activeWeekSchedule}
              currentWeekNum={currentWeekNum}
              onSwitchWeek={setCurrentWeekNum}
              onNavigateToSchedule={() => setCurrentTab('schedule')}
              onNavigateToSubjects={() => setCurrentTab('subjects')}
              onUploadNewInp={() => setCurrentTab('settings')}
              onRefreshSchedule={() => loadScheduleForGroup(inpData.group)}
              isRefreshing={isRefreshing}
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
