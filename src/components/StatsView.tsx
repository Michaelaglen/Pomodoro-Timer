import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
}

export default function StatsView({ sessionHistory, darkMode }: StatsViewProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0);

  // Get the start and end dates for the current week
  const getWeekDates = (offset: number) => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay() + (offset * 7));
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  };

  const { start: weekStart, end: weekEnd } = getWeekDates(currentWeekOffset);

  // Filter sessions for the current week
  const weekSessions = sessionHistory.filter(session => {
    const sessionDate = new Date(session.date);
    return sessionDate >= weekStart && sessionDate <= weekEnd;
  });

  // Process data for the chart
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + i);
    const dateStr = date.toDateString();
    
    const dayData = weekSessions.filter(s => s.date === dateStr);
    const workSessions = dayData.filter(s => s.type === 'work');
    const breakSessions = dayData.filter(s => s.type === 'break');

    return {
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      work: workSessions.length,
      break: breakSessions.length,
      totalWork: workSessions.reduce((sum, s) => sum + s.duration, 0),
    };
  });

  // Calculate weekly metrics
  const totalSessions = weekSessions.length;
  const totalFocusTime = weekSessions
    .filter(s => s.type === 'work')
    .reduce((sum, s) => sum + s.duration, 0);
  const dailyAverage = totalSessions > 0 ? (totalSessions / 7).toFixed(1) : 0;
  const bestDay = chartData.reduce((best, day) => 
    (day.work + day.break) > (best.work + best.break) ? day : best
  );

  // Calculate streak and consistency
  const activeDays = chartData.filter(day => (day.work + day.break) > 0).length;
  let currentStreak = 0;
  let maxStreak = 0;
  let streak = 0;

  chartData.forEach(day => {
    if (day.work + day.break > 0) {
      streak++;
      maxStreak = Math.max(maxStreak, streak);
    } else {
      streak = 0;
    }
  });
  currentStreak = streak;

  return (
    <div className={`space-y-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setCurrentWeekOffset(curr => curr - 1)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <ChevronLeft />
        </button>
        <h2 className="text-lg font-semibold">
          Week of {weekStart.toLocaleDateString()} - {weekEnd.toLocaleDateString()}
        </h2>
        <button 
          onClick={() => setCurrentWeekOffset(curr => curr + 1)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
          disabled={currentWeekOffset >= 0}
        >
          <ChevronRight />
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Total Sessions</h3>
          <p className="text-2xl font-bold">{totalSessions}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Focus Time</h3>
          <p className="text-2xl font-bold">{totalFocusTime}min</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Daily Average</h3>
          <p className="text-2xl font-bold">{dailyAverage}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
          <h3 className="text-sm text-gray-500 dark:text-gray-400">Best Day</h3>
          <p className="text-2xl font-bold">{bestDay.day}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="work" name="Work Sessions" fill="#ef4444" stackId="a" />
              <Bar dataKey="break" name="Break Sessions" fill="#22c55e" stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weekly Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
        <h3 className="text-lg font-semibold mb-4">Weekly Summary</h3>
        <div className="space-y-2">
          <p>Most productive day: {bestDay.day} with {bestDay.work + bestDay.break} sessions</p>
          <p>Consistency: {activeDays} out of 7 days active</p>
          <p>Current streak: {currentStreak} days</p>
          <p>Longest streak this week: {maxStreak} days</p>
        </div>
      </div>
    </div>
  );
}