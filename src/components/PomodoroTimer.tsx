
import React, { useState, useEffect } from 'react';
import StatsView from './StatsView';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import TodayStats from './TodayStats';
import SettingsPanel from './SettingsPanel';
import Navigation from './Navigation';
import BuyMeCoffeeButton from './BuyMeCoffeeButton';
import { useTimerLogic } from '../hooks/useTimerLogic';
import { useSettings } from '../hooks/useSettings';

export default function PomodoroTimer() {
  const [currentView, setCurrentView] = useState('timer');
  
  const {
    workDuration,
    breakDuration,
    autoBreak,
    autoStart,
    darkMode,
    showSettings,
    setWorkDuration,
    setBreakDuration,
    setAutoBreak,
    setAutoStart,
    setDarkMode,
    setShowSettings,
    saveSettings
  } = useSettings();

  const {
    minutes,
    seconds,
    isActive,
    isBreak,
    sessionHistory,
    toggleTimer,
    resetTimer,
    clearAllData,
    setSessionHistory
  } = useTimerLogic({ workDuration, breakDuration, autoBreak, autoStart });

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const currentDuration = isBreak ? breakDuration : workDuration;
  const progress = ((currentDuration * 60 - (minutes * 60 + seconds)) / (currentDuration * 60)) * 100;

  // Get today's sessions and calculate completed pomodoro cycles
  const today = new Date().toDateString();
  const todaySessions = sessionHistory.filter(s => s.date === today);
  const workSessions = todaySessions.filter(s => s.type === 'work');
  const breakSessions = todaySessions.filter(s => s.type === 'break');
  const completedSessions = Math.min(workSessions.length, breakSessions.length);
  const totalWorkMinutes = workSessions.reduce((sum, s) => sum + s.duration, 0);

  const exportData = () => {
    const sessionsByDate = sessionHistory.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = { work: [], break: [] };
      }
      acc[session.date][session.type].push(session);
      return acc;
    }, {} as Record<string, { work: any[], break: any[] }>);

    const csvHeaders = 'Day,Date,Sessions,Work Min,Break Min\n';
    const csvRows = Object.entries(sessionsByDate).map(([date, sessions]) => {
      const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      const sessionCount = Math.min(sessions.work.length, sessions.break.length);
      const workMin = sessions.work.reduce((sum, s) => sum + s.duration, 0);
      const breakMin = sessions.break.reduce((sum, s) => sum + s.duration, 0);
      return `${dayName},${date},${sessionCount},${workMin},${breakMin}`;
    });

    const totalSessionCount = Object.values(sessionsByDate).reduce((sum, sessions) => 
      sum + Math.min(sessions.work.length, sessions.break.length), 0
    );
    const totalWorkMin = Object.values(sessionsByDate).reduce((sum, sessions) => 
      sum + sessions.work.reduce((s, session) => s + session.duration, 0), 0
    );
    const totalBreakMin = Object.values(sessionsByDate).reduce((sum, sessions) => 
      sum + sessions.break.reduce((s, session) => s + session.duration, 0), 0
    );

    csvRows.push('');
    csvRows.push('Weekly Summary,Total,Sessions,Work Min,Break Min');
    csvRows.push(`Week Total,,${totalSessionCount},${totalWorkMin},${totalBreakMin}`);

    const csvContent = csvHeaders + csvRows.join('\n');
    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pomodoro-sessions-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const themeClasses = darkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-red-50 to-orange-50 text-gray-800';

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${themeClasses}`}>
      <div className={`rounded-3xl shadow-2xl p-6 w-full max-w-md text-center relative border transition-all duration-300 ${cardClasses}`}>
        
        <Navigation 
          currentView={currentView}
          setCurrentView={setCurrentView}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          setShowSettings={setShowSettings}
        />

        {showSettings && (
          <SettingsPanel
            workDuration={workDuration}
            breakDuration={breakDuration}
            autoBreak={autoBreak}
            autoStart={autoStart}
            darkMode={darkMode}
            setWorkDuration={setWorkDuration}
            setBreakDuration={setBreakDuration}
            setAutoBreak={setAutoBreak}
            setAutoStart={setAutoStart}
            onSaveSettings={saveSettings}
            onClose={() => setShowSettings(false)}
          />
        )}

        {currentView === 'timer' && (
          <>
            <TimerDisplay
              minutes={minutes}
              seconds={seconds}
              isBreak={isBreak}
              workDuration={workDuration}
              breakDuration={breakDuration}
              progress={progress}
            />

            <TimerControls
              isActive={isActive}
              onToggleTimer={toggleTimer}
              onResetTimer={resetTimer}
              darkMode={darkMode}
            />

            <TodayStats
              completedSessions={completedSessions}
              totalWorkMinutes={totalWorkMinutes}
            />
          </>
        )}

        {currentView === 'stats' && (
          <StatsView 
            sessionHistory={sessionHistory} 
            darkMode={darkMode}
            onExportData={exportData}
            onClearData={clearAllData}
          />
        )}

        <BuyMeCoffeeButton darkMode={darkMode} />
      </div>
    </div>
  );
}
