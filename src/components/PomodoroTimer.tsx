import React, { useState, useEffect } from 'react';
import StatsView from './StatsView';
import TimerDisplay from './TimerDisplay';
import TimerControls from './TimerControls';
import SettingsPanel from './SettingsPanel';
import Navigation from './Navigation';
import BuyMeCoffeeButton from './BuyMeCoffeeButton';
import DailyView from './DailyView';
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

  // Export functions
  const exportToCSV = (data: any[], filename: string) => {
    const processSessionData = (sessions: any[]) => {
      const groupedByDate = sessions.reduce((acc, session) => {
        const date = session.date;
        if (!acc[date]) {
          acc[date] = {
            workSessions: [],
            breakSessions: [],
            workMinutes: 0,
            breakMinutes: 0,
            times: []
          };
        }
        
        if (session.type === 'work') {
          acc[date].workSessions.push(session);
          acc[date].workMinutes += session.duration;
        } else {
          acc[date].breakSessions.push(session);
          acc[date].breakMinutes += session.duration;
        }
        
        acc[date].times.push(session.timestamp);
        return acc;
      }, {});

      const csvRows = [
        ['Date', 'Day', 'Work_Sessions', 'Break_Sessions', 'Total_Work_Minutes', 'Total_Break_Minutes', 'Session_Times']
      ];

      Object.entries(groupedByDate).forEach(([date, data]: [string, any]) => {
        const day = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
        csvRows.push([
          date,
          day,
          data.workSessions.length,
          data.breakSessions.length,
          data.workMinutes,
          data.breakMinutes,
          `"${data.times.join(',')}"`
        ]);
      });

      return csvRows.map(row => row.join(',')).join('\n');
    };

    const csvContent = processSessionData(data);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportAllData = () => {
    exportToCSV(sessionHistory, 'pomodoro-all-sessions.csv');
  };

  const handleExportTodayData = () => {
    const today = new Date().toDateString();
    const todaysSessions = sessionHistory.filter(session => session.date === today);
    exportToCSV(todaysSessions, 'pomodoro-today-sessions.csv');
  };

  const currentDuration = isBreak ? breakDuration : workDuration;
  const progress = ((currentDuration * 60 - (minutes * 60 + seconds)) / (currentDuration * 60)) * 100;

  const themeClasses = darkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-red-50 to-orange-50 text-gray-800';

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${themeClasses}`}>
      <div className={`rounded-3xl shadow-2xl p-6 w-full max-w-[800px] text-center relative border transition-all duration-300 ${cardClasses}`}>
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
            onExportAllData={handleExportAllData}
            onExportTodayData={handleExportTodayData}
            onClearAllData={clearAllData}
          />
        )}

        <div className="grid grid-cols-1 gap-6">
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

              <div className="mt-8 text-center">
                <h3 className="text-lg mb-2">Today's Sessions</h3>
                <span className="text-4xl font-bold">
                  {sessionHistory.filter(s => s.date === new Date().toDateString()).length}
                </span>
              </div>
            </>
          )}

          {currentView === 'stats' && (
            <StatsView 
              sessionHistory={sessionHistory} 
              darkMode={darkMode}
            />
          )}

          {currentView === 'daily' && (
            <DailyView
              sessionHistory={sessionHistory}
              darkMode={darkMode}
            />
          )}
        </div>

        <BuyMeCoffeeButton darkMode={darkMode} />
      </div>
    </div>
  );
}