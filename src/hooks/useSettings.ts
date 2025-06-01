
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useSettings() {
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [autoBreak, setAutoBreak] = useState(true);
  const [autoStart, setAutoStart] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        setWorkDuration(settings.workDuration || 25);
        setBreakDuration(settings.breakDuration || 5);
        setAutoBreak(settings.autoBreak ?? true);
        setAutoStart(settings.autoStart ?? true);
        setDarkMode(settings.darkMode ?? false);
        console.log('Loaded settings:', settings);
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    }
  }, []);

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
    setShowSettings(false);
    toast({
      title: "Settings Saved",
      duration: 2000,
    });
  };

  return {
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
  };
}
