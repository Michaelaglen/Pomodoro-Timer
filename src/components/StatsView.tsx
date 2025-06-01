
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
  onClearData: () => void;
}

export default function StatsView({ sessionHistory, darkMode }: StatsViewProps) {
  // Prepare chart data for last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toDateString();
    const daySessions = sessionHistory.filter(s => s.date === dateStr);
    const workTime = daySessions.filter(s => s.type === 'work').reduce((sum, s) => sum + s.duration, 0);
    
    last7Days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
      work: workTime,
      shortDate: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    });
  }

  const totalWorkTime = sessionHistory
    .filter(s => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0);

  const totalSessions = sessionHistory.filter(s => s.type === 'work').length;
  const averageSessionLength = totalSessions > 0 ? Math.round(totalWorkTime / totalSessions) : 0;

  // Calculate streak (consecutive days with at least one work session)
  let currentStreak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toDateString();
    const hasWorkSession = sessionHistory.some(s => s.date === dateStr && s.type === 'work');
    
    if (hasWorkSession) {
      currentStreak++;
    } else {
      break;
    }
  }

  return (
    <div className="mb-6">
      <h2 className="text-2xl font-bold mb-4">Weekly Progress</h2>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-red-500">{totalWorkTime}</div>
          <div className="text-xs opacity-75">Total Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-500">{totalSessions}</div>
          <div className="text-xs opacity-75">Total Sessions</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-500">{averageSessionLength}</div>
          <div className="text-xs opacity-75">Avg Session</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-500">{currentStreak}</div>
          <div className="text-xs opacity-75">Day Streak</div>
        </div>
      </div>

      <div className="h-64">
        <h3 className="text-lg font-semibold mb-3">Work Time (Minutes)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={last7Days}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="shortDate" 
              fontSize={12}
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
            />
            <YAxis 
              fontSize={12}
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#374151' : '#ffffff',
                border: darkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
                borderRadius: '8px',
                color: darkMode ? '#ffffff' : '#000000'
              }}
              labelFormatter={(label) => `Date: ${label}`}
              formatter={(value: number) => [`${value} minutes`, 'Work Time']}
            />
            <Line 
              type="monotone" 
              dataKey="work" 
              stroke="#ef4444" 
              strokeWidth={3}
              dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
