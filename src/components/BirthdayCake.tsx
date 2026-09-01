import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from '../utils/audio';
import { Flame, Wind, RotateCcw, Mic, MicOff, Sparkles, Heart } from 'lucide-react';

interface CandleState {
  id: number;
  lit: boolean;
  xOffset: number; // in pixels from center
  color: string;
}

export const BirthdayCake: React.FC = () => {
  const [candles, setCandles] = useState<CandleState[]>([
    { id: 1, lit: true, xOffset: -45, color: '#E8D5C4' },
    { id: 2, lit: true, xOffset: -15, color: '#FFB3B3' },
    { id: 3, lit: true, xOffset: 15, color: '#FFDBA4' },
    { id: 4, lit: true, xOffset: 45, color: '#C1E1C1' },
  ]);

  const [wishMade, setWishMade] = useState(false);
  const [userWishText, setUserWishText] = useState('');
  const [wishInputSubmitted, setWishInputSubmitted] = useState(false);
  const [isMicListening, setIsMicListening] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const allBlown = candles.every((c) => !c.lit);

  // Trigger celebration when all candles are blown
  useEffect(() => {
    if (allBlown && !wishMade) {
      setWishMade(true);
      sound.playBlowWind();
      setTimeout(() => {
        sound.playBirthdayTune();
        triggerFestiveConfetti();
      }, 500);
    }
  }, [allBlown, wishMade]);

  const triggerFestiveConfetti = () => {
    // Left burst
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 70,
      origin: { x: 0.15, y: 0.75 },
      colors: ['#8B5E3C', '#E8D5C4', '#C6DABF', '#FFB3B3', '#FFDBA4', '#DCC7B5'],
    });
    // Right burst
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 70,
      origin: { x: 0.85, y: 0.75 },
      colors: ['#8B5E3C', '#E8D5C4', '#C6DABF', '#FFB3B3', '#FFDBA4', '#DCC7B5'],
    });
  };

  const blowSingleCandle = (id: number) => {
    sound.playChime(440 + id * 60, 0.4);
    setCandles((prev) =>
      prev.map((c) => (c.id === id ? { ...c, lit: false } : c))
    );
  };

  const blowAllCandles = () => {
    sound.playBlowWind();
    setCandles((prev) => prev.map((c) => ({ ...c, lit: false })));
  };

  const relightCandles = () => {
    sound.playChime(528, 0.6);
    setCandles((prev) => prev.map((c) => ({ ...c, lit: true })));
    setWishMade(false);
  };

  // Microphone Blowing Detection
  const startMicListener = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      micStreamRef.current = stream;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      setIsMicListening(true);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const detectBlow = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        // Low frequency wind noise detection
        for (let i = 0; i < 20; i++) {
          sum += dataArray[i];
        }
        const average = sum / 20;
        setAudioLevel(Math.min(100, Math.round((average / 180) * 100)));

        // Threshold for blow detection
        if (average > 45) {
          blowAllCandles();
          stopMicListener();
          return;
        }

        animationFrameRef.current = requestAnimationFrame(detectBlow);
      };

      detectBlow();
    } catch {
      setIsMicListening(false);
    }
  };

  const stopMicListener = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((track) => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsMicListening(false);
    setAudioLevel(0);
  };

  useEffect(() => {
    return () => {
      stopMicListener();
    };
  }, []);

  return (
    <div
      id="birthday-cake-card"
      className="w-full max-w-2xl mx-auto bg-white/90 backdrop-blur-sm p-8 sm:p-10 rounded-[32px] shadow-xl border border-[#F2E8DF] relative overflow-hidden flex flex-col items-center"
    >
      {/* Decorative background aura */}
      <div className="absolute -top-16 -right-16 w-56 h-56 rounded-full bg-[#E8D5C4]/30 filter blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#C6DABF]/25 filter blur-3xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center gap-2 mb-2">
        <span className="px-4 py-1 rounded-full bg-[#8B5E3C] text-white text-xs font-semibold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
          <Sparkles className="w-3 h-3 text-[#FFDBA4]" />
          Make a Wish & Blow
        </span>
      </div>

      <h3 className="text-2xl sm:text-3xl font-serif text-[#5D4E46] text-center mb-1 font-normal">
        Shweta&apos;s Celebration Cake
      </h3>
      <p className="text-[#8B5E3C] text-xs sm:text-sm text-center mb-6 max-w-md">
        {allBlown
          ? '✨ All candles blown! May Mahadev fulfill every heartfelt wish!'
          : 'Blow gently into your mic, or tap the candles / button below to make your birthday wish!'}
      </p>

      {/* The Artisanal Cake Visual */}
      <div className="relative w-72 sm:w-80 h-64 flex flex-col items-center justify-end select-none my-2">
        {/* Cake Stand Base */}
        <div className="absolute bottom-0 w-64 h-4 bg-[#E8D5C4] rounded-full shadow-md border-t border-white/60 z-0" />
        <div className="absolute bottom-2 w-28 h-6 bg-[#DCC7B5] rounded-b-md shadow-inner z-0" />
        <div className="absolute bottom-6 w-44 h-3 bg-[#E8D5C4] rounded-full shadow-sm z-0" />

        {/* Cake Base Tier (Bottom) */}
        <div className="relative z-10 w-56 h-24 bg-[#F2E8DF] rounded-xl border border-[#E8D5C4] shadow-md flex flex-col justify-between overflow-hidden">
          {/* Top frosting drip */}
          <div className="w-full h-4 bg-[#FDF8F3] border-b border-[#E8D5C4]/60 flex justify-around items-end">
            <div className="w-4 h-3 bg-[#FDF8F3] rounded-b-full shadow-sm" />
            <div className="w-5 h-4 bg-[#FDF8F3] rounded-b-full shadow-sm" />
            <div className="w-4 h-3 bg-[#FDF8F3] rounded-b-full shadow-sm" />
            <div className="w-5 h-5 bg-[#FDF8F3] rounded-b-full shadow-sm" />
            <div className="w-4 h-3 bg-[#FDF8F3] rounded-b-full shadow-sm" />
          </div>

          {/* Decorative piped pearls */}
          <div className="flex justify-between px-3 py-1">
            <span className="text-[#8B5E3C]/60 text-xs tracking-widest font-serif">★ ★ ★ ★ ★</span>
          </div>

          {/* Bottom crust layer */}
          <div className="w-full h-3 bg-[#DCC7B5]/60 border-t border-[#E8D5C4]" />
        </div>

        {/* Cake Top Tier */}
        <div className="relative z-20 w-40 h-20 bg-[#FDF8F3] rounded-xl border border-[#E8D5C4] shadow-md -mb-2 flex flex-col justify-between overflow-hidden">
          {/* Caramel Drizzle */}
          <div className="w-full h-3 bg-[#8B5E3C]/20 border-b border-[#8B5E3C]/30 flex justify-around">
            <div className="w-2.5 h-3.5 bg-[#8B5E3C]/30 rounded-b-full" />
            <div className="w-3 h-4 bg-[#8B5E3C]/30 rounded-b-full" />
            <div className="w-2.5 h-3 bg-[#8B5E3C]/30 rounded-b-full" />
          </div>

          {/* Botanical Wildflower & Berry Garnish */}
          <div className="flex justify-center items-center gap-2 py-1">
            <span className="text-sm">🌸</span>
            <span className="text-xs">🍓</span>
            <span className="text-sm">🌼</span>
            <span className="text-xs">🍓</span>
            <span className="text-sm">🌸</span>
          </div>

          <div className="w-full h-2 bg-[#E8D5C4]/50 border-t border-[#E8D5C4]" />
        </div>

        {/* Candles positioned along the top tier */}
        <div className="absolute top-12 z-30 flex justify-center items-end pointer-events-auto">
          {candles.map((candle) => (
            <div
              key={candle.id}
              onClick={() => candle.lit && blowSingleCandle(candle.id)}
              style={{
                transform: `translateX(${candle.xOffset}px)`,
              }}
              className="absolute flex flex-col items-center cursor-pointer group"
              title={candle.lit ? 'Click to blow out candle' : 'Candle blown out'}
            >
              {/* Flame or Smoke */}
              <div className="h-10 flex items-end justify-center relative">
                {candle.lit ? (
                  <div className="relative flex flex-col items-center">
                    {/* Outer Glow Halo */}
                    <div className="absolute w-8 h-8 rounded-full bg-amber-300/40 filter blur-md animate-pulse-subtle pointer-events-none" />

                    {/* Flickering Flame */}
                    <div className="w-3.5 h-6 bg-gradient-to-t from-amber-500 via-yellow-300 to-white rounded-full animate-flame shadow-sm relative">
                      <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-2.5 bg-blue-400 rounded-full opacity-60" />
                    </div>
                  </div>
                ) : (
                  /* Smoke Wisp Rising */
                  <div className="relative">
                    <div className="w-1.5 h-6 bg-stone-400/40 rounded-full animate-smoke filter blur-[1px]" />
                    <div className="w-1 h-3 bg-stone-300/30 rounded-full animate-smoke filter blur-[1px] delay-150" />
                  </div>
                )}
              </div>

              {/* Candle Wick */}
              <div className="w-0.5 h-2 bg-stone-800 -mb-0.5" />

              {/* Candle Stick */}
              <div
                className="w-3 h-14 rounded-t-sm shadow-sm relative overflow-hidden transition-transform group-hover:scale-105"
                style={{
                  backgroundColor: candle.color,
                  border: '1px solid rgba(0,0,0,0.08)',
                }}
              >
                {/* Spiral candy stripes */}
                <div className="absolute inset-0 opacity-25 bg-[repeating-linear-gradient(45deg,#fff,#fff_2px,transparent_2px,transparent_6px)]" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Action Controls */}
      <div className="w-full mt-6 flex flex-wrap items-center justify-center gap-3">
        {!allBlown ? (
          <>
            <button
              id="btn-blow-candles"
              onClick={blowAllCandles}
              className="flex items-center gap-2 px-6 py-3 bg-[#8B5E3C] hover:bg-[#704B30] text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              <Wind className="w-4 h-4" />
              <span>Blow All Candles</span>
            </button>

            <button
              id="btn-mic-blow"
              onClick={isMicListening ? stopMicListener : startMicListener}
              className={`flex items-center gap-2 px-5 py-3 border rounded-full text-sm font-medium transition-all cursor-pointer ${
                isMicListening
                  ? 'bg-red-50 border-red-300 text-red-700 animate-pulse'
                  : 'bg-white border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3]'
              }`}
              title="Use microphone to blow candle with your breath"
            >
              {isMicListening ? (
                <>
                  <MicOff className="w-4 h-4" />
                  <span>Blow Into Mic ({audioLevel}%)</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Blow with Mic</span>
                </>
              )}
            </button>
          </>
        ) : (
          <button
            id="btn-relight-candles"
            onClick={relightCandles}
            className="flex items-center gap-2 px-6 py-3 bg-[#8B5E3C] hover:bg-[#704B30] text-white rounded-full text-sm font-medium shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Relight Candles</span>
          </button>
        )}
      </div>

      {/* Birthday Wish Parchment Note that unlocks when candles are blown */}
      <AnimatePresence>
        {allBlown && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="w-full mt-6 p-5 rounded-2xl bg-[#FDF8F3] border border-[#E8D5C4] text-center space-y-3 shadow-sm"
          >
            <div className="flex items-center justify-center gap-2 text-[#8B5E3C] text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Wish Received by Mahadev</span>
              <Sparkles className="w-4 h-4" />
            </div>

            {!wishInputSubmitted ? (
              <div className="space-y-2">
                <p className="text-xs text-[#6D5D53]">
                  Write a secret birthday wish or blessing to seal into the universe:
                </p>
                <div className="flex gap-2 max-w-md mx-auto">
                  <input
                    id="input-user-wish"
                    type="text"
                    value={userWishText}
                    onChange={(e) => setUserWishText(e.target.value)}
                    placeholder="E.g., Happiness, endless success, peace..."
                    className="flex-1 px-4 py-2 text-sm bg-white border border-[#DCC7B5] rounded-full focus:outline-none focus:border-[#8B5E3C] text-[#5D4E46]"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userWishText.trim()) {
                        setWishInputSubmitted(true);
                        sound.playChime(659, 0.8);
                        triggerFestiveConfetti();
                      }
                    }}
                  />
                  <button
                    id="btn-submit-wish"
                    onClick={() => {
                      if (userWishText.trim()) {
                        setWishInputSubmitted(true);
                        sound.playChime(659, 0.8);
                        triggerFestiveConfetti();
                      }
                    }}
                    disabled={!userWishText.trim()}
                    className="px-4 py-2 bg-[#8B5E3C] text-white text-xs rounded-full font-medium disabled:opacity-50 hover:bg-[#704B30] transition-colors"
                  >
                    Seal Wish ✨
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-white rounded-xl border border-[#E8D5C4]/80 text-[#6D5D53] italic font-serif text-sm">
                &ldquo;{userWishText}&rdquo;
                <div className="text-xs text-[#8B5E3C] font-sans font-medium mt-1 not-italic flex items-center justify-center gap-1">
                  <Heart className="w-3 h-3 fill-[#8B5E3C]" /> Sealed with divine blessings for Shweta
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
