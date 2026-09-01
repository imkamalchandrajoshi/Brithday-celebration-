import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Settings,
  X,
  Sparkles,
  Palette,
  Type,
  Volume2,
  VolumeX,
  RotateCcw,
  Check,
  Music,
  Heart,
  Sliders,
  ShieldAlert,
  Save,
} from 'lucide-react';

export interface SiteCustomization {
  recipientName: string;
  senderName: string;
  birthdayDate: string; // YYYY-MM-DD
  headlineGreeting: string;
  subtitleGreeting: string;
  footerQuote: string;
  colorTheme: 'warm-sand' | 'rose-blush' | 'sage-divine' | 'royal-amber' | 'celestial-night';
  fontFamily: 'serif' | 'sans' | 'display';
  backgroundMusicAuto: boolean;
  enableFloatingBalloons: boolean;
  enableAmbientBlobs: boolean;
  enableDevotionalAura: boolean;
}

export const DEFAULT_CUSTOMIZATION: SiteCustomization = {
  recipientName: 'Shweta',
  senderName: 'Your Well-Wisher',
  birthdayDate: '2026-10-25',
  headlineGreeting: 'Happy Birthday, Shweta',
  subtitleGreeting:
    'Wishing you a day filled with boundless joy, divine blessings from Mahadev, and endless warmth.',
  footerQuote:
    '“May every sunrise bring you reasons to smile and every sunset leave you with peace.”',
  colorTheme: 'warm-sand',
  fontFamily: 'serif',
  backgroundMusicAuto: false,
  enableFloatingBalloons: true,
  enableAmbientBlobs: true,
  enableDevotionalAura: true,
};

interface SiteCustomizerProps {
  customization: SiteCustomization;
  onUpdate: (updated: SiteCustomization) => void;
}

export const THEME_OPTIONS: {
  id: SiteCustomization['colorTheme'];
  name: string;
  previewClass: string;
  desc: string;
  bgHex: string;
  primaryHex: string;
}[] = [
  {
    id: 'warm-sand',
    name: 'Warm Sand (Classic)',
    previewClass: 'from-[#FAF5EF] to-[#E8D5C4] border-[#8B5E3C]',
    desc: 'Earthy, warm terracotta, soft sand & creamy natural tones',
    bgHex: '#FDF8F3',
    primaryHex: '#8B5E3C',
  },
  {
    id: 'rose-blush',
    name: 'Rose & Peach Blush',
    previewClass: 'from-[#FFF0F5] to-[#FFD1DC] border-[#D87093]',
    desc: 'Gentle pastel rose, delicate petal hues & warm romantic glow',
    bgHex: '#FFF5F8',
    primaryHex: '#B85D7A',
  },
  {
    id: 'sage-divine',
    name: 'Divine Sage & Jade',
    previewClass: 'from-[#F2F7F2] to-[#C6DABF] border-[#588157]',
    desc: 'Calm healing green, tranquil botanical aura & peaceful blessings',
    bgHex: '#F5F9F5',
    primaryHex: '#4A724B',
  },
  {
    id: 'royal-amber',
    name: 'Golden Saffron & Amber',
    previewClass: 'from-[#FFFDF5] to-[#FEE4A6] border-[#D97706]',
    desc: 'Sacred diya glow, festive Vedic aura & radiant golden energy',
    bgHex: '#FFFDF0',
    primaryHex: '#A15918',
  },
  {
    id: 'celestial-night',
    name: 'Cosmic Twilight & Slate',
    previewClass: 'from-[#2A2B3D] to-[#1E1E2E] border-[#9381FF]',
    desc: 'Rich spiritual night sky, glowing silver stars & tranquil mood',
    bgHex: '#1E1F29',
    primaryHex: '#B5A6FF',
  },
];

export const SiteCustomizer: React.FC<SiteCustomizerProps> = ({
  customization,
  onUpdate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'content' | 'theme' | 'effects'>('content');
  const [draft, setDraft] = useState<SiteCustomization>(customization);
  const [saveToast, setSaveToast] = useState(false);

  // Sync draft whenever customization props change
  useEffect(() => {
    setDraft(customization);
  }, [customization]);

  const handleOpen = () => {
    setDraft(customization);
    setIsOpen(true);
    sound.playChime(660, 0.2);
  };

  const handleClose = () => {
    setIsOpen(false);
    sound.playChime(440, 0.2);
  };

  const handleApplyChanges = () => {
    onUpdate(draft);
    sound.playChime(784, 0.4);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
    confetti({
      particleCount: 35,
      spread: 60,
      colors: ['#8B5E3C', '#FFDBA4', '#C6DABF', '#FFB3B3'],
    });
  };

  const handleResetDefaults = () => {
    setDraft(DEFAULT_CUSTOMIZATION);
    onUpdate(DEFAULT_CUSTOMIZATION);
    sound.playChime(520, 0.3);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2000);
  };

  return (
    <>
      {/* Floating Customize / Edit Trigger Button (Always accessible) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          id="btn-open-site-customizer"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleOpen}
          className="flex items-center gap-2.5 px-4 sm:px-5 py-3 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white shadow-2xl border-2 border-white/80 transition-all cursor-pointer group"
          title="Edit and customize entire website options"
        >
          <Sliders className="w-4 h-4 text-[#FFDBA4] group-hover:rotate-45 transition-transform" />
          <span className="text-xs sm:text-sm font-semibold tracking-wide">
            Customize Website
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </motion.button>
      </div>

      {/* Main Slide-Over / Modal Panel */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClose}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-[#E8D5C4] overflow-hidden flex flex-col max-h-[90vh] z-10"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-[#F2E8DF] bg-gradient-to-r from-[#FAF5EF] to-[#F5ECE2] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#8B5E3C] text-white flex items-center justify-center shadow-sm">
                    <Settings className="w-5 h-5 text-[#FFDBA4] animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-serif font-semibold text-[#5D4E46]">
                      Website Customization & Edit Center
                    </h3>
                    <p className="text-xs text-[#8B5E3C]">
                      Personalize greetings, names, color themes, and effects in real-time
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="p-2 rounded-full hover:bg-black/5 text-[#5D4E46] transition-colors cursor-pointer"
                  title="Close customizer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#F2E8DF] bg-[#FAF5EF]/50 px-6 pt-2">
                {[
                  { id: 'content', label: 'Wording & Names', icon: Type },
                  { id: 'theme', label: 'Colors & Theme', icon: Palette },
                  { id: 'effects', label: 'Animations & Aura', icon: Sparkles },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as typeof activeTab);
                        sound.playChime(500, 0.15);
                      }}
                      className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-medium border-b-2 transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#8B5E3C] text-[#8B5E3C] font-semibold bg-white rounded-t-xl'
                          : 'border-transparent text-[#7D6B60] hover:text-[#5D4E46]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Tab Contents (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {/* 1. Content / Texts Tab */}
                {activeTab === 'content' && (
                  <div className="space-y-4">
                    {/* Recipient & Sender Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-1.5">
                          Birthday Person Name (Recipient):
                        </label>
                        <input
                          type="text"
                          value={draft.recipientName}
                          onChange={(e) =>
                            setDraft({
                              ...draft,
                              recipientName: e.target.value,
                              headlineGreeting: `Happy Birthday, ${e.target.value}`,
                            })
                          }
                          className="w-full text-sm font-medium text-[#5D4E46] p-3 rounded-2xl bg-[#FDF8F3] border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all shadow-2xs"
                          placeholder="e.g. Shweta"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-1.5">
                          Sender / Signature Name:
                        </label>
                        <input
                          type="text"
                          value={draft.senderName}
                          onChange={(e) =>
                            setDraft({ ...draft, senderName: e.target.value })
                          }
                          className="w-full text-sm font-medium text-[#5D4E46] p-3 rounded-2xl bg-[#FDF8F3] border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all shadow-2xs"
                          placeholder="e.g. Your Well-Wisher / Friend"
                        />
                      </div>
                    </div>

                    {/* Birthday Date Row */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-1.5">
                        Birthday Date (for Countdown & Today celebration):
                      </label>
                      <input
                        type="date"
                        value={draft.birthdayDate || ''}
                        onChange={(e) =>
                          setDraft({ ...draft, birthdayDate: e.target.value })
                        }
                        className="w-full text-sm font-medium text-[#5D4E46] p-3 rounded-2xl bg-[#FDF8F3] border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all shadow-2xs"
                      />
                    </div>

                    {/* Headline Greeting */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-1.5">
                        Main Banner Headline:
                      </label>
                      <input
                        type="text"
                        value={draft.headlineGreeting}
                        onChange={(e) =>
                          setDraft({ ...draft, headlineGreeting: e.target.value })
                        }
                        className="w-full text-sm font-serif text-[#5D4E46] p-3 rounded-2xl bg-[#FDF8F3] border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all shadow-2xs"
                        placeholder="e.g. Happy Birthday, Shweta"
                      />
                    </div>

                    {/* Subtitle Greeting */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-1.5">
                        Banner Subtitle & Blessing Message:
                      </label>
                      <textarea
                        rows={3}
                        value={draft.subtitleGreeting}
                        onChange={(e) =>
                          setDraft({ ...draft, subtitleGreeting: e.target.value })
                        }
                        className="w-full text-xs sm:text-sm font-serif italic text-[#5D4E46] p-3 rounded-2xl bg-[#FDF8F3] border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all shadow-2xs"
                        placeholder="Wishing you boundless joy..."
                      />
                    </div>

                    {/* Footer Quote */}
                    <div>
                      <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-1.5">
                        Footer Closing Quote:
                      </label>
                      <input
                        type="text"
                        value={draft.footerQuote}
                        onChange={(e) =>
                          setDraft({ ...draft, footerQuote: e.target.value })
                        }
                        className="w-full text-xs font-serif italic text-[#5D4E46] p-3 rounded-2xl bg-[#FDF8F3] border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] focus:bg-white transition-all shadow-2xs"
                        placeholder="May every sunrise bring you reasons to smile..."
                      />
                    </div>
                  </div>
                )}

                {/* 2. Theme & Colors Tab */}
                {activeTab === 'theme' && (
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-2">
                        Select Atmosphere Color Palette:
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {THEME_OPTIONS.map((theme) => {
                          const isSelected = draft.colorTheme === theme.id;
                          return (
                            <div
                              key={theme.id}
                              onClick={() => {
                                setDraft({ ...draft, colorTheme: theme.id });
                                sound.playChime(580, 0.2);
                              }}
                              className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-start gap-3 ${
                                isSelected
                                  ? 'border-[#8B5E3C] bg-[#FAF5EF] shadow-md ring-2 ring-[#8B5E3C]/20'
                                  : 'border-[#E8D5C4] bg-white hover:border-[#DCC7B5]'
                              }`}
                            >
                              <div
                                className="w-8 h-8 rounded-full border shadow-xs flex-shrink-0 mt-0.5"
                                style={{ backgroundColor: theme.primaryHex }}
                              />
                              <div className="space-y-0.5 flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-xs font-semibold text-[#5D4E46]">
                                    {theme.name}
                                  </span>
                                  {isSelected && (
                                    <Check className="w-4 h-4 text-[#8B5E3C]" />
                                  )}
                                </div>
                                <p className="text-[11px] text-[#7D6B60] leading-snug">
                                  {theme.desc}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Font Pair Style */}
                    <div className="pt-2">
                      <label className="block text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider mb-2">
                        Typography Style:
                      </label>
                      <div className="grid grid-cols-3 gap-2.5">
                        {[
                          { id: 'serif', label: 'Serif Classic (Cormorant)', sample: 'Elegant & Spiritual' },
                          { id: 'sans', label: 'Modern Sans (Plus Jakarta)', sample: 'Clean & Contemporary' },
                          { id: 'display', label: 'Display Playfair', sample: 'Festive & Royal' },
                        ].map((font) => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => setDraft({ ...draft, fontFamily: font.id as any })}
                            className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                              draft.fontFamily === font.id
                                ? 'bg-[#8B5E3C] text-white border-[#8B5E3C]'
                                : 'bg-[#FAF5EF] border-[#E8D5C4] text-[#5D4E46] hover:bg-white'
                            }`}
                          >
                            <span className="text-xs font-semibold block">{font.label}</span>
                            <span className="text-[10px] opacity-80">{font.sample}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. Animations & Effects Tab */}
                {activeTab === 'effects' && (
                  <div className="space-y-4">
                    {/* Floating Balloons Switch */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF5EF] border border-[#E8D5C4]">
                      <div>
                        <span className="text-xs font-semibold text-[#5D4E46] block">
                          Floating Balloons Background
                        </span>
                        <span className="text-[11px] text-[#7D6B60]">
                          Float cheerful interactive balloons across the screen
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.enableFloatingBalloons}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            enableFloatingBalloons: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#8B5E3C] rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Ambient Blobs Switch */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF5EF] border border-[#E8D5C4]">
                      <div>
                        <span className="text-xs font-semibold text-[#5D4E46] block">
                          Organic Ambient Light Blobs
                        </span>
                        <span className="text-[11px] text-[#7D6B60]">
                          Soft diffused background light glow circles
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.enableAmbientBlobs}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            enableAmbientBlobs: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#8B5E3C] rounded-lg cursor-pointer"
                      />
                    </div>

                    {/* Devotional Aura Switch */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#FAF5EF] border border-[#E8D5C4]">
                      <div>
                        <span className="text-xs font-semibold text-[#5D4E46] block">
                          Sacred Mahadev Glow Aura
                        </span>
                        <span className="text-[11px] text-[#7D6B60]">
                          Luminous spiritual shimmer around prayers & blessings
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={draft.enableDevotionalAura}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            enableDevotionalAura: e.target.checked,
                          })
                        }
                        className="w-5 h-5 accent-[#8B5E3C] rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer / Actions */}
              <div className="p-4 sm:p-5 border-t border-[#F2E8DF] bg-[#FAF5EF] flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleResetDefaults}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs text-[#7D6B60] hover:text-[#8B5E3C] hover:bg-stone-200/50 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Defaults</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 rounded-full border border-[#DCC7B5] bg-white text-xs font-medium text-[#5D4E46] hover:bg-[#FAF5EF] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    id="btn-save-site-customization"
                    onClick={handleApplyChanges}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-semibold shadow-md transition-transform active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Apply & Save Changes</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Save Toast Notification */}
      <AnimatePresence>
        {saveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-6 right-6 z-50 bg-[#8B5E3C] text-white px-5 py-2.5 rounded-full shadow-xl border border-[#A6754E] flex items-center gap-2 text-xs font-medium"
          >
            <Check className="w-4 h-4 text-emerald-300" />
            <span>Customizations applied successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
