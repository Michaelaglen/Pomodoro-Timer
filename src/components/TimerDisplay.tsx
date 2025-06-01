
import React from 'react';

interface TimerDisplayProps {
  minutes: number;
  seconds: number;
  isBreak: boolean;
  workDuration: number;
  breakDuration: number;
  progress: number;
}

export default function TimerDisplay({ 
  minutes, 
  seconds, 
  isBreak, 
  workDuration, 
  breakDuration, 
  progress 
}: TimerDisplayProps) {
  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
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
    </>
  );
}
