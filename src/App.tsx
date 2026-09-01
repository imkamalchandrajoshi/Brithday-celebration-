import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { sound } from './utils/audio';
import { FloatingBalloons } from './components/FloatingBalloons';
import { FloatingReactionOverlay, fireReaction } from './components/FloatingReactionOverlay';
import { BirthdayCake } from './components/BirthdayCake';
import { BlessingLetter } from './components/BlessingLetter';
import { MahadevBlessing } from './components/MahadevBlessing';
import { PhotoMemory } from './components/PhotoMemory';
import { MemoriesGallery } from './components/MemoriesGallery';
import { VoiceNoteAudio } from './components/VoiceNoteAudio';
import { BirthdayCountdown } from './components/BirthdayCountdown';
import { ShwetaTriviaQuiz } from './components/ShwetaTriviaQuiz';
import {
  SiteCustomizer,
  SiteCustomization,
  DEFAULT_CUSTOMIZATION,
  THEME_OPTIONS,
} from './components/SiteCustomizer';
import {
  Cake,
  Mail,
  Sun,
  Camera,
  Music,
  Sparkles,
  Heart,
  Share2,
  Check,
  Images,
  Headphones,
  Sliders,
  Edit3,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'all' | 'audio' | 'gallery' | 'letter' | 'cake' | 'mahadev' | 'photo' | 'quiz'>('all');
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [blessingToast, setBlessingToast] = useState<string | null>(null);

  // Full site customization state with localStorage persistence
  const [customization, setCustomization] = useState<SiteCustomization>(() => {
    try {
      const saved = localStorage.getItem('shweta_birthday_site_customization');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return DEFAULT_CUSTOMIZATION;
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shweta_birthday_site_customization', JSON.stringify(customization));
    } catch {
      // Quota safe
    }
  }, [customization]);

  // Initial welcome confetti on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.3 },
        colors: ['#8B5E3C', '#E8D5C4', '#C6DABF', '#FFB3B3', '#FFDBA4'],
      });
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  const triggerCelebrationShower = () => {
    sound.playPop();
    confetti({
      particleCount: 75,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#8B5E3C', '#E8D5C4', '#C6DABF', '#FFB3B3', '#FFDBA4'],
    });
  };

  const toggleBirthdayMusic = () => {
    setIsPlayingMusic(true);
    sound.playBirthdayTune();
    setTimeout(() => setIsPlayingMusic(false), 5500);
  };

  const handleShareApp = () => {
    sound.playChime(660, 0.4);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 3000);
    }
  };

  const sendQuickBlessing = (blessingText: string, e?: React.MouseEvent) => {
    sound.playChime(784, 0.5);
    triggerCelebrationShower();
    fireReaction({
      event: e,
      count: 7,
      type: 'heart',
      label: `Blessing Sent: ${blessingText}`,
    });
    setBlessingToast(blessingText);
    setTimeout(() => setBlessingToast(null), 3500);
  };

  // Get current active theme config
  const currentTheme = THEME_OPTIONS.find((t) => t.id === customization.colorTheme) || THEME_OPTIONS[0];

  // Derive theme classes
  const getThemeBackgroundClass = () => {
    switch (customization.colorTheme) {
      case 'rose-blush':
        return 'bg-[#FFF5F8] text-[#5C4049] selection:bg-[#FFD1DC] selection:text-[#5C4049]';
      case 'sage-divine':
        return 'bg-[#F5F9F5] text-[#3D4F3D] selection:bg-[#C6DABF] selection:text-[#3D4F3D]';
      case 'royal-amber':
        return 'bg-[#FFFDF0] text-[#5C4B3A] selection:bg-[#FEE4A6] selection:text-[#5C4B3A]';
      case 'celestial-night':
        return 'bg-[#181926] text-[#E0E2F0] selection:bg-[#9381FF] selection:text-[#FFFFFF]';
      case 'warm-sand':
      default:
        return 'bg-[#FDF8F3] text-[#5D4E46] selection:bg-[#E8D5C4] selection:text-[#5D4E46]';
    }
  };

  const getFontFamilyClass = () => {
    switch (customization.fontFamily) {
      case 'sans':
        return 'font-sans';
      case 'display':
        return 'font-serif';
      case 'serif':
      default:
        return 'font-serif';
    }
  };

  // Check if current date is after 26 Oct 2026 (Auto-expire/archive after celebration)
  const isExpired = (() => {
    try {
      const now = new Date();
      // Expiration deadline: 26 October 2026 23:59:59
      const expiryDeadline = new Date(2026, 9, 26, 23, 59, 59, 999);
      return now.getTime() > expiryDeadline.getTime();
    } catch {
      return false;
    }
  })();

  const [bypassExpiry, setBypassExpiry] = useState(false);

  if (isExpired && !bypassExpiry) {
    return (
      <div className="min-h-screen bg-[#FDF8F3] text-[#5D4E46] flex flex-col items-center justify-center p-6 text-center font-serif">
        <div className="max-w-md w-full p-8 rounded-[32px] bg-white border border-[#E8D5C4] shadow-lg space-y-5">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#FAF5EF] border border-[#E8D5C4] flex items-center justify-center text-2xl">
            🕊️
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#8B5E3C]">
              Birthday Tribute Concluded
            </h2>
            <p className="text-sm text-[#7D6B60] leading-relaxed">
              This birthday tribute for {customization.recipientName} was scheduled for 25 October 2026. As requested, the website has automatically completed its celebration period.
            </p>
          </div>
          <div className="pt-2 border-t border-[#F2E8DF] space-y-3">
            <p className="text-xs text-[#8B5E3C] italic">
              May Mahadev&apos;s blessings stay with {customization.recipientName} forever! 🕉️
            </p>
            <button
              onClick={() => setBypassExpiry(true)}
              className="px-4 py-2 rounded-xl bg-[#FAF5EF] border border-[#DCC7B5] hover:bg-[#F2E8DF] text-[#8B5E3C] text-xs font-semibold transition-colors cursor-pointer"
            >
              Reopen / View Archived Memories 🌸
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${getThemeBackgroundClass()} relative overflow-x-hidden flex flex-col justify-between transition-colors duration-500`}>
      {/* Background Organic Ambient Blobs */}
      {customization.enableAmbientBlobs && (
        <>
          <div className="fixed top-[-40px] left-[-40px] opacity-25 pointer-events-none z-0">
            <svg width="420" height="420" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" fill={currentTheme.primaryHex} />
            </svg>
          </div>
          <div className="fixed bottom-[-60px] right-[-60px] opacity-20 pointer-events-none z-0">
            <svg width="500" height="500" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="45" fill="#C6DABF" />
            </svg>
          </div>
        </>
      )}

      {/* Decorative vertical rhythm bars from Natural Tones theme */}
      <div className="fixed left-6 top-1/2 -translate-y-1/2 space-y-3 opacity-30 pointer-events-none hidden lg:block z-0">
        <div className="w-1 h-16 bg-[#DCC7B5] rounded-full" />
        <div className="w-1 h-32 bg-[#DCC7B5] rounded-full" />
        <div className="w-1 h-10 bg-[#DCC7B5] rounded-full" />
      </div>

      {/* Floating Interactive Balloons Layer */}
      {customization.enableFloatingBalloons && <FloatingBalloons />}

      {/* Real-time Floating Heart & Reaction Animation Overlay */}
      <FloatingReactionOverlay />

      {/* Floating Site Customizer & Edit Center Component */}
      <SiteCustomizer
        customization={customization}
        onUpdate={(updated) => setCustomization(updated)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Top Celebration Bar */}
        <header className="flex flex-col items-center text-center space-y-4 mb-10">
          {/* Trio Mini Balloon / Candle Accent */}
          <div className="flex gap-4 items-end mb-1">
            <div className="w-10 h-16 bg-[#FFB3B3] rounded-t-full border-b-2 border-white relative shadow-xs animate-float-slow" />
            <div className="w-12 h-20 bg-[#FFDBA4] rounded-t-full border-b-2 border-white relative shadow-sm animate-float-reverse" />
            <div className="w-10 h-16 bg-[#C1E1C1] rounded-t-full border-b-2 border-white relative shadow-xs animate-float-slow delay-200" />
          </div>

          {/* Main Title Banner */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#E8D5C4]/60 border border-[#DCC7B5] text-[#8B5E3C] text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" />
              <span>A Special Birthday Tribute</span>
              <Sparkles className="w-3.5 h-3.5" />
            </div>

            <h1 className={`text-4xl sm:text-6xl md:text-7xl ${getFontFamilyClass()} tracking-tight font-light`}>
              {customization.headlineGreeting.includes(customization.recipientName) ? (
                <>
                  {customization.headlineGreeting.split(customization.recipientName)[0]}
                  <span className="italic font-semibold text-[#8B5E3C]">
                    {customization.recipientName}
                  </span>
                  {customization.headlineGreeting.split(customization.recipientName)[1]}
                </>
              ) : (
                customization.headlineGreeting
              )}
            </h1>

            <p className="text-base sm:text-lg text-[#7D6B60] font-serif italic max-w-xl mx-auto">
              {customization.subtitleGreeting}
            </p>
          </div>

          {/* Dynamic Birthday Countdown / Today Celebration Banner */}
          <BirthdayCountdown
            recipientName={customization.recipientName}
            birthdayDateString={customization.birthdayDate}
            onDateChange={(newDate) =>
              setCustomization({ ...customization, birthdayDate: newDate })
            }
          />

          {/* Top Quick Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
            <button
              id="btn-play-music"
              onClick={toggleBirthdayMusic}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer ${
                isPlayingMusic
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] animate-pulse'
                  : 'bg-white/90 border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3]'
              }`}
            >
              <Music className="w-3.5 h-3.5" />
              <span>{isPlayingMusic ? 'Playing Birthday Melody 🎵' : 'Play Melody'}</span>
            </button>

            <button
              id="btn-shower-confetti"
              onClick={triggerCelebrationShower}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3] text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8B5E3C]" />
              <span>Shower Flowers & Confetti</span>
            </button>

            <button
              id="btn-share-link"
              onClick={handleShareApp}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 border border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3] text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              {linkCopied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Greeting</span>
                </>
              )}
            </button>

            {/* Quick Edit Website Button */}
            <button
              id="btn-edit-website-header"
              onClick={() => {
                const btn = document.getElementById('btn-open-site-customizer');
                btn?.click();
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/90 border border-[#8B5E3C]/40 text-[#8B5E3C] hover:bg-[#FAF5EF] text-xs font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Customize / Edit Site</span>
            </button>
          </div>

          {/* Navigation Category Filter Pills */}
          <nav aria-label="Celebration Sections" className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {[
              { id: 'all', label: 'Complete Celebration', icon: Sparkles },
              { id: 'quiz', label: 'Trivia Quiz & Rewards', icon: HelpCircle },
              { id: 'audio', label: 'Voice Note & Audio', icon: Headphones },
              { id: 'gallery', label: 'Photo Album', icon: Images },
              { id: 'letter', label: 'Blessing Letter', icon: Mail },
              { id: 'cake', label: 'Blow Cake Candles', icon: Cake },
              { id: 'mahadev', label: 'Mahadev Shrine & Mantras', icon: Sun },
              { id: 'photo', label: 'Memory Frame', icon: Camera },
            ].map((tab) => {
              const Icon = tab.icon;
              const isSelected = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => {
                    sound.playChime(550, 0.2);
                    setActiveTab(tab.id as typeof activeTab);
                  }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#8B5E3C] text-white shadow-md'
                      : 'bg-white/80 border border-[#E8D5C4] text-[#6D5D53] hover:bg-[#FDF8F3] hover:text-[#8B5E3C]'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </header>

        {/* Dynamic Sections Based on Active Filter */}
        <main className="space-y-10">
          {/* 1. Interactive 'How Well Do You Know Shweta?' Trivia Quiz */}
          {(activeTab === 'all' || activeTab === 'quiz') && (
            <motion.section
              key="quiz-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <ShwetaTriviaQuiz recipientName={customization.recipientName} />
            </motion.section>
          )}

          {/* 2. Voice Note & Audio Wish */}
          {(activeTab === 'all' || activeTab === 'audio') && (
            <motion.section
              key="audio-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <VoiceNoteAudio />
            </motion.section>
          )}

          {/* 2. Heartfelt Letter Section (Editable + Audio Speech) */}
          {(activeTab === 'all' || activeTab === 'letter') && (
            <motion.section
              key="letter-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              <BlessingLetter />
            </motion.section>
          )}

          {/* 3. Photo Memories Gallery Album */}
          {(activeTab === 'all' || activeTab === 'gallery') && (
            <motion.section
              key="gallery-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <MemoriesGallery />
            </motion.section>
          )}

          {/* 4. Interactive Cake & Blowable Candles */}
          {(activeTab === 'all' || activeTab === 'cake') && (
            <motion.section
              key="cake-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
            >
              <BirthdayCake />
            </motion.section>
          )}

          {/* 5. Mahadev Blessings Shrine & Mantra Audio Section */}
          {(activeTab === 'all' || activeTab === 'mahadev') && (
            <motion.section
              key="mahadev-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <MahadevBlessing />
            </motion.section>
          )}

          {/* 6. Single Memory Frame */}
          {(activeTab === 'all' || activeTab === 'photo') && (
            <motion.section
              key="photo-sec"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
            >
              <PhotoMemory />
            </motion.section>
          )}

          {/* Quick Blessing Wishes Deck */}
          {activeTab === 'all' && (
            <section id="quick-blessings-deck" className="w-full max-w-3xl mx-auto text-center space-y-4 pt-4">
              <h4 className="text-sm font-semibold uppercase tracking-widest text-[#8B5E3C]">
                Send an Instant Blessing to {customization.recipientName}
              </h4>
              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {[
                  '🌸 Mahadev bless you always',
                  '💖 Stay loving & caring forever',
                  '⭐ Deserve all your heart desires',
                  '🕊️ Endless peace and prosperity',
                  `🎂 Happiest Birthday ${customization.recipientName}!`,
                ].map((blessing, idx) => (
                  <button
                    key={idx}
                    id={`btn-quick-blessing-${idx}`}
                    onClick={(e) => sendQuickBlessing(blessing, e)}
                    className="px-4 py-2 rounded-full bg-white/90 border border-[#E8D5C4] hover:border-[#8B5E3C] hover:bg-[#FDF8F3] text-[#6D5D53] text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                  >
                    <Heart className="w-3 h-3 text-[#8B5E3C] fill-[#FFB3B3]" />
                    <span>{blessing}</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[#E8D5C4]/80 text-center space-y-2">
          <p className="text-sm font-serif italic text-[#6D5D53]">
            {customization.footerQuote}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#8B5E3C] font-medium">
            <span>Happy Birthday {customization.recipientName}</span>
            <span>•</span>
            <span>With all prayers to Mahadev</span>
            <span>•</span>
            <span>From {customization.senderName}</span>
            <span>•</span>
            <Heart className="w-3.5 h-3.5 fill-[#8B5E3C] text-[#8B5E3C]" />
          </div>
        </footer>
      </div>

      {/* Blessing Toast Notification */}
      <AnimatePresence>
        {blessingToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#8B5E3C] text-white px-6 py-3 rounded-full shadow-2xl border border-[#A6754E] flex items-center gap-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-[#FFDBA4]" />
            <span>Blessing Sent: {blessingToast}</span>
            <Heart className="w-4 h-4 fill-[#FFB3B3] text-[#FFB3B3]" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
