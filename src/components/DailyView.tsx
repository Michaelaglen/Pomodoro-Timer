
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
  const today = new Date().toDateString();
  const todaySessions = sessionHistory.filter(s => s.date === today);
  
  const completedSessions = todaySessions.filter(s => s.type === 'work').length;
  const totalWorkTime = todaySessions.filter(s => s.type === 'work').reduce((sum, s) => sum + s.duration, 0);
  const totalBreakTime = todaySessions.filter(s => s.type === 'break').reduce((sum, s) => sum + s.duration, 0);
  
  // Sort sessions by timestamp
  const sortedSessions = [...todaySessions].sort((a, b) => 
    new Date(a.fullTimestamp).getTime() - new Date(b.fullTimestamp).getTime()
  );

  const formatDuration = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${minutes}m`;
  };

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
          <div className="text-2xl font-bold text-green-500">{totalWorkTime}</div>
          <div className="text-xs opacity-75">Work Min</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-500">{totalBreakTime}</div>
          <div className="text-xs opacity-75">Break Min</div>
        </div>
      </div>

      {/* Progress towards daily goal */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm opacity-75">Daily Goal Progress</span>
          <span className="text-sm font-semibold">{completedSessions}/8 sessions</span>
        </div>
        <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}>
          <div 
            className="h-2 bg-red-500 rounded-full transition-all duration-300"
            style={{ width: `${Math.min((completedSessions / 8) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Session Timeline */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {sortedSessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🍅</div>
            <p className="opacity-50">No sessions today yet</p>
            <p className="text-xs opacity-40 mt-1">Start your first pomodoro!</p>
          </div>
        ) : (
          <>
            <h3 className="font-semibold mb-3 text-sm opacity-75">Session Timeline</h3>
            {sortedSessions.map((session, index) => (
              <div 
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg transition-all hover:scale-[1.02] ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    session.type === 'work' ? 'bg-red-500' : 'bg-green-500'
                  }`} />
                  <div>
                    <span className="capitalize font-medium">{session.type}</span>
                    <div className="text-xs opacity-60">
                      {session.type === 'work' ? '🍅' : '☕'} {formatDuration(session.duration)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{session.timestamp}</div>
                  <div className="text-xs opacity-60">
                    {index === sortedSessions.length - 1 ? 'Latest' : `${sortedSessions.length - index - 1} ago`}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Productivity Insights */}
      {completedSessions > 0 && (
        <div className={`mt-6 p-4 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
          <h4 className="font-semibold mb-2">Today's Insights</h4>
          <div className="text-sm space-y-1">
            <p>
              • Total focus time: <span className="font-semibold">{formatDuration(totalWorkTime)}</span>
            </p>
            <p>
              • Average session: <span className="font-semibold">
                {completedSessions > 0 ? Math.round(totalWorkTime / completedSessions) : 0} minutes
              </span>
            </p>
            <p className="text-green-600 dark:text-green-400">
              • {completedSessions >= 4 ? '🎉 Great productivity!' : 
                 completedSessions >= 2 ? '👍 Good progress!' : 
                 '💪 Keep going!'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
