
import React from 'react';

interface TodayStatsProps {
  completedSessions: number;
  totalWorkMinutes: number;
}

export default function TodayStats({ completedSessions, totalWorkMinutes }: TodayStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 text-center">
      <div>
        <p className="opacity-75 text-sm mb-1">Today's Sessions</p>
        <p className="text-2xl font-bold">{completedSessions}</p>
      </div>
      <div>
        <p className="opacity-75 text-sm mb-1">Total Minutes</p>
        <p className="text-2xl font-bold">{totalWorkMinutes}</p>
      </div>
    </div>
  );
}
