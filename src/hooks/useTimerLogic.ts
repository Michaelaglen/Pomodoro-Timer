
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

interface Session {
  type: 'work' | 'break';
  duration: number;
  timestamp: string;
  date: string;
  fullTimestamp: string;
}

interface UseTimerLogicProps {
  workDuration: number;
  breakDuration: number;
  autoBreak: boolean;
  autoStart: boolean;
}

export function useTimerLogic({ workDuration, breakDuration, autoBreak, autoStart }: UseTimerLogicProps) {
  const [minutes, setMinutes] = useState(workDuration);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<Session[]>([]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const { toast } = useToast();

  // Load data from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('pomodoroHistory');
    
    if (savedHistory) {
      try {
        const parsedHistory = JSON.parse(savedHistory);
        setSessionHistory(parsedHistory);
        console.log('Loaded session history:', parsedHistory.length, 'sessions');
      } catch (error) {
        console.error('Error loading session history:', error);
      }
    }
  }, []);

  // Save to localStorage when sessionHistory changes
  useEffect(() => {
    if (sessionHistory.length > 0) {
      localStorage.setItem('pomodoroHistory', JSON.stringify(sessionHistory));
      console.log('Saved session history:', sessionHistory.length, 'sessions');
    }
  }, [sessionHistory]);

  // Reset timer when work/break duration changes
  useEffect(() => {
    if (!isActive) {
      setMinutes(isBreak ? breakDuration : workDuration);
      setSeconds(0);
    }
  }, [workDuration, breakDuration, isBreak, isActive]);

  const playNotificationSound = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      // Create a sequence of three calming dings
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.frequency.setValueAtTime(800, ctx.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(400, ctx.currentTime + 0.3);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
          gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 0.3);
        }, i * 400);
      }
      
      console.log('Notification sound played');
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  // Main timer logic
  useEffect(() => {
    if (isActive && (minutes > 0 || seconds > 0)) {
      intervalRef.current = setInterval(() => {
        setSeconds(prevSeconds => {
          if (prevSeconds === 0) {
            setMinutes(prevMinutes => {
              if (prevMinutes === 0) {
                // Timer finished
                setIsActive(false);
                playNotificationSound();
                
                const now = new Date();
                const newSession: Session = {
                  type: isBreak ? 'break' : 'work',
                  duration: isBreak ? breakDuration : workDuration,
                  timestamp: now.toLocaleTimeString(),
                  date: now.toDateString(),
                  fullTimestamp: now.toISOString()
                };

                setSessionHistory(prev => [...prev, newSession]);
                console.log('Session completed:', newSession);

                toast({
                  title: isBreak ? "Break Complete!" : "Work Session Complete!",
                  description: `${newSession.duration} minutes ${isBreak ? 'break' : 'work'} session finished.`,
                  duration: 2000,
                });

                if (isBreak) {
                  setIsBreak(false);
                  setMinutes(workDuration);
                  
                  if (autoStart) {
                    console.log('Auto-starting work session');
                    setTimeout(() => setIsActive(true), 1000);
                  }
                } else {
                  if (autoBreak) {
                    setIsBreak(true);
                    setMinutes(breakDuration);
                    
                    if (autoStart) {
                      console.log('Auto-starting break session');
                      setTimeout(() => setIsActive(true), 1000);
                    }
                  } else {
                    setMinutes(workDuration);
                  }
                }
                
                return 0;
              } else {
                return prevMinutes - 1;
              }
            });
            return 59;
          } else {
            return prevSeconds - 1;
          }
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds, isBreak, workDuration, breakDuration, autoBreak, autoStart, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    console.log('Timer toggled:', !isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
    console.log('Timer reset');
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
      setSessionHistory([]);
      localStorage.removeItem('pomodoroHistory');
      console.log('All data cleared');
      
      toast({
        title: "Data Cleared",
        description: "All session data has been permanently deleted.",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  return {
    minutes,
    seconds,
    isActive,
    isBreak,
    sessionHistory,
    toggleTimer,
    resetTimer,
    clearAllData,
    setSessionHistory
  };
}
