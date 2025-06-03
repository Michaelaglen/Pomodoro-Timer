import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Session {
  type: 'work' | 'break';
  duration: number;
  timestamp: string;
  date: string;
  fullTimestamp: string;
}

interface StatsViewProps {
  sessionHistory: Session[];
  darkMode: boolean;
  onExportData: () => void;
  onClearData: () => void;
}

export default function StatsView({ sessionHistory, darkMode, onExportData, onClearData }: StatsViewProps) {
  // Group sessions by date
  const sessionsByDate = React.useMemo(() => {
    const grouped = sessionHistory.reduce((acc, session) => {
      if (!acc[session.date]) {
        acc[session.date] = { work: [], break: [] };
      }
      acc[session.date][session.type].push(session);
      return acc;
    }, {} as Record<string, { work: Session[], break: Session[] }>);

    return Object.entries(grouped).map(([date, sessions]) => ({
      date,
      workMinutes: sessions.work.reduce((sum, s) => sum + s.duration, 0),
      breakMinutes: sessions.break.reduce((sum, s) => sum + s.duration, 0),
      completedSessions: Math.min(sessions.work.length, sessions.break.length)
    }));
  }, [sessionHistory]);

  // Get weekly stats (last 7 days)
  const weeklyStats = sessionsByDate.slice(-7).reduce((acc, day) => ({
    workMinutes: acc.workMinutes + day.workMinutes,
    breakMinutes: acc.breakMinutes + day.breakMinutes,
    completedSessions: acc.completedSessions + day.completedSessions
  }), { workMinutes: 0, breakMinutes: 0, completedSessions: 0 });

  return (
    <div className={`space-y-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      <div className="bg-opacity-10 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-bold mb-4">Weekly Progress</h2>
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-3xl font-bold text-red-500">{weeklyStats.workMinutes}</div>
            <div className="text-sm opacity-70">Total Minutes</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-blue-500">{weeklyStats.completedSessions}</div>
            <div className="text-sm opacity-70">Total Sessions</div>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sessionsByDate.slice(-7).reverse()}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 
              />
              <XAxis 
                dataKey="date"
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                stroke={darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
              />
              <YAxis 
                stroke={darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)'}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                  borderRadius: '0.5rem',
                }}
                formatter={(value: number) => [`${value} min`]}
                labelFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
              />
              <Line 
                type="monotone" 
                dataKey="workMinutes" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="flex gap-4 max-w-sm mx-auto">
        <button
          onClick={onExportData}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 py-2 rounded-md transition-colors text-sm"
        >
          Export Data
        </button>
        <button
          onClick={onClearData}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white h-10 px-4 py-2 rounded-md transition-colors text-sm"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
}