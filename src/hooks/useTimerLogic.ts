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
      } catch (error) {
        console.error('Error loading session history:', error);
      }
    }
  }, []);

  // Save to localStorage when sessionHistory changes
  useEffect(() => {
    if (sessionHistory.length > 0) {
      localStorage.setItem('pomodoroHistory', JSON.stringify(sessionHistory));
    }
  }, [sessionHistory]);

  // Reset timer when work/break duration changes or when switching between work/break
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

      // Japanese-style temple bell sound
      const frequencies = [440, 880, 1760];
      frequencies.forEach((freq, i) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
          
          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + 2);
        }, i * 800);
      });
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

  const completeSession = () => {
    const now = new Date();
    const newSession: Session = {
      type: isBreak ? 'break' : 'work',
      duration: isBreak ? breakDuration : workDuration,
      timestamp: now.toLocaleTimeString(),
      date: now.toDateString(),
      fullTimestamp: now.toISOString()
    };

    setSessionHistory(prev => [...prev, newSession]);
    playNotificationSound();

    toast({
      title: isBreak ? "Break Complete!" : "Work Session Complete!",
      description: `${newSession.duration} minutes ${isBreak ? 'break' : 'work'} session finished.`,
      duration: 3000, // Show for 3 seconds
    });

    if (isBreak) {
      setIsBreak(false);
      setMinutes(workDuration);
      setSeconds(0);
      if (autoStart) {
        setTimeout(() => setIsActive(true), 1000);
      }
    } else {
      if (autoBreak) {
        setIsBreak(true);
        setMinutes(breakDuration);
        setSeconds(0);
        if (autoStart) {
          setTimeout(() => setIsActive(true), 1000);
        }
      } else {
        setIsBreak(false);
        setMinutes(workDuration);
        setSeconds(0);
      }
    }
  };

  // Main timer logic
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            clearInterval(intervalRef.current!);
            completeSession();
          } else {
            setMinutes(m => m - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(s => s - 1);
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(workDuration);
    setSeconds(0);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all session data? This cannot be undone.')) {
      setSessionHistory([]);
      localStorage.removeItem('pomodoroHistory');
      
      toast({
        title: "Data Cleared",
        description: "All session data has been permanently deleted.",
        variant: "destructive",
        duration: 3000,
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