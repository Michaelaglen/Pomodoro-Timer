import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      completedSessions: Math.min(sessions.work.length, sessions.break.length),
      sessions
    }));
  }, [sessionHistory]);

  // Calculate totals
  const totals = React.useMemo(() => {
    return sessionsByDate.reduce((acc, day) => ({
      workMinutes: acc.workMinutes + day.workMinutes,
      breakMinutes: acc.breakMinutes + day.breakMinutes,
      sessions: acc.sessions + day.completedSessions
    }), { workMinutes: 0, breakMinutes: 0, sessions: 0 });
  }, [sessionsByDate]);

  // Calculate streak
  const currentStreak = React.useMemo(() => {
    let streak = 0;
    const today = new Date().toDateString();
    
    for (let i = 0; i < sessionsByDate.length; i++) {
      const date = new Date(sessionsByDate[i].date);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() - i);
      
      if (sessionsByDate[i].completedSessions > 0 && 
          date.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }, [sessionsByDate]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Sessions</h3>
          <p className="text-2xl font-bold">{totals.sessions}</p>
        </div>
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Work Minutes</h3>
          <p className="text-2xl font-bold">{totals.workMinutes}</p>
        </div>
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Break Minutes</h3>
          <p className="text-2xl font-bold">{totals.breakMinutes}</p>
        </div>
        <div className="bg-card p-4 rounded-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Current Streak</h3>
          <p className="text-2xl font-bold">{currentStreak} days</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-card p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Daily Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sessionsByDate.slice(-7).reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="date"
                fontSize={12}
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
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
                }}
                formatter={(value: number, name: string) => [
                  `${value} minutes`,
                  name === 'workMinutes' ? 'Work Time' : 'Break Time'
                ]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Line 
                type="monotone" 
                dataKey="workMinutes" 
                name="Work"
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="breakMinutes" 
                name="Break"
                stroke="#22c55e" 
                strokeWidth={2}
                dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Session History Table */}
      <div className="bg-card rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Sessions</TableHead>
              <TableHead>Work Minutes</TableHead>
              <TableHead>Break Minutes</TableHead>
              <TableHead>Total Minutes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessionsByDate.map((day) => (
              <TableRow key={day.date}>
                <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>
                <TableCell>{day.completedSessions}</TableCell>
                <TableCell>{day.workMinutes}</TableCell>
                <TableCell>{day.breakMinutes}</TableCell>
                <TableCell>{day.workMinutes + day.breakMinutes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={onExportData}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md"
        >
          Export Data
        </button>
        <button
          onClick={onClearData}
          className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 rounded-md"
        >
          Clear Data
        </button>
      </div>
    </div>
  );
}