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

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

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
            </>
          )}

          {currentView === 'stats' && (
            <StatsView 
              sessionHistory={sessionHistory} 
              darkMode={darkMode}
              onExportData={() => {
                const element = document.createElement("a");
                const file = new Blob([JSON.stringify(sessionHistory, null, 2)], {
                  type: "application/json",
                });
                element.href = URL.createObjectURL(file);
                element.download = "pomodoro-data.json";
                document.body.appendChild(element);
                element.click();
                document.body.removeChild(element);
              }}
              onClearData={clearAllData}
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