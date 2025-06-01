import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  // Get today's date
  const today = new Date().toDateString();

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

  // Get today's stats
  const todayStats = sessionsByDate.find(day => day.date === today) || {
    workMinutes: 0,
    breakMinutes: 0,
    completedSessions: 0
  };

  // Get weekly stats (last 7 days)
  const weeklyStats = sessionsByDate.slice(-7).reduce((acc, day) => ({
    workMinutes: acc.workMinutes + day.workMinutes,
    breakMinutes: acc.breakMinutes + day.breakMinutes,
    completedSessions: acc.completedSessions + day.completedSessions
  }), { workMinutes: 0, breakMinutes: 0, completedSessions: 0 });

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
    <div className="grid gap-6 md:grid-cols-2">
      {/* Today's Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Today</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Sessions</span>
                  <span className="text-2xl font-bold">{todayStats.completedSessions}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>One session = Work time + Break time</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Work Minutes</span>
            <span className="text-2xl font-bold">{todayStats.workMinutes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Break Minutes</span>
            <span className="text-2xl font-bold">{todayStats.breakMinutes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Minutes</span>
            <span className="text-2xl font-bold">{todayStats.workMinutes + todayStats.breakMinutes}</span>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">This Week</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total Sessions</span>
            <span className="text-2xl font-bold">{weeklyStats.completedSessions}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Work Minutes</span>
            <span className="text-2xl font-bold">{weeklyStats.workMinutes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Break Minutes</span>
            <span className="text-2xl font-bold">{weeklyStats.breakMinutes}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Current Streak</span>
            <span className="text-2xl font-bold">{currentStreak} days</span>
          </div>
        </CardContent>
      </Card>

      {/* Activity Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionsByDate.slice(-7).reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <YAxis 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: darkMode ? '1px solid #374151' : '1px solid #e5e7eb',
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
                <Line 
                  type="monotone" 
                  dataKey="breakMinutes" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="md:col-span-2 flex gap-4">
        <button
          onClick={onExportData}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md transition-colors"
        >
          Export Data
        </button>
        <button
          onClick={onClearData}
          className="flex-1 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 rounded-md transition-colors"
        >
          Reset Data
        </button>
      </div>
    </div>
  );
}