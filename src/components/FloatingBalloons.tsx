import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Sparkles, Plus, Heart, Bomb } from 'lucide-react';

interface BalloonItem {
  id: number;
  x: number; // percentage across screen
  color: string;
  borderColor: string;
  stringColor: string;
  speed: number;
  delay: number;
  size: number;
  wish: string;
}

const WISHES = [
  '✨ Endless Joy & Laughter',
  '🌸 Mahadev\'s Divine Protection',
  '💖 Forever Loving & Caring Heart',
  '🌿 Good Health & Serenity',
  '⭐ All Dreams Turning to Reality',
  '🕊️ Peaceful Mind & Happy Soul',
  '🌼 Unconditional Love & Smiles',
  '✨ Lifelong Companionship',
];

const BALLOON_PALETTES = [
  { color: '#FFB3B3', border: '#EFA4A4', string: '#D89898' }, // Soft Terracotta Rose
  { color: '#FFDBA4', border: '#F2CE95', string: '#D8B57E' }, // Warm Honey Peach
  { color: '#C1E1C1', border: '#AFCFAF', string: '#9EBE9E' }, // Sage Green
  { color: '#E8D5C4', border: '#DBC7B5', string: '#C2AEA0' }, // Natural Sand
  { color: '#DCC7B5', border: '#CEB7A3', string: '#B39E8C' }, // Warm Taupe
  { color: '#FAD2E1', border: '#ECC4D3', string: '#D1A9B9' }, // Blush Orchid
];

export const FloatingBalloons: React.FC = () => {
  const [balloons, setBalloons] = useState<BalloonItem[]>([
    { id: 1, x: 8, color: '#FFB3B3', borderColor: '#EFA4A4', stringColor: '#D89898', speed: 18, delay: 0, size: 72, wish: WISHES[0] },
    { id: 2, x: 22, color: '#FFDBA4', borderColor: '#F2CE95', stringColor: '#D8B57E', speed: 22, delay: 2, size: 84, wish: WISHES[1] },
    { id: 3, x: 38, color: '#C1E1C1', borderColor: '#AFCFAF', stringColor: '#9EBE9E', speed: 19, delay: 4, size: 68, wish: WISHES[2] },
    { id: 4, x: 62, color: '#E8D5C4', borderColor: '#DBC7B5', stringColor: '#C2AEA0', speed: 21, delay: 1, size: 76, wish: WISHES[3] },
    { id: 5, x: 78, color: '#FFDBA4', borderColor: '#F2CE95', stringColor: '#D8B57E', speed: 17, delay: 3, size: 80, wish: WISHES[4] },
    { id: 6, x: 90, color: '#FFB3B3', borderColor: '#EFA4A4', stringColor: '#D89898', speed: 23, delay: 5, size: 70, wish: WISHES[5] },
  ]);

  const [poppedWish, setPoppedWish] = useState<string | null>(null);

  // Listen for automated global midnight blast event
  useEffect(() => {
    const handleBlastEvent = () => {
      blastAllBalloons();
    };

    window.addEventListener('trigger-balloon-blast', handleBlastEvent);
    return () => window.removeEventListener('trigger-balloon-blast', handleBlastEvent);
  }, [balloons]);

  const blastAllBalloons = () => {
    sound.playMassiveBalloonBlast(8);

    // Multi-stage confetti cannon burst
    [0.2, 0.4, 0.6, 0.8].forEach((xPos, idx) => {
      setTimeout(() => {
        confetti({
          particleCount: 40,
          spread: 80,
          origin: { x: xPos, y: 0.5 },
          colors: ['#FFB3B3', '#FFDBA4', '#C1E1C1', '#8B5E3C', '#E8D5C4'],
        });
      }, idx * 150);
    });

    setPoppedWish('🎉 25 Oct 12:00 AM Midnight Balloon Blast! Happy Birthday Shweta! 🎂');
    setBalloons([]);

    // Automatically spawn fresh new balloons after 3.5 seconds
    setTimeout(() => {
      setBalloons([
        { id: Date.now() + 1, x: 10, color: '#FFB3B3', borderColor: '#EFA4A4', stringColor: '#D89898', speed: 18, delay: 0, size: 75, wish: WISHES[0] },
        { id: Date.now() + 2, x: 28, color: '#FFDBA4', borderColor: '#F2CE95', stringColor: '#D8B57E', speed: 20, delay: 1, size: 82, wish: WISHES[1] },
        { id: Date.now() + 3, x: 50, color: '#C1E1C1', borderColor: '#AFCFAF', stringColor: '#9EBE9E', speed: 17, delay: 0, size: 70, wish: WISHES[2] },
        { id: Date.now() + 4, x: 72, color: '#E8D5C4', borderColor: '#DBC7B5', stringColor: '#C2AEA0', speed: 21, delay: 2, size: 78, wish: WISHES[3] },
        { id: Date.now() + 5, x: 88, color: '#FFDBA4', borderColor: '#F2CE95', stringColor: '#D8B57E', speed: 19, delay: 1, size: 80, wish: WISHES[4] },
      ]);
    }, 3800);

    setTimeout(() => {
      setPoppedWish(null);
    }, 5000);
  };

  const popBalloon = (id: number, wish: string, event: React.MouseEvent) => {
    sound.playPop();
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 25,
      spread: 60,
      origin: { x, y },
      colors: ['#8B5E3C', '#E8D5C4', '#C6DABF', '#FFB3B3', '#FFDBA4'],
      disableForReducedMotion: true,
    });

    setPoppedWish(wish);
    setBalloons((prev) => prev.filter((b) => b.id !== id));

    // Hide wish notification after 3.5s
    setTimeout(() => {
      setPoppedWish((curr) => (curr === wish ? null : curr));
    }, 3500);
  };

  const addBalloon = () => {
    sound.playChime(660, 0.4);
    const palette = BALLOON_PALETTES[Math.floor(Math.random() * BALLOON_PALETTES.length)];
    const newBalloon: BalloonItem = {
      id: Date.now() + Math.random(),
      x: Math.floor(Math.random() * 85) + 5,
      color: palette.color,
      borderColor: palette.border,
      stringColor: palette.string,
      speed: Math.floor(Math.random() * 8) + 16,
      delay: 0,
      size: Math.floor(Math.random() * 20) + 65,
      wish: WISHES[Math.floor(Math.random() * WISHES.length)],
    };
    setBalloons((prev) => [...prev, newBalloon]);
  };

  return (
    <div id="floating-balloons-container" className="relative w-full overflow-hidden pointer-events-none z-20">
      {/* Interactive Balloon Spawner & Blast Toolbar */}
      <div className="absolute top-3 right-4 z-30 pointer-events-auto flex items-center gap-2">
        <button
          id="btn-blast-all-balloons"
          onClick={blastAllBalloons}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white transition-all text-xs font-semibold shadow-md active:scale-95 cursor-pointer"
          title="Blast all floating balloons with pop explosion!"
        >
          <Bomb className="w-3.5 h-3.5 text-[#FFDBA4]" />
          <span>Balloon Blast 💥</span>
        </button>

        <button
          id="btn-add-balloon"
          onClick={addBalloon}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm border border-[#E8D5C4] text-[#8B5E3C] hover:bg-[#FDF8F3] hover:border-[#8B5E3C] transition-all text-xs font-medium shadow-sm active:scale-95 cursor-pointer"
          title="Release a new balloon into the sky"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Balloon</span>
        </button>
      </div>

      {/* Popped Wish Banner Toast */}
      <AnimatePresence>
        {poppedWish && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-[#8B5E3C] text-white px-5 py-2.5 rounded-full shadow-lg border border-[#A6754E] flex items-center gap-2 text-xs sm:text-sm font-medium max-w-lg text-center"
          >
            <Sparkles className="w-4 h-4 text-[#FFDBA4] shrink-0" />
            <span>{poppedWish}</span>
            <Heart className="w-3.5 h-3.5 fill-[#FFB3B3] text-[#FFB3B3] shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Animated Balloons */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {balloons.map((b) => (
          <motion.div
            key={b.id}
            initial={{ y: '105vh', x: 0 }}
            animate={{
              y: '-25vh',
              x: [0, 15, -15, 10, 0],
            }}
            transition={{
              y: {
                duration: b.speed,
                repeat: Infinity,
                ease: 'linear',
                delay: b.delay,
              },
              x: {
                duration: 6,
                repeat: Infinity,
                ease: 'easeInOut',
              },
            }}
            style={{
              left: `${b.x}%`,
              width: `${b.size}px`,
              height: `${b.size * 1.3}px`,
            }}
            className="absolute pointer-events-auto cursor-pointer group select-none"
            onClick={(e) => popBalloon(b.id, b.wish, e)}
            title="Click to pop and release blessing wish!"
          >
            {/* Balloon Body */}
            <div
              className="relative w-full h-full rounded-t-full rounded-b-[45%] transition-transform duration-300 group-hover:scale-105 shadow-md flex items-center justify-center"
              style={{
                backgroundColor: b.color,
                border: `1.5px solid ${b.borderColor}`,
              }}
            >
              {/* Highlight Glare */}
              <div className="absolute top-2 left-3 w-3 h-5 bg-white/45 rounded-full rotate-[-25deg] filter blur-[0.5px]" />
              
              {/* Subtle knot */}
              <div
                className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-2 rounded-[2px]"
                style={{ backgroundColor: b.borderColor }}
              />

              {/* Balloon string */}
              <svg
                className="absolute top-full left-1/2 -translate-x-1/2 w-6 h-20 pointer-events-none"
                viewBox="0 0 24 80"
                fill="none"
              >
                <path
                  d="M12 0 C 18 20, 6 40, 14 60 C 18 70, 10 80, 12 80"
                  stroke={b.stringColor}
                  strokeWidth="1.5"
                  strokeDasharray="2 1"
                />
              </svg>

              {/* Pop prompt badge on hover */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-6 left-1/2 -translate-x-1/2 bg-[#5D4E46]/85 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap shadow-sm pointer-events-none">
                Pop for Wish! 🎈
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
