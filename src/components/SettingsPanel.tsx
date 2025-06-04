import React from 'react';
import { Save, Download, Trash2 } from 'lucide-react';

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
  onExportAllData: () => void;
  onExportTodayData: () => void;
  onClearAllData: () => void;
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
  onClose,
  onExportAllData,
  onExportTodayData,
  onClearAllData
}: SettingsPanelProps) {
  const cardClasses = darkMode 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-white border-gray-200';

  return (
    <div className={`absolute top-16 left-1/2 transform -translate-x-1/2 border rounded-2xl shadow-lg p-6 z-20 w-full max-w-md ${cardClasses}`}>
      <h3 className="font-semibold mb-6 text-xl">Settings</h3>
      
      <div className="space-y-6">
        {/* Timer Settings Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-lg">⏰ Timer Settings</span>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm">Work Duration</label>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-red-100 text-red-800">{workDuration} min</span>
            </div>
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
            <div className="flex justify-between mb-2">
              <label className="text-sm">Break Duration</label>
              <span className="text-sm font-medium px-3 py-1 rounded-full bg-green-100 text-green-800">{breakDuration} min</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              value={breakDuration}
              onChange={(e) => setBreakDuration(parseInt(e.target.value))}
              className="w-full h-2 bg-green-200 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Break</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically start break after work session</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoBreak}
                  onChange={(e) => setAutoBreak(e.target.checked)}
                  className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto Start</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Automatically start next session</p>
                </div>
                <input
                  type="checkbox"
                  checked={autoStart}
                  onChange={(e) => setAutoStart(e.target.checked)}
                  className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Data Management Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-lg">📊 Data Management</span>
          </div>

          <button
            onClick={onExportAllData}
            className="flex items-center justify-between w-full p-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <div className="text-left">
              <div className="font-medium">Export All Data</div>
              <div className="text-sm opacity-90">Download complete session history</div>
            </div>
            <Download className="h-5 w-5" />
          </button>

          <button
            onClick={onExportTodayData}
            className="flex items-center justify-between w-full p-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            <div className="text-left">
              <div className="font-medium">Export Today's Data</div>
              <div className="text-sm opacity-90">Download today's sessions only</div>
            </div>
            <Download className="h-5 w-5" />
          </button>

          <button
            onClick={onClearAllData}
            className="flex items-center justify-between w-full p-4 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <div className="text-left">
              <div className="font-medium">Clear All Data</div>
              <div className="text-sm opacity-90">Delete all session history</div>
            </div>
            <Trash2 className="h-5 w-5" />
          </button>
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