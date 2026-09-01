import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { fireReaction } from './FloatingReactionOverlay';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Copy,
  Check,
  Mail,
  MailOpen,
  Volume2,
  VolumeX,
  Edit3,
  Save,
  RotateCcw,
  RefreshCw,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';

interface LetterData {
  title: string;
  recipient: string;
  mainMessage: string;
  hindiMessage: string;
  signoffTitle: string;
  signoffSubtitle: string;
}

const DEFAULT_LETTER: LetterData = {
  title: 'Blessings & Wishes for Shweta',
  recipient: 'Shweta',
  mainMessage: `Mahadev apki saari icha puri kregye, apka mera saath hamesa bane rhe. Apki nature esa hi loving caring rhe. Apki har icha puri ho, ap apne jeevan mai woh sb deserve kro jo ap krna chate ho.`,
  hindiMessage: `महादेव आपकी सारी इच्छा पूरी करेंगे, आपका मेरा साथ हमेशा बना रहे। आपकी नेचर ऐसी ही लविंग-केयरिंग रहे। आपकी हर इच्छा पूरी हो, आप अपने जीवन में वो सब डिज़र्व करो जो आप करना चाहते हो।`,
  signoffTitle: 'With Infinite Love, Care & Prayers',
  signoffSubtitle: 'Forever by your side on this beautiful journey.',
};

export const BlessingLetter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTone, setSelectedTone] = useState<string>('divine');
  const [showTonePicker, setShowTonePicker] = useState(false);
  const [blessingHistory, setBlessingHistory] = useState<LetterData[]>([DEFAULT_LETTER]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const [appreciationCount, setAppreciationCount] = useState(() => {
    try {
      const saved = localStorage.getItem('shweta_letter_appreciations');
      return saved ? parseInt(saved, 10) : 108;
    } catch {
      return 108;
    }
  });

  const handleAppreciateLetter = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = appreciationCount + 1;
    setAppreciationCount(newCount);
    try {
      localStorage.setItem('shweta_letter_appreciations', String(newCount));
    } catch {
      // safe
    }
    fireReaction({
      event: e,
      count: 6,
      type: 'heart',
      label: '💖 Blessing appreciated! Love sent to Shweta',
    });
  };

  const [letterData, setLetterData] = useState<LetterData>(() => {
    try {
      const saved = localStorage.getItem('shweta_birthday_letter_data');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback to default
    }
    return DEFAULT_LETTER;
  });

  const [draftData, setDraftData] = useState<LetterData>(letterData);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shweta_birthday_letter_data', JSON.stringify(letterData));
    } catch {
      // quota limit safe
    }
  }, [letterData]);

  // Handle Gemini AI Blessing Generation
  const handleGetNewBlessing = async (toneOverride?: string, e?: React.MouseEvent) => {
    if (isGenerating) return;
    setIsGenerating(true);
    sound.playChime(660, 0.3);

    const toneToUse = toneOverride || selectedTone;

    try {
      const response = await fetch('/api/blessing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tone: toneToUse,
          currentRecipient: letterData.recipient || 'Shweta',
          customNotes:
            'Focus on Mahadev blessings, genuine warmth, loving-caring nature, lifelong companion bond, and 25 October special birthday celebration.',
        }),
      });

      const data = await response.json();

      if (data && data.blessing) {
        const newBlessing: LetterData = {
          title: data.blessing.title || `Sacred Blessing for ${letterData.recipient}`,
          recipient: letterData.recipient,
          mainMessage: data.blessing.mainMessage,
          hindiMessage: data.blessing.hindiMessage,
          signoffTitle: data.blessing.signoffTitle || 'With Infinite Love & Prayers',
          signoffSubtitle:
            data.blessing.signoffSubtitle || '॥ ॐ नमः शिवाय ॥ Always by your side.',
        };

        setLetterData(newBlessing);
        setDraftData(newBlessing);
        setBlessingHistory((prev) => [...prev, newBlessing]);
        setHistoryIndex((prev) => prev + 1);

        sound.playChime(880, 0.5);
        confetti({
          particleCount: 45,
          spread: 65,
          origin: { y: 0.6 },
          colors: ['#FFB3B3', '#8B5E3C', '#FFDBA4', '#C1E1C1'],
        });

        fireReaction({
          event: e,
          count: 8,
          type: 'sparkle',
          label: '✨ Fresh AI Birthday Blessing Generated for Shweta!',
        });
      }
    } catch (err) {
      console.error('Failed to generate blessing:', err);
      sound.playChime(400, 0.2);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrevBlessing = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      setHistoryIndex(prevIdx);
      setLetterData(blessingHistory[prevIdx]);
      setDraftData(blessingHistory[prevIdx]);
      sound.playChime(550, 0.2);
    }
  };

  const handleNextBlessing = () => {
    if (historyIndex < blessingHistory.length - 1) {
      const nextIdx = historyIndex + 1;
      setHistoryIndex(nextIdx);
      setLetterData(blessingHistory[nextIdx]);
      setDraftData(blessingHistory[nextIdx]);
      sound.playChime(650, 0.2);
    }
  };

  const copyToClipboard = () => {
    const fullText = `${letterData.title}\n\n"${letterData.mainMessage}"\n\n${letterData.hindiMessage}\n\n${letterData.signoffTitle}\n${letterData.signoffSubtitle}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    sound.playChime(660, 0.4);
    setTimeout(() => setCopied(false), 2500);
  };

  const toggleLetter = () => {
    sound.playChime(isOpen ? 440 : 587, 0.5);
    setIsOpen(!isOpen);
    if (!isOpen) {
      confetti({
        particleCount: 35,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#8B5E3C', '#E8D5C4', '#C6DABF', '#FFB3B3'],
      });
    }
  };

  const handleStartEdit = () => {
    setDraftData({ ...letterData });
    setIsEditing(true);
    sound.playChime(600, 0.2);
  };

  const handleSaveEdit = () => {
    setLetterData({ ...draftData });
    setIsEditing(false);
    sound.playChime(700, 0.4);
    confetti({
      particleCount: 30,
      spread: 60,
      colors: ['#8B5E3C', '#FFDBA4', '#FFB3B3'],
    });
  };

  const handleCancelEdit = () => {
    setDraftData({ ...letterData });
    setIsEditing(false);
    sound.playChime(400, 0.2);
  };

  const handleResetToDefault = () => {
    setDraftData(DEFAULT_LETTER);
    setLetterData(DEFAULT_LETTER);
    setIsEditing(false);
    sound.playChime(500, 0.3);
  };

  const toggleSpeechReading = () => {
    if (isSpeaking) {
      sound.stopSpeech();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      sound.playChime(660, 0.2);
      sound.speakText(
        letterData.hindiMessage || letterData.mainMessage,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        'hi-IN'
      );
    }
  };

  const TONE_OPTIONS = [
    { id: 'divine', label: '🕉️ Divine Mahadev Blessing', desc: 'Lord Shiva grace, holy prayers & peace' },
    { id: 'caring', label: '🌸 Loving & Caring Nature', desc: 'Appreciating her sweet, kind & gentle smile' },
    { id: 'dreams', label: '🌟 Success & Dream Wishes', desc: 'Deserving every happiness and big dreams' },
    { id: 'together', label: '🤝 Forever Bond & Companionship', desc: 'Lifelong togetherness and deep respect' },
  ];

  return (
    <div id="blessing-letter-section" className="w-full max-w-3xl mx-auto my-8 relative">
      {/* Decorative Natural Backdrop Circles */}
      <div className="absolute -top-10 -left-10 w-48 h-48 bg-[#E8D5C4]/25 rounded-full filter blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -right-10 w-52 h-52 bg-[#C6DABF]/25 rounded-full filter blur-2xl pointer-events-none" />

      {/* Main Letter Card */}
      <div className="relative bg-white/95 backdrop-blur-md rounded-[36px] shadow-2xl border border-[#F2E8DF] p-6 sm:p-12 overflow-hidden">
        {/* Envelope Top Flap Status Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#F2E8DF] pb-4 mb-6">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-[#FDF8F3] border border-[#E8D5C4] flex items-center justify-center text-[#8B5E3C]">
              {isOpen ? <MailOpen className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#8B5E3C]">
                Heartfelt Blessing Letter
              </span>
              <p className="text-[11px] text-[#6D5D53]">
                Specially penned for {letterData.recipient}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Tone Selector & Get New Blessing Button */}
            <div className="relative">
              <button
                id="btn-get-new-blessing-ai"
                onClick={(e) => handleGetNewBlessing(undefined, e)}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-[#8B5E3C] to-[#A66E43] hover:from-[#704B30] hover:to-[#8B5E3C] text-white text-xs font-semibold shadow-md transition-all active:scale-95 disabled:opacity-70 cursor-pointer"
                title="Use Gemini AI to generate a fresh, unique birthday blessing for Shweta"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Blessing with Gemini AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#FFDBA4]" />
                    <span>Get A New Blessing</span>
                  </>
                )}
              </button>
            </div>

            {/* Quick Tone Menu Toggle */}
            <div className="relative">
              <button
                id="btn-toggle-tone-picker"
                onClick={() => setShowTonePicker(!showTonePicker)}
                className="px-2.5 py-1.5 rounded-full border border-[#DCC7B5] bg-white hover:bg-[#FAF5EF] text-[#8B5E3C] text-xs font-medium transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                title="Select blessing mood / tone"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Theme</span>
              </button>

              {/* Tone dropdown */}
              {showTonePicker && (
                <div className="absolute right-0 top-full mt-2 w-64 p-2 bg-white rounded-2xl shadow-xl border border-[#DCC7B5] z-30 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#8B5E3C] border-b border-[#F2E8DF]">
                    Choose Blessing Theme:
                  </div>
                  {TONE_OPTIONS.map((t) => (
                    <button
                      key={t.id}
                      onClick={(e) => {
                        setSelectedTone(t.id);
                        setShowTonePicker(false);
                        handleGetNewBlessing(t.id, e);
                      }}
                      className={`w-full text-left p-2 rounded-xl text-xs transition-colors flex flex-col ${
                        selectedTone === t.id
                          ? 'bg-[#FAF5EF] text-[#8B5E3C] font-semibold border border-[#E8D5C4]'
                          : 'text-[#6D5D53] hover:bg-stone-50'
                      }`}
                    >
                      <span>{t.label}</span>
                      <span className="text-[10px] text-[#8B5E3C]/70 font-normal">{t.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Letter Text Button */}
            {!isEditing ? (
              <button
                id="btn-edit-letter-text"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#DCC7B5] bg-white hover:bg-[#FDF8F3] text-[#8B5E3C] text-xs font-medium transition-colors shadow-xs cursor-pointer"
                title="Edit letter wording & message"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Edit</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  id="btn-save-letter-text"
                  onClick={handleSaveEdit}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-semibold shadow-sm cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-2.5 py-1.5 rounded-full text-xs text-[#6D5D53] hover:bg-stone-100 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Read Aloud TTS Button */}
            <button
              id="btn-read-aloud-letter"
              onClick={toggleSpeechReading}
              className={`p-2 rounded-full border transition-colors cursor-pointer ${
                isSpeaking
                  ? 'bg-[#8B5E3C] text-white border-[#8B5E3C] animate-pulse'
                  : 'border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3]'
              }`}
              title={isSpeaking ? 'Stop reading' : 'Read blessing letter aloud (Hindi/Indian voice)'}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Fold / Unfold Envelope */}
            <button
              id="btn-toggle-letter-fold"
              onClick={toggleLetter}
              className="px-3.5 py-1.5 rounded-full border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium hover:bg-[#FDF8F3] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {isOpen ? 'Fold' : 'Open'}
            </button>
          </div>
        </div>

        {/* Envelope Body / Letter Sheet */}
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="letter-open"
              initial={{ opacity: 0, scale: 0.98, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: -10 }}
              transition={{ duration: 0.35 }}
              className="relative p-6 sm:p-10 rounded-[28px] bg-[#FDF8F3] border border-[#E8D5C4]/90 shadow-inner flex flex-col items-center text-center space-y-6"
            >
              {/* Sacred Mahadev Blessing Header Seal */}
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center shadow-md border-2 border-white">
                  <Sparkles className="w-6 h-6 text-[#FFDBA4]" />
                </div>
                <span className="text-[11px] uppercase tracking-[0.25em] font-semibold text-[#8B5E3C]">
                  ॥ ॐ नमः शिवाय ॥
                </span>

                {isEditing ? (
                  <div className="w-full max-w-md space-y-2">
                    <label className="text-[11px] font-semibold uppercase text-[#8B5E3C] block">
                      Letter Title:
                    </label>
                    <input
                      type="text"
                      value={draftData.title}
                      onChange={(e) => setDraftData({ ...draftData, title: e.target.value })}
                      className="w-full text-center text-2xl font-serif text-[#5D4E46] bg-white p-2 rounded-xl border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C]"
                    />
                  </div>
                ) : (
                  <h3 className="text-3xl sm:text-4xl font-serif text-[#5D4E46] font-normal tracking-tight">
                    {letterData.title}
                  </h3>
                )}
              </div>

              {/* Decorative divider & Blessing History Navigation */}
              <div className="flex items-center gap-3 w-full max-w-md justify-between">
                <div className="h-px flex-1 bg-[#DCC7B5]" />
                
                {blessingHistory.length > 1 && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/80 rounded-full border border-[#DCC7B5] text-[10px] text-[#8B5E3C]">
                    <button
                      onClick={handlePrevBlessing}
                      disabled={historyIndex === 0}
                      className="p-1 hover:bg-[#F2E8DF] rounded-full disabled:opacity-30 cursor-pointer"
                      title="Previous Blessing"
                    >
                      <ChevronLeft className="w-3 h-3" />
                    </button>
                    <span>
                      {historyIndex + 1} of {blessingHistory.length}
                    </span>
                    <button
                      onClick={handleNextBlessing}
                      disabled={historyIndex === blessingHistory.length - 1}
                      className="p-1 hover:bg-[#F2E8DF] rounded-full disabled:opacity-30 cursor-pointer"
                      title="Next Blessing"
                    >
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <Heart className="w-4 h-4 text-[#8B5E3C] fill-[#FFB3B3]" />
                <div className="h-px flex-1 bg-[#DCC7B5]" />
              </div>

              {/* Core Heartfelt Blessing Text (Editable / Live View) */}
              {isEditing ? (
                <div className="w-full max-w-2xl space-y-4 text-left">
                  <div>
                    <label className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider block mb-1">
                      Main Blessing Message (Roman Hindi / English):
                    </label>
                    <textarea
                      rows={4}
                      value={draftData.mainMessage}
                      onChange={(e) =>
                        setDraftData({ ...draftData, mainMessage: e.target.value })
                      }
                      className="w-full text-base font-serif italic text-[#5D4E46] p-3.5 rounded-2xl bg-white border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] shadow-xs"
                      placeholder="Write your blessing message here..."
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#8B5E3C] uppercase tracking-wider block mb-1">
                      Hindi Devnagari Script Message:
                    </label>
                    <textarea
                      rows={3}
                      value={draftData.hindiMessage}
                      onChange={(e) =>
                        setDraftData({ ...draftData, hindiMessage: e.target.value })
                      }
                      className="w-full text-sm font-serif text-[#5D4E46] p-3 rounded-2xl bg-white border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C] shadow-xs"
                      placeholder="हिंदी संदेश यहाँ लिखें..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[11px] font-semibold text-[#8B5E3C] uppercase block mb-1">
                        Sign-off Line 1:
                      </label>
                      <input
                        type="text"
                        value={draftData.signoffTitle}
                        onChange={(e) =>
                          setDraftData({ ...draftData, signoffTitle: e.target.value })
                        }
                        className="w-full text-xs font-semibold text-[#5D4E46] p-2 rounded-xl bg-white border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#8B5E3C] uppercase block mb-1">
                        Sign-off Line 2:
                      </label>
                      <input
                        type="text"
                        value={draftData.signoffSubtitle}
                        onChange={(e) =>
                          setDraftData({ ...draftData, signoffSubtitle: e.target.value })
                        }
                        className="w-full text-xs font-serif italic text-[#5D4E46] p-2 rounded-xl bg-white border border-[#DCC7B5] focus:outline-none focus:border-[#8B5E3C]"
                      />
                    </div>
                  </div>

                  {/* Reset to Original Default */}
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={handleResetToDefault}
                      className="flex items-center gap-1 text-xs text-[#8B5E3C] hover:underline cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset to Original Default Blessing</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="relative max-w-2xl px-2 sm:px-6 py-2">
                    <span className="absolute -top-4 -left-1 text-5xl text-[#DCC7B5]/60 font-serif select-none">
                      &ldquo;
                    </span>
                    <p className="text-xl sm:text-2xl md:text-[26px] text-[#6D5D53] leading-relaxed font-serif italic text-center selection:bg-[#E8D5C4]">
                      {letterData.mainMessage}
                    </p>
                    <span className="absolute -bottom-8 -right-1 text-5xl text-[#DCC7B5]/60 font-serif select-none">
                      &rdquo;
                    </span>
                  </div>

                  {/* Hindi Script Representation */}
                  {letterData.hindiMessage && (
                    <div className="p-4 rounded-2xl bg-white/70 border border-[#E8D5C4]/70 max-w-xl w-full">
                      <p className="text-sm sm:text-base text-[#7D6B60] leading-relaxed font-serif text-center">
                        {letterData.hindiMessage}
                      </p>
                    </div>
                  )}
                </>
              )}

              {/* Letter Sign-off & Actions */}
              <div className="pt-4 border-t border-[#DCC7B5]/60 w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-left">
                  <p className="text-xs text-[#8B5E3C] font-semibold uppercase tracking-wider">
                    {letterData.signoffTitle}
                  </p>
                  <p className="text-sm text-[#6D5D53] font-serif italic">
                    {letterData.signoffSubtitle}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Floating Heart Appreciation Button */}
                  <button
                    id="btn-appreciate-blessing"
                    onClick={handleAppreciateLetter}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-semibold shadow-md transition-all active:scale-95 cursor-pointer group"
                    title="Send real-time floating heart reaction to this blessing"
                  >
                    <Heart className="w-3.5 h-3.5 fill-[#FFB3B3] text-[#FFB3B3] group-hover:scale-125 transition-transform" />
                    <span>Appreciate Blessing</span>
                    <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
                      {appreciationCount}
                    </span>
                  </button>

                  <button
                    id="btn-copy-letter-text"
                    onClick={copyToClipboard}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#DCC7B5] hover:bg-[#FAF5EF] text-[#8B5E3C] text-xs font-medium shadow-xs transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-green-600" />
                        <span className="text-green-600">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          ) : (
            /* Folded Sealed Envelope Presentation */
            <motion.div
              key="letter-closed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={toggleLetter}
              className="cursor-pointer group p-10 rounded-[28px] bg-gradient-to-br from-[#FAF5EF] to-[#F2E8DF] border-2 border-dashed border-[#DCC7B5] flex flex-col items-center justify-center space-y-4 hover:border-[#8B5E3C] transition-colors"
            >
              <div className="w-16 h-16 rounded-full bg-[#8B5E3C] text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Mail className="w-8 h-8 text-[#FFDBA4]" />
              </div>
              <div className="text-center">
                <h4 className="text-xl font-serif text-[#5D4E46] font-semibold">
                  A Special Sealed Letter for {letterData.recipient}
                </h4>
                <p className="text-xs text-[#8B5E3C] mt-1 font-serif italic">
                  Tap to unseal and read the heartfelt prayers & blessings
                </p>
              </div>
              <span className="px-4 py-1.5 rounded-full bg-white/90 border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium shadow-xs">
                Click to Open Envelope ✨
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
