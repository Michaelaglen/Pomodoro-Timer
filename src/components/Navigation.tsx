import React from 'react';
import { Settings, Moon, Sun } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  setCurrentView: (view: string) => void;
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  setShowSettings: (value: boolean) => void;
}

export default function Navigation({
  currentView,
  setCurrentView,
  darkMode,
  setDarkMode,
  setShowSettings
}: NavigationProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-1">
        <button
          onClick={() => setCurrentView('timer')}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            currentView === 'timer' 
              ? 'bg-red-500 text-white' 
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
          }`}
        >
          Timer
        </button>
        <button
          onClick={() => setCurrentView('stats')}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
            currentView === 'stats' 
              ? 'bg-red-500 text-white' 
              : darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
          }`}
        >
          Stats
        </button>
        <button
          onClick={() => setCurrentView('daily')}
          className={`px-4 py-2 rounded-full text-sm transition-colors ${
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
          onClick={() => setShowSettings(true)}
          className={`p-2 rounded-full transition-colors ${
            darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
          }`}
        >
          <Settings size={20} />
        </button>
      </div>
    </div>
  );
}