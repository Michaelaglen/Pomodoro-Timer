import React from 'react';
import { Save } from 'lucide-react';

interface SettingsPanelProps {
  workDuration: number;
  breakDuration: number;
  autoBreak: boolean;
  autoStart: boolean;
  darkMode: boolean;
  setWorkDuration: (value: number) => void;
  setBreakDuration: (value: number) => void;
  setAutoBreak: (value: boolean) => void;
  setAutoStart: (value: boolean) => void;
  onSaveSettings: () => void;
  onClose: () => void;
}

export default function SettingsPanel({
  workDuration,
  breakDuration,
  autoBreak,
  autoStart,
  darkMode,
  setWorkDuration,
  setBreakDuration,
  setAutoBreak,
  setAutoStart,
  onSaveSettings,
  onClose
}: SettingsPanelProps) {
  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 border rounded-2xl shadow-lg p-4 z-20 w-full max-w-md ${cardClasses}`}>
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
            onClick={onSaveSettings}
            className="flex items-center justify-center space-x-1 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm flex-1"
          >
            <Save size={16} />
            <span>Save</span>
          </button>
          <button
            onClick={onClose}
            className={`px-3 py-2 rounded-lg transition-colors text-sm flex-1 ${
              darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-500 hover:bg-gray-600'
            } text-white`}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}