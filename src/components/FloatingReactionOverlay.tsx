import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';

export interface FloatingReaction {
  id: string;
  x: number; // screen X in pixels
  y: number; // screen Y in pixels
  emoji: string;
  color: string;
  size: number;
  rotation: number;
  sway: number;
  duration: number;
}

// Custom event name for firing global floating reactions
export const TRIGGER_FLOATING_REACTION = 'trigger-floating-heart-reaction';

export const fireReaction = (options: {
  event?: React.MouseEvent | { clientX: number; clientY: number };
  x?: number;
  y?: number;
  count?: number;
  type?: 'heart' | 'blessing' | 'prayer' | 'sparkle' | 'flower';
  label?: string;
}) => {
  const { event, count = 3, type = 'heart', label } = options;
  let posX = options.x;
  let posY = options.y;

  if (posX === undefined || posY === undefined) {
    if (event && 'clientX' in event) {
      posX = event.clientX;
      posY = event.clientY;
    } else {
      posX = window.innerWidth / 2;
      posY = window.innerHeight / 2;
    }
  }

  const detail = {
    x: posX,
    y: posY,
    count,
    type,
    label,
  };

  window.dispatchEvent(new CustomEvent(TRIGGER_FLOATING_REACTION, { detail }));
};

const EMOJI_SETS: Record<string, string[]> = {
  heart: ['💖', '❤️', '💗', '💕', '🥰', '✨', '💐'],
  blessing: ['🕉️', '✨', '🕊️', '🌸', '💫', '🙏'],
  prayer: ['🙏', '🕉️', '🪔', '✨', '🌸'],
  sparkle: ['✨', '🌟', '💫', '🎉', '💖'],
  flower: ['🌸', '🌺', '💐', '🌹', '💖', '✨'],
};

const COLOR_SETS = ['#FF6B81', '#FF8E72', '#FF4757', '#FFA502', '#FF6348', '#FF7675', '#E84393'];

export const FloatingReactionOverlay: React.FC = () => {
  const [reactions, setReactions] = useState<FloatingReaction[]>([]);
  const [activeToast, setActiveToast] = useState<{ id: string; text: string; emoji: string } | null>(null);

  useEffect(() => {
    const handleReactionEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{
        x: number;
        y: number;
        count: number;
        type: string;
        label?: string;
      }>;
      const { x, y, count = 3, type = 'heart', label } = customEvent.detail || {};

      const emojiList = EMOJI_SETS[type] || EMOJI_SETS.heart;
      const newItems: FloatingReaction[] = [];

      // Melodic harp chime on reaction
      const pitches = [523, 659, 784, 880, 1046];
      const randomPitch = pitches[Math.floor(Math.random() * pitches.length)];
      sound.playChime(randomPitch, 0.25, 0.08);

      for (let i = 0; i < count; i++) {
        const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
        const color = COLOR_SETS[Math.floor(Math.random() * COLOR_SETS.length)];
        const jitterX = (Math.random() - 0.5) * 50;
        const jitterY = (Math.random() - 0.5) * 30;
        const size = Math.floor(Math.random() * 16) + 20; // 20px - 36px
        const rotation = (Math.random() - 0.5) * 45;
        const sway = (Math.random() - 0.5) * 60;
        const duration = 1.6 + Math.random() * 0.8; // 1.6s - 2.4s

        newItems.push({
          id: `reaction-${Date.now()}-${Math.random()}`,
          x: (x || window.innerWidth / 2) + jitterX,
          y: (y || window.innerHeight / 2) + jitterY,
          emoji,
          color,
          size,
          rotation,
          sway,
          duration,
        });
      }

      setReactions((prev) => [...prev.slice(-30), ...newItems]);

      if (label) {
        setActiveToast({
          id: `toast-${Date.now()}`,
          text: label,
          emoji: emojiList[0],
        });
      }
    };

    window.addEventListener(TRIGGER_FLOATING_REACTION, handleReactionEvent);
    return () => window.removeEventListener(TRIGGER_FLOATING_REACTION, handleReactionEvent);
  }, []);

  // Clear toast after 2.5s
  useEffect(() => {
    if (activeToast) {
      const timer = setTimeout(() => {
        setActiveToast(null);
      }, 2400);
      return () => clearTimeout(timer);
    }
  }, [activeToast]);

  const removeReaction = (id: string) => {
    setReactions((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div
      id="floating-reactions-overlay"
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    >
      {/* Toast Feedback for Community Action */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            key={activeToast.id}
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.9 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto bg-[#8B5E3C] text-white px-4 py-2 rounded-full shadow-xl border border-[#DCC7B5] flex items-center gap-2 text-xs font-semibold"
          >
            <span className="text-base animate-bounce">{activeToast.emoji}</span>
            <span>{activeToast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Emoji Particles */}
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{
              opacity: 0,
              scale: 0.4,
              x: r.x,
              y: r.y,
              rotate: r.rotation,
            }}
            animate={{
              opacity: [0, 1, 1, 0.8, 0],
              scale: [0.4, 1.2, 1, 0.95, 0.7],
              y: r.y - (140 + Math.random() * 80),
              x: r.x + r.sway,
              rotate: r.rotation + (r.sway > 0 ? 25 : -25),
            }}
            transition={{
              duration: r.duration,
              ease: 'easeOut',
              times: [0, 0.15, 0.5, 0.8, 1],
            }}
            onAnimationComplete={() => removeReaction(r.id)}
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              fontSize: `${r.size}px`,
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))',
              userSelect: 'none',
              transformOrigin: 'center center',
            }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
