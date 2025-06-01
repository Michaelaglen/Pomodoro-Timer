
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings, Moon, Sun, Coffee, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import StatsView from './StatsView';
import DailyView from './DailyView';

interface Session {
  type: 'work' | 'break';
  duration: number;
  timestamp: string;
  date: string;
  fullTimestamp: string;
}

export default function PomodoroTimer() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  const [currentView, setCurrentView] = useState('timer');
  
  // Settings
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [autoBreak, setAutoBreak] = useState(true);
  const [autoStart, setAutoStart] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pomodoroHistory');
    const savedSettings = localStorage.getItem('pomodoroSettings');
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSessionHistory(parsedHistory);
        console.log('Loaded session history:', parsedHistory.length, 'sessions');
      } catch (error) {
        console.error('Error loading session history:', error);
      }
    }
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setWorkDuration(settings.workDuration || 25);
        setBreakDuration(settings.breakDuration || 5);
        setAutoBreak(settings.autoBreak ?? true);
        setAutoStart(settings.autoStart ?? false);
        setDarkMode(settings.darkMode ?? false);
        console.log('Loaded settings:', settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

  // Save to localStorage when sessionHistory changes
  useEffect(() => {
    if (sessionHistory.length > 0) {
      localStorage.setItem('pomodoroHistory', JSON.stringify(sessionHistory));
      console.log('Saved session history:', sessionHistory.length, 'sessions');
    }
  }, [sessionHistory]);

  // Save settings to localStorage
  const saveSettings = () => {
    const settings = {
      workDuration,
      breakDuration,
      autoBreak,
      autoStart,
      darkMode
    };
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    console.log('Settings saved:', settings);
    toast({
      title: "Settings Saved",
      description: "Your preferences have been saved successfully.",
    });
  };

  // Clean up old sessions (older than 30 days)
  useEffect(() => {
    const cleanupOldSessions = () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      setSessionHistory(prev => {
        const filteredSessions = prev.filter(session => {
          const sessionDate = new Date(session.fullTimestamp);
          return sessionDate > thirtyDaysAgo;
        });
        
        if (filteredSessions.length !== prev.length) {
          console.log(`Cleaned up ${prev.length - filteredSessions.length} old sessions`);
          return filteredSessions;
        }
        return prev;
      });
    };

    cleanupOldSessions();
    const cleanupInterval = setInterval(cleanupOldSessions, 24 * 60 * 60 * 1000);

    return () => clearInterval(cleanupInterval);
  }, []);

  // Reset timer when work/break duration changes
  useEffect(() => {
    if (!isActive) {
      setMinutes(isBreak ? breakDuration : workDuration);
      setSeconds(0);
    }
  }, [workDuration, breakDuration, isBreak, isActive]);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Create a sequence of three beeps
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
        }, i * 400);
      }
      
      console.log('Notification sound played');
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Main timer logic
  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            setMinutes(prevMinutes => {
              if (prevMinutes === 0) {
                // Timer finished
                setIsActive(false);
                playNotificationSound();
                
                const now = new Date();
                const newSession: Session = {
                  type: isBreak ? 'break' : 'work',
                  duration: isBreak ? breakDuration : workDuration,
                  timestamp: now.toLocaleTimeString(),
                  date: now.toDateString(),
                  fullTimestamp: now.toISOString()
                };

                setSessionHistory(prev => [...prev, newSession]);
                console.log('Session completed:', newSession);

                // Show toast notification
                toast({
                  title: isBreak ? "Break Complete!" : "Work Session Complete!",
                  description: `${newSession.duration} minutes ${isBreak ? 'break' : 'work'} session finished.`,
                });

                if (isBreak) {
                  // Break finished, switch to work
                  setIsBreak(false);
                  setMinutes(workDuration);
                  
                  if (autoStart) {
                    console.log('Auto-starting work session');
                    setTimeout(() => setIsActive(true), 1000);
                  }
                } else {
                  // Work session finished
                  if (autoBreak) {
                    setIsBreak(true);
                    setMinutes(breakDuration);
                    
                    if (autoStart) {
                      console.log('Auto-starting break session');
                      setTimeout(() => setIsActive(true), 1000);
                    }
                  } else {
                    setMinutes(workDuration);
                  }
                }
                
                return 0;
              } else {
                return prevMinutes - 1;
              }
            });
            return 59;
          } else {
            return prevSeconds - 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, isBreak, workDuration, breakDuration, autoBreak, autoStart, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    console.log('Timer toggled:', !isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
    console.log('Timer reset');
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDuration = isBreak ? breakDuration : workDuration;
  const progress = ((currentDuration * 60 - (minutes * 60 + seconds)) / (currentDuration * 60)) * 100;

  // Get today's sessions
  const today = new Date().toDateString();
  const todaySessions = sessionHistory.filter(s => s.date === today);
  const completedSessions = todaySessions.filter(s => s.type === 'work').length;

  const themeClasses = darkMode 
    ? 'bg-gray-900 text-white' 
    : 'bg-gradient-to-br from-red-50 to-orange-50 text-gray-800';

  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`flex items-center justify-center min-h-screen p-4 transition-all duration-300 ${themeClasses}`}>
      <div className={`rounded-3xl shadow-2xl p-6 w-full max-w-md text-center relative border transition-all duration-300 ${cardClasses}`}>
        
        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setCurrentView('timer')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                currentView === 'timer' 
                  ? 'bg-red-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Timer
            </button>
            <button
              onClick={() => setCurrentView('stats')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                currentView === 'stats' 
                  ? 'bg-red-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Stats
            </button>
            <button
              onClick={() => setCurrentView('daily')}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                currentView === 'daily' 
                  ? 'bg-red-500 text-white' 
                  : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}
            >
              Daily
            </button>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-full transition-colors ${
                darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
              }`}
            >
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className={`absolute top-16 left-0 right-0 border rounded-2xl shadow-lg p-4 z-20 mx-2 ${cardClasses}`}>
            <h3 className="font-semibold mb-4">Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2 opacity-75">
                  Work Duration: {workDuration} min
                </label>
                <input
                  type="range"
                  min="1"
                  max="60"
                  value={workDuration}
                  onChange={(e) => setWorkDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-red-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2 opacity-75">
                  Break Duration: {breakDuration} min
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={breakDuration}
                  onChange={(e) => setBreakDuration(parseInt(e.target.value))}
                  className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto Break</label>
                <input
                  type="checkbox"
                  checked={autoBreak}
                  onChange={(e) => setAutoBreak(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm">Auto Start</label>
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="w-4 h-4 text-red-600 rounded"
                />
              </div>
              
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={saveSettings}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex-1"
                >
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className={`px-3 py-2 rounded-lg transition-colors text-sm flex-1 ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 hover:bg-gray-600'
                  } text-white`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Timer View */}
        {currentView === 'timer' && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold mb-2">Pomodoro Timer</h1>
              <p className="text-lg opacity-75">
                {isBreak ? '☕ Break Time' : '🍅 Focus Time'}
              </p>
            </div>

            <div className="relative mb-6">
              <div className="w-48 h-48 mx-auto relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    className="opacity-20"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    stroke="currentColor"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                    className={isBreak ? "text-green-500" : "text-red-500"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold mb-2">
                      {formatTime(minutes, seconds)}
                    </div>
                    <div className="text-sm opacity-60">
                      {isBreak ? `${breakDuration}min break` : `${workDuration}min work`}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <button
                onClick={toggleTimer}
                className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
                  isActive 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isActive ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              <button
                onClick={resetTimer}
                className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
                  darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-500 hover:bg-gray-600'
                } text-white`}
              >
                <RotateCcw size={24} />
              </button>
            </div>

            <div className="text-center">
              <p className="opacity-75 text-sm mb-2">Today's Sessions</p>
              <p className="text-2xl font-bold">{completedSessions}</p>
              <p className="text-xs opacity-60 mt-1">
                Total: {todaySessions.filter(s => s.type === 'work').reduce((sum, s) => sum + s.duration, 0)} minutes
              </p>
            </div>
          </>
        )}

        {/* Stats View */}
        {currentView === 'stats' && (
          <StatsView 
            sessionHistory={sessionHistory} 
            darkMode={darkMode}
            onClearData={() => {
              if (confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
                setSessionHistory([]);
                localStorage.removeItem('pomodoroHistory');
                console.log('All data cleared');
                
                toast({
                  title: "Data Cleared",
                  description: "All session data has been permanently deleted.",
                  variant: "destructive",
                });
              }
            }}
          />
        )}

        {/* Daily View */}
        {currentView === 'daily' && (
          <DailyView sessionHistory={sessionHistory} darkMode={darkMode} />
        )}

        {/* Buy Me a Coffee Button */}
        <div className="mt-6 pt-4 border-t border-opacity-20">
          <a
            href="https://buymeacoffee.com/michaelaglen"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-200 hover:scale-105 ${
              darkMode 
                ? 'bg-yellow-600 hover:bg-yellow-500 text-white' 
                : 'bg-yellow-500 hover:bg-yellow-600 text-white'
            } shadow-lg`}
          >
            <Coffee size={18} />
            <span className="text-sm font-medium">Buy me a coffee</span>
          </a>
        </div>
      </div>
    </div>
  );
}
