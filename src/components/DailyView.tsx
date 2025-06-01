
import React from 'react';

interface Session {
  type: 'work' | 'break';
  duration: number;
  timestamp: string;
  date: string;
  fullTimestamp: string;
}

interface DailyViewProps {
  sessionHistory: Session[];
  darkMode: boolean;
}

export default function DailyView({ sessionHistory, darkMode }: DailyViewProps) {
  // Get today's sessions
  const today = new Date().toDateString();
  const todaySessions = sessionHistory.filter(s => s.date === today);
  const workSessions = todaySessions.filter(s => s.type === 'work');
  const breakSessions = todaySessions.filter(s => s.type === 'break');
  const completedSessions = Math.min(workSessions.length, breakSessions.length);

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Today's Flow</h2>
      <p className="text-lg opacity-75 mb-4">
        {new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-500">{completedSessions}</div>
          <div className="text-xs opacity-75">Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-500">
            {workSessions.reduce((sum, s) => sum + s.duration, 0)}
          </div>
          <div className="text-xs opacity-75">Work Min</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">
            {breakSessions.reduce((sum, s) => sum + s.duration, 0)}
          </div>
          <div className="text-xs opacity-75">Break Min</div>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {todaySessions.slice().reverse().map((session, index) => (
          <div 
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg ${
              darkMode ? 'bg-gray-700' : 'bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${
                session.type === 'work' ? 'bg-red-500' : 'bg-green-500'
              }`} />
              <span className="capitalize">{session.type}</span>
            </div>
            <div className="text-right">
              <div className="font-semibold">{session.duration}min</div>
              <div className="text-xs opacity-60">{session.timestamp}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
