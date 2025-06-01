
import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface TimerControlsProps {
  isActive: boolean;
  onToggleTimer: () => void;
  onResetTimer: () => void;
  darkMode: boolean;
}

export default function TimerControls({ 
  isActive, 
  onToggleTimer, 
  onResetTimer, 
  darkMode 
}: TimerControlsProps) {
  return (
    <div className="flex justify-center space-x-4 mb-6">
      <button
        onClick={onToggleTimer}
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
          isActive 
            ? 'bg-orange-500 hover:bg-orange-600 text-white' 
            : 'bg-green-500 hover:bg-green-600 text-white'
        }`}
      >
        {isActive ? <Pause size={24} /> : <Play size={24} />}
      </button>
      
      <button
        onClick={onResetTimer}
        className={`flex items-center justify-center w-16 h-16 rounded-full shadow-lg transition-all duration-200 hover:scale-105 ${
          darkMode ? 'bg-gray-600 hover:bg-gray-500' : 'bg-gray-500 hover:bg-gray-600'
        } text-white`}
      >
        <RotateCcw size={24} />
      </button>
    </div>
  );
}
