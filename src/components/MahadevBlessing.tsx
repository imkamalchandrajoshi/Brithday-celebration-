import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { fireReaction } from './FloatingReactionOverlay';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Sun,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Radio,
  Music,
  Disc,
  Flame,
  Check,
  RotateCcw,
} from 'lucide-react';

interface MantraOption {
  id: string;
  name: string;
  sanskrit: string;
  hindiTranslation: string;
  significance: string;
  durationSeconds: number;
}

const MANTRAS: MantraOption[] = [
  {
    id: 'maha-mrityunjaya',
    name: 'Maha Mrityunjaya Mantra (महामृत्युंजय मंत्र)',
    sanskrit: `ॐ त्र्यम्बकं यजामहे सुगन्धिं पुष्टिवर्धनम् ।
उर्वारुकमिव बन्धनान्मृत्योर्मुक्षीय मामृतात् ॥`,
    hindiTranslation:
      'हम त्रिनेत्रधारी भगवान शिव की पूजा करते हैं जो सुगंधित हैं और सभी का पोषण करते हैं। जैसे पका हुआ खरबूजा बेल से मुक्त हो जाता है, वैसे ही हम मृत्यु और बंधनों से मुक्त होकर अमरता प्राप्त करें।',
    significance: 'Ultimate healing, longevity, supreme health & Divine protection for Shweta.',
    durationSeconds: 12,
  },
  {
    id: 'om-namah-shivaya',
    name: 'Shiva Moola Mantra (॥ ॐ नमः शिवाय ॥)',
    sanskrit: `॥ ॐ नमः शिवाय ॥
ॐ नमः शिवाय ॐ नमः शिवाय ॐ नमः शिवाय`,
    hindiTranslation:
      'परम कल्याणकारी, सर्वशक्तिमान भगवान शिव को हमारा शत-शत नमन और समर्पण।',
    significance: 'Inner peace, clarity, spiritual grace, and positive energy.',
    durationSeconds: 10,
  },
  {
    id: 'karpura-gauram',
    name: 'Karpura Gauram Karunavataram (कर्पूरगौरं)',
    sanskrit: `कर्पूरगौरं करुणावतारं संसारसारम् भुजगेन्द्रहारम् ।
सदावसन्तं हृदयारविन्दे भवं भवानीसहितं नमामि ॥`,
    hindiTranslation:
      'जो कर्पूर के समान श्वेत वर्ण वाले हैं, करुणा के अवतार हैं, संसार के सार हैं, जो सर्पों की माला धारण करते हैं, माता भवानी के साथ हमारे हृदय कमल में सदैव वास करने वाले भगवान शिव को प्रणाम।',
    significance: 'Auspiciousness, compassionate blessings, and fulfilling all heart wishes.',
    durationSeconds: 14,
  },
  {
    id: 'rudra-shanti',
    name: 'Shiv Shanti Shloka (शिव शांति मंत्र)',
    sanskrit: `ॐ द्यौः शान्तिरन्तरिक्षं शान्तिः पृथिवी शान्तिरापः शान्तिरोषधयः शान्तिः ।
शान्तिरेव शान्तिः सा मा शान्तिरेधि ॥ ॐ शान्तिः शान्तिः शान्तिः ॥`,
    hindiTranslation:
      'समस्त ब्रह्मांड, प्रकृति, जल, औषधियां और हमारा मन सदा शांत और मंगलमय रहे।',
    significance: 'Peaceful harmonious bond, happiness, and prosperity in life.',
    durationSeconds: 15,
  },
];

export const MahadevBlessing: React.FC = () => {
  const [diyaLit, setDiyaLit] = useState(true);
  const [selectedMantraIdx, setSelectedMantraIdx] = useState(0);
  const [isChanting, setIsChanting] = useState(false);
  const [chantProgress, setChantProgress] = useState(0);
  const [isDroneActive, setIsDroneActive] = useState(false);
  const [japCount, setJapCount] = useState(0);
  const [targetJapCount, setTargetJapCount] = useState(11);
  const [activeSoundPlaying, setActiveSoundPlaying] = useState<string | null>(null);

  const chantTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentMantra = MANTRAS[selectedMantraIdx];

  // Stop chant on unmount
  useEffect(() => {
    return () => {
      sound.stopOmDrone();
      sound.stopSpeech();
      if (chantTimerRef.current) clearInterval(chantTimerRef.current);
    };
  }, []);

  const toggleDiya = () => {
    sound.playChime(528, 0.8);
    setDiyaLit(!diyaLit);
    if (!diyaLit) {
      confetti({
        particleCount: 20,
        spread: 40,
        colors: ['#FFDBA4', '#8B5E3C', '#E8D5C4'],
      });
    }
  };

  const playTempleBells = () => {
    setActiveSoundPlaying('bells');
    sound.playTempleBell(216, 3.5);
    setTimeout(() => sound.playTempleBell(288, 3.0), 400);
    setTimeout(() => sound.playTempleBell(324, 2.5), 800);
    setTimeout(() => setActiveSoundPlaying(null), 3500);
  };

  const playShankhSound = () => {
    setActiveSoundPlaying('shankh');
    sound.playShankh();
    confetti({
      particleCount: 25,
      spread: 50,
      colors: ['#8B5E3C', '#FFDBA4', '#C6DABF'],
    });
    setTimeout(() => setActiveSoundPlaying(null), 2800);
  };

  const playDamruSound = () => {
    setActiveSoundPlaying('damru');
    sound.playDamru();
    setTimeout(() => setActiveSoundPlaying(null), 1200);
  };

  const toggleOmDrone = () => {
    if (isDroneActive) {
      sound.stopOmDrone();
      setIsDroneActive(false);
    } else {
      sound.startOmDrone(0.15);
      setIsDroneActive(true);
      sound.playChime(528, 1);
    }
  };

  const toggleMantraChant = () => {
    if (isChanting) {
      // Stop chant
      sound.stopSpeech();
      if (chantTimerRef.current) clearInterval(chantTimerRef.current);
      setIsChanting(false);
      setChantProgress(0);
    } else {
      // Start chant
      setIsChanting(true);
      setChantProgress(0);
      sound.playTempleBell(216, 2.5);

      const duration = currentMantra.durationSeconds;
      const startTime = Date.now();

      if (chantTimerRef.current) clearInterval(chantTimerRef.current);

      chantTimerRef.current = setInterval(() => {
        const elapsed = (Date.now() - startTime) / 1000;
        if (elapsed >= duration) {
          clearInterval(chantTimerRef.current!);
          setChantProgress(100);
          setIsChanting(false);
          setJapCount((prev) => prev + 1);

          confetti({
            particleCount: 30,
            spread: 60,
            colors: ['#FFDBA4', '#8B5E3C', '#E8D5C4'],
          });
        } else {
          setChantProgress((elapsed / duration) * 100);
        }
      }, 100);

      // Speak Sanskrit Mantra aloud with reverent speech
      sound.speakText(
        currentMantra.sanskrit,
        () => {
          setIsChanting(true);
        },
        () => {
          setIsChanting(false);
          setChantProgress(100);
          if (chantTimerRef.current) clearInterval(chantTimerRef.current);
        },
        'hi-IN'
      );
    }
  };

  return (
    <div
      id="mahadev-blessing-card"
      className="w-full max-w-3xl mx-auto my-8 bg-gradient-to-b from-[#FAF5EF] via-[#F6EDE2] to-[#F0E4D7] p-6 sm:p-10 rounded-[36px] shadow-xl border border-[#E8D5C4] relative overflow-hidden"
    >
      {/* Sacred Radiant Aura Background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFDBA4]/25 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C6DABF]/25 rounded-full filter blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center space-y-2 mb-6">
        <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#8B5E3C]/10 text-[#8B5E3C] text-xs font-semibold uppercase tracking-widest border border-[#8B5E3C]/20">
          <Sun className="w-3.5 h-3.5 text-[#8B5E3C]" />
          <span>Divine Mahadev Shrine & Mantra Chants</span>
        </div>
        <h3 className="text-3xl sm:text-4xl font-serif text-[#5D4E46] font-normal">
          महादेव कृपा, मंत्र ध्वनि एवं आशीर्वाद
        </h3>
        <p className="text-xs sm:text-sm text-[#7D6B60] max-w-lg mx-auto font-serif">
          Listen to sacred Vedic chants, ring acoustic temple bells, blow the shankh, and recite holy mantras for Shweta&apos;s happiness & health.
        </p>
      </div>

      {/* Central Sacred Altar Motif */}
      <div className="flex flex-col items-center justify-center my-6 space-y-4">
        {/* Sacred Trishul & Damru Symbol with Glowing Aura */}
        <div className="relative">
          <div className="w-24 h-24 rounded-full bg-white border-2 border-[#DCC7B5] shadow-lg flex items-center justify-center relative p-3">
            <svg
              viewBox="0 0 100 100"
              className={`w-full h-full text-[#8B5E3C] transition-transform duration-500 ${
                isChanting ? 'scale-105 animate-pulse-subtle' : ''
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="3.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Trishul Shaft */}
              <path d="M 50 15 L 50 88" />
              {/* Center Tip */}
              <path d="M 44 25 L 50 10 L 56 25" />
              {/* Left & Right Prongs */}
              <path d="M 50 42 Q 28 42 28 22 L 32 26" />
              <path d="M 50 42 Q 72 42 72 22 L 68 26" />
              {/* Damru Motif */}
              <path d="M 38 52 L 62 64 L 38 64 L 62 52 Z" fill="#E8D5C4" fillOpacity="0.4" />
              {/* Tripundra (Three holy marks) */}
              <line x1="38" y1="32" x2="62" y2="32" stroke="#8B5E3C" strokeWidth="2" />
              <line x1="38" y1="36" x2="62" y2="36" stroke="#8B5E3C" strokeWidth="2" />
              <line x1="38" y1="40" x2="62" y2="40" stroke="#8B5E3C" strokeWidth="2" />
              <circle cx="50" cy="36" r="2.5" fill="#FF6B6B" stroke="none" />
            </svg>
          </div>

          {/* Sound wave rings when chant is playing */}
          {isChanting && (
            <div className="absolute inset-0 rounded-full border-2 border-[#8B5E3C]/40 animate-ping pointer-events-none" />
          )}
        </div>

        {/* Interactive Holy Brass Diya */}
        <div
          onClick={toggleDiya}
          className="cursor-pointer group flex flex-col items-center select-none"
          title={diyaLit ? 'Click to dim diya' : 'Click to light holy diya for Shweta'}
        >
          {diyaLit && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="relative flex flex-col items-center -mb-1"
            >
              <div className="absolute w-8 h-8 rounded-full bg-amber-400/30 filter blur-xs animate-pulse-subtle pointer-events-none" />
              <div className="w-3.5 h-5.5 bg-gradient-to-t from-orange-500 via-amber-300 to-yellow-100 rounded-full animate-flame shadow-sm" />
            </motion.div>
          )}

          {/* Brass Diya Vessel */}
          <div className="w-16 h-5.5 bg-[#C99C6A] rounded-b-full border-t-2 border-[#E5B887] shadow-inner relative flex justify-center items-center">
            <div className="w-12 h-1 bg-[#8B5E3C]/40 rounded-full" />
          </div>
          <span className="text-[10px] text-[#8B5E3C] mt-1 font-medium group-hover:underline flex items-center gap-1">
            <Flame className="w-3 h-3 text-orange-600" />
            {diyaLit ? 'Holy Diya Glowing' : 'Tap to Light Diya'}
          </span>
        </div>
      </div>

      {/* Sacred Instruments Toolbar (Temple Bells, Shankhnaad, Damru, Tanpura Om Drone) */}
      <div className="p-4 rounded-2xl bg-white/80 border border-[#E8D5C4] shadow-xs mb-6">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-[#8B5E3C] mb-3">
          Sacred Temple Sound Instruments
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Temple Bell */}
          <button
            id="btn-temple-bell"
            onClick={playTempleBells}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
              activeSoundPlaying === 'bells'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FDF8F3] border-[#DCC7B5] text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="text-xl">🔔</span>
            <span className="text-[11px] font-semibold">Temple Bells</span>
            <span className="text-[9px] opacity-80">Ringing Ghanti</span>
          </button>

          {/* Shankhnaad */}
          <button
            id="btn-shankhnaad"
            onClick={playShankhSound}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
              activeSoundPlaying === 'shankh'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FDF8F3] border-[#DCC7B5] text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="text-xl">🐚</span>
            <span className="text-[11px] font-semibold">Shankhnaad</span>
            <span className="text-[9px] opacity-80">Holy Conch Horn</span>
          </button>

          {/* Damru Beats */}
          <button
            id="btn-damru-sound"
            onClick={playDamruSound}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
              activeSoundPlaying === 'damru'
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                : 'bg-[#FDF8F3] border-[#DCC7B5] text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="text-xl">🥁</span>
            <span className="text-[11px] font-semibold">Damru Beats</span>
            <span className="text-[9px] opacity-80">Sacred Rhythm</span>
          </button>

          {/* Tanpura Om Drone */}
          <button
            id="btn-om-drone"
            onClick={toggleOmDrone}
            className={`p-2.5 rounded-2xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
              isDroneActive
                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] animate-pulse-subtle'
                : 'bg-[#FDF8F3] border-[#DCC7B5] text-[#8B5E3C] hover:bg-white'
            }`}
          >
            <span className="text-xl">🕉️</span>
            <span className="text-[11px] font-semibold">Om Tanpura</span>
            <span className="text-[9px] opacity-80">{isDroneActive ? 'Drone Active' : 'Start Drone'}</span>
          </button>
        </div>
      </div>

      {/* Mantra Selector Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#8B5E3C]">
            Select Sacred Mantra:
          </span>
          <span className="text-xs text-[#8B5E3C] font-mono">
            Jap Completed: <strong className="text-sm">{japCount}</strong>
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {MANTRAS.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => {
                sound.stopSpeech();
                setIsChanting(false);
                setChantProgress(0);
                setSelectedMantraIdx(idx);
                sound.playChime(500 + idx * 50, 0.2);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                selectedMantraIdx === idx
                  ? 'bg-[#8B5E3C] text-white shadow-xs font-semibold'
                  : 'bg-white/90 border border-[#DCC7B5] text-[#8B5E3C] hover:bg-white'
              }`}
            >
              {m.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Active Mantra Chant Card with Audio Playback */}
      <div className="mt-4 p-6 sm:p-8 bg-white/95 rounded-[28px] border border-[#E8D5C4] shadow-sm space-y-4 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-[#FFDBA4]/40 text-[#8B5E3C] text-[11px] font-semibold">
            {currentMantra.significance}
          </div>
          <h4 className="text-lg sm:text-xl font-serif text-[#5D4E46] font-semibold">
            {currentMantra.name}
          </h4>
        </div>

        {/* Sacred Sanskrit Shloka Box with Synchronized Glow */}
        <div
          className={`p-5 rounded-2xl transition-all duration-300 ${
            isChanting
              ? 'bg-[#FAF3E8] border-2 border-[#8B5E3C] shadow-md scale-[1.01]'
              : 'bg-[#FDF8F3] border border-[#E8D5C4]'
          }`}
        >
          <p className="text-lg sm:text-xl md:text-2xl font-serif text-[#8B5E3C] font-semibold tracking-wide leading-relaxed whitespace-pre-line">
            {currentMantra.sanskrit}
          </p>
        </div>

        {/* Hindi Meaning */}
        <div className="p-3.5 rounded-xl bg-[#FAF5EF] border border-[#E8D5C4]/70 text-xs sm:text-sm text-[#6D5D53] font-serif italic leading-relaxed text-left">
          <span className="font-semibold text-[#8B5E3C] not-italic block mb-0.5">
            भावार्थ (Meaning):
          </span>
          {currentMantra.hindiTranslation}
        </div>

        {/* Progress Bar for Mantra Play */}
        {isChanting && (
          <div className="w-full bg-[#E8D5C4]/60 h-2 rounded-full overflow-hidden">
            <motion.div
              className="bg-[#8B5E3C] h-full"
              style={{ width: `${chantProgress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        )}

        {/* Main Mantra Play Sound Button */}
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <button
            id="btn-play-mantra-sound"
            onClick={toggleMantraChant}
            className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-sm font-semibold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            {isChanting ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause Mantra Chanting</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white translate-x-0.5" />
                <span>Play Mantra Chanting Sound</span>
              </>
            )}
          </button>

          {/* Quick Repeat / Jap +1 */}
          <button
            id="btn-count-jap"
            onClick={(e) => {
              setJapCount((prev) => prev + 1);
              fireReaction({
                event: e,
                count: 5,
                type: 'prayer',
                label: '🕉️ Om Namah Shivaya! Sacred Jap counted for Shweta',
              });
            }}
            className="px-4 py-2.5 rounded-full bg-white border border-[#DCC7B5] hover:bg-[#FDF8F3] text-[#8B5E3C] text-xs font-semibold transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Count 1 Sacred Mantra Jap"
          >
            <span>🙏 +1 Jap Count</span>
          </button>

          {/* Offer Flowers Reaction */}
          <button
            id="btn-offer-flowers"
            onClick={(e) => {
              fireReaction({
                event: e,
                count: 8,
                type: 'flower',
                label: '🌸 Sacred Bilva & Lotus petals offered to Mahadev!',
              });
            }}
            className="px-4 py-2.5 rounded-full bg-white border border-[#DCC7B5] hover:bg-[#FDF8F3] text-[#8B5E3C] text-xs font-semibold transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Offer sacred flowers to Mahadev"
          >
            <span>🌸 Offer Flowers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
