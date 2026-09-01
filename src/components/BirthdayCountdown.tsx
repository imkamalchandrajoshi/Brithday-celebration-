import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Calendar,
  Clock,
  Sparkles,
  Gift,
  PartyPopper,
  Flame,
  ChevronDown,
  Edit2,
  Check,
  RotateCcw,
} from 'lucide-react';

interface BirthdayCountdownProps {
  recipientName: string;
  birthdayDateString?: string; // Format: 'YYYY-MM-DD' or 'MM-DD'
  onDateChange?: (newDate: string) => void;
}

interface TimeRemaining {
  isToday: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  targetDateText: string;
}

export const BirthdayCountdown: React.FC<BirthdayCountdownProps> = ({
  recipientName,
  birthdayDateString,
  onDateChange,
}) => {
  // Store birthday month & day in state (Default to 25 October or stored date)
  const [bdayDate, setBdayDate] = useState<string>(() => {
    if (birthdayDateString) return birthdayDateString;
    try {
      const saved = localStorage.getItem('shweta_birthday_target_date');
      if (saved) return saved;
    } catch {
      // Fallback
    }
    // Default: 25 October 2026
    return '2026-10-25';
  });

  const [isEditingDate, setIsEditingDate] = useState(false);
  const [tempDate, setTempDate] = useState(bdayDate);
  const [isMidnightBlastActive, setIsMidnightBlastActive] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    isToday: false,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    targetDateText: '',
  });

  // Calculate countdown time
  const calculateTime = () => {
    const now = new Date();
    let birthMonth: number;
    let birthDay: number;

    const parts = bdayDate.split('-');
    if (parts.length === 3) {
      birthMonth = parseInt(parts[1], 10) - 1;
      birthDay = parseInt(parts[2], 10);
    } else if (parts.length === 2) {
      birthMonth = parseInt(parts[0], 10) - 1;
      birthDay = parseInt(parts[1], 10);
    } else {
      birthMonth = 9; // October (0-indexed)
      birthDay = 25;
    }

    const currentYear = now.getFullYear();
    const isToday = now.getMonth() === birthMonth && now.getDate() === birthDay;

    // Target next birthday date
    let target = new Date(currentYear, birthMonth, birthDay, 0, 0, 0, 0);

    // If birthday has already passed this year (and not today), target next year
    if (!isToday && now.getTime() > new Date(currentYear, birthMonth, birthDay, 23, 59, 59, 999).getTime()) {
      target = new Date(currentYear + 1, birthMonth, birthDay, 0, 0, 0, 0);
    }

    const targetDateText = target.toLocaleDateString(undefined, {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    if (isToday) {
      return {
        isToday: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        targetDateText,
      };
    }

    const diff = Math.max(0, target.getTime() - now.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    return {
      isToday: false,
      days,
      hours,
      minutes,
      seconds,
      targetDateText,
    };
  };

  useEffect(() => {
    setTimeRemaining(calculateTime());
    const timer = setInterval(() => {
      setTimeRemaining(calculateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [bdayDate]);

  const handleSaveDate = () => {
    if (!tempDate) return;
    setBdayDate(tempDate);
    setIsEditingDate(false);
    try {
      localStorage.setItem('shweta_birthday_target_date', tempDate);
    } catch {
      // safe
    }
    onDateChange?.(tempDate);
    sound.playChime(660, 0.3);
    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#8B5E3C', '#FFDBA4', '#FFB3B3'],
    });
  };

  const handleSet25Oct = () => {
    const target25Oct = '2026-10-25';
    setTempDate(target25Oct);
    setBdayDate(target25Oct);
    setIsEditingDate(false);
    try {
      localStorage.setItem('shweta_birthday_target_date', target25Oct);
    } catch {
      // safe
    }
    onDateChange?.(target25Oct);
    sound.playChime(660, 0.3);
  };

  const handleSetToday = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${now.getFullYear()}-${mm}-${dd}`;
    setTempDate(todayStr);
    setBdayDate(todayStr);
    setIsEditingDate(false);
    try {
      localStorage.setItem('shweta_birthday_target_date', todayStr);
    } catch {
      // safe
    }
    onDateChange?.(todayStr);
    triggerMidnightBlastCelebration();
  };

  // Automated 25 Oct 12:00 AM Midnight Balloon Blast + Sound + Voice Message
  const triggerMidnightBlastCelebration = () => {
    setIsMidnightBlastActive(true);

    // 1. Play Birthday Melodic Chime & Blast Sound
    sound.playBirthdayTune();
    sound.playMassiveBalloonBlast(8);

    // 2. Dispatch event to pop all floating balloons across screen
    window.dispatchEvent(new CustomEvent('trigger-balloon-blast'));

    // 3. Multi-shot confetti cannon blast
    [0.15, 0.35, 0.5, 0.65, 0.85].forEach((xPos, idx) => {
      setTimeout(() => {
        confetti({
          particleCount: 45,
          spread: 75,
          origin: { x: xPos, y: 0.45 },
          colors: ['#8B5E3C', '#FFDBA4', '#C6DABF', '#FFB3B3', '#E8D5C4'],
        });
      }, idx * 200);
    });

    // 4. Automatically play the voice greeting in Hindi
    setTimeout(() => {
      sound.speakText('Hi, mai badiya hu, tum kaise ho? Aaj tumhara din kaisa ja raha hai?');
    }, 1200);

    setTimeout(() => {
      setIsMidnightBlastActive(false);
    }, 8000);
  };

  const triggerBirthdayCelebration = () => {
    triggerMidnightBlastCelebration();
  };

  return (
    <div
      id="dynamic-birthday-countdown"
      className="w-full max-w-2xl mx-auto my-4 transition-all"
    >
      {timeRemaining.isToday ? (
        /* TODAY IS THE BIRTHDAY HERO BANNER */
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#FAF0E6] via-[#FDF8F3] to-[#FAF0E6] p-5 sm:p-6 border-2 border-[#8B5E3C]/30 shadow-lg text-center"
        >
          {/* Shimmer glowing backdrop */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FFDBA4]/20 to-transparent animate-pulse pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#8B5E3C] text-white flex items-center justify-center shadow-md flex-shrink-0">
                <PartyPopper className="w-6 h-6 text-[#FFDBA4] animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#8B5E3C] text-white text-[10px] font-bold uppercase tracking-wider">
                    🎉 Special Day Today!
                  </span>
                  <span className="text-[11px] text-[#8B5E3C] font-mono">
                    {timeRemaining.targetDateText}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#5D4E46]">
                  It&apos;s {recipientName}&apos;s Birthday Today!
                </h3>
                <p className="text-xs text-[#7D6B60] font-serif italic">
                  May Mahadev bless this day with infinite joy, good health & happiness!
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                id="btn-celebrate-today-confetti"
                onClick={triggerBirthdayCelebration}
                className="px-4 py-2.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-semibold shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#FFDBA4]" />
                <span>Celebrate Now! 🎂</span>
              </button>

              <button
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="p-2 rounded-full border border-[#DCC7B5] bg-white text-[#8B5E3C] hover:bg-[#FAF5EF] transition-colors cursor-pointer"
                title="Change birthday date"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Date Picker Drawer if editing */}
          <AnimatePresence>
            {isEditingDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 pt-4 border-t border-[#E8D5C4] flex flex-wrap items-center justify-center gap-3 text-xs"
              >
                <label className="text-[#8B5E3C] font-semibold">Change Birthday Date:</label>
                <input
                  type="date"
                  value={tempDate}
                  onChange={(e) => setTempDate(e.target.value)}
                  className="px-3 py-1.5 bg-white rounded-xl border border-[#DCC7B5] text-[#5D4E46] focus:outline-none focus:border-[#8B5E3C]"
                />
                <button
                  onClick={handleSaveDate}
                  className="px-3 py-1.5 bg-[#8B5E3C] text-white rounded-xl font-medium hover:bg-[#704B30] cursor-pointer"
                >
                  Save Date
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ) : (
        /* DAYS LEFT COUNTDOWN TIMER CARD */
        <div className="p-4 sm:p-5 rounded-[26px] bg-white/90 backdrop-blur-sm border border-[#E8D5C4] shadow-xs">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-3 pb-3 border-b border-[#F2E8DF]">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-full bg-[#FAF5EF] border border-[#E8D5C4] flex items-center justify-center text-[#8B5E3C]">
                <Clock className="w-4 h-4" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#8B5E3C]">
                    Birthday Countdown
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#FFDBA4]/40 text-[#8B5E3C] text-[10px] font-mono">
                    {timeRemaining.days === 1 ? '1 Day Left' : `${timeRemaining.days} Days Left`}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-serif font-semibold text-[#5D4E46]">
                  Countdown to {recipientName}&apos;s Next Birthday ({timeRemaining.targetDateText})
                </h4>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                id="btn-trigger-midnight-blast"
                onClick={triggerMidnightBlastCelebration}
                className="px-3.5 py-1.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-[11px] font-semibold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer"
                title="Play 25 Oct 12:00 AM Midnight balloon blast, celebration chime and voice greeting!"
              >
                <PartyPopper className="w-3.5 h-3.5 text-[#FFDBA4]" />
                <span>25 Oct 12:00 AM Blast 💥</span>
              </button>

              <button
                onClick={handleSet25Oct}
                className="px-3 py-1 rounded-full bg-[#FAF5EF] border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] text-[11px] font-medium transition-colors cursor-pointer"
                title="Set countdown to 25 October"
              >
                📅 25 Oct
              </button>

              <button
                onClick={handleSetToday}
                className="px-3 py-1 rounded-full bg-[#FAF5EF] border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] text-[11px] font-medium transition-colors cursor-pointer"
                title="Simulate / Celebrate as today"
              >
                🎉 Set Today
              </button>

              <button
                onClick={() => setIsEditingDate(!isEditingDate)}
                className="p-1.5 rounded-full border border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FAF5EF] transition-colors cursor-pointer"
                title="Edit birthday date"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Countdown Digit Blocks */}
          <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center">
            {/* Days */}
            <div className="p-2 sm:p-3 rounded-2xl bg-[#FDF8F3] border border-[#E8D5C4]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#8B5E3C] block leading-tight">
                {timeRemaining.days}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#7D6B60]">
                Days
              </span>
            </div>

            {/* Hours */}
            <div className="p-2 sm:p-3 rounded-2xl bg-[#FDF8F3] border border-[#E8D5C4]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#8B5E3C] block leading-tight">
                {String(timeRemaining.hours).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#7D6B60]">
                Hours
              </span>
            </div>

            {/* Minutes */}
            <div className="p-2 sm:p-3 rounded-2xl bg-[#FDF8F3] border border-[#E8D5C4]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#8B5E3C] block leading-tight">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#7D6B60]">
                Mins
              </span>
            </div>

            {/* Seconds */}
            <div className="p-2 sm:p-3 rounded-2xl bg-[#FDF8F3] border border-[#E8D5C4]">
              <span className="text-xl sm:text-2xl font-serif font-bold text-[#8B5E3C] block leading-tight">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-[#7D6B60]">
                Secs
              </span>
            </div>
          </div>

          {/* Date Picker drawer if editing */}
          <AnimatePresence>
            {isEditingDate && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3 pt-3 border-t border-[#E8D5C4] flex flex-wrap items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-2">
                  <label className="text-[#8B5E3C] font-semibold">Select Date:</label>
                  <input
                    type="date"
                    value={tempDate}
                    onChange={(e) => setTempDate(e.target.value)}
                    className="px-2.5 py-1 bg-white rounded-xl border border-[#DCC7B5] text-[#5D4E46] focus:outline-none focus:border-[#8B5E3C]"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleSaveDate}
                    className="px-3 py-1 bg-[#8B5E3C] text-white rounded-xl font-medium hover:bg-[#704B30] cursor-pointer"
                  >
                    Apply Date
                  </button>
                  <button
                    onClick={() => setIsEditingDate(false)}
                    className="px-2 py-1 text-[#7D6B60] hover:underline cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* 25 Oct Midnight Blast Toast */}
      <AnimatePresence>
        {isMidnightBlastActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="mt-3 p-3.5 rounded-2xl bg-[#8B5E3C] text-white flex items-center justify-between gap-3 shadow-lg border border-[#A6754E]"
          >
            <div className="flex items-center gap-2.5">
              <span className="p-1.5 rounded-full bg-white/20 text-[#FFDBA4] animate-spin">
                <Sparkles className="w-4 h-4" />
              </span>
              <div>
                <p className="text-xs font-semibold">
                  🎆 25 Oct 12:00 AM Midnight Celebration Triggered!
                </p>
                <p className="text-[11px] text-[#FFDBA4] font-serif italic">
                  Balloons blasted • Birthday music playing • Voice note greeting active: &ldquo;Hi, mai badiya hu, tum kaise ho?...&rdquo;
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMidnightBlastActive(false)}
              className="text-xs px-2.5 py-1 bg-white/20 hover:bg-white/30 rounded-lg font-medium cursor-pointer"
            >
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
