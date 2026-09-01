import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import { fireReaction } from './FloatingReactionOverlay';
import confetti from 'canvas-confetti';
import {
  Heart,
  Sparkles,
  Camera,
  Upload,
  Eye,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pause,
  Grid,
  Layers,
  Trash2,
  Edit3,
  Plus,
  Sun,
  Smile,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';

export interface MemoryItem {
  id: string;
  title: string;
  subtitle: string;
  dateTag: string;
  blessingTag: string;
  imageUrl: string | null;
  caption: string;
  likes: number;
  themeColor: string;
  badgeBg: string;
  accentIcon: 'prayer' | 'smile' | 'together' | 'queen';
}

const DEFAULT_MEMORIES: MemoryItem[] = [
  {
    id: 'memory-1',
    title: 'Sacred Ganga Prayers & Mahadev Blessings',
    subtitle: 'Offering holy water with pure faith & devotion',
    dateTag: 'Divine Moments',
    blessingTag: '॥ हर हर महादेव ॥',
    imageUrl: null,
    caption: '“Mahadev apki saari icha puri kregye...” Shweta’s auspicious blessings with pure heart and devotion.',
    likes: 108,
    themeColor: '#FFDBA4',
    badgeBg: '#8B5E3C',
    accentIcon: 'prayer',
  },
  {
    id: 'memory-2',
    title: 'Radiant Grace & Beautiful Nature',
    subtitle: 'Her signature loving & caring gentle smile',
    dateTag: 'Special Memory',
    blessingTag: 'Always Loving & Caring',
    imageUrl: null,
    caption: '“Apki nature hamesha aisi hi loving caring rhe...” Shining bright with grace in every moment.',
    likes: 95,
    themeColor: '#C1E1C1',
    badgeBg: '#6A8E6A',
    accentIcon: 'smile',
  },
  {
    id: 'memory-3',
    title: 'Together Always & Forever',
    subtitle: 'Lifelong companionship, smiles & peaceful bond',
    dateTag: 'Cherished Bond',
    blessingTag: 'Forever by Your Side',
    imageUrl: null,
    caption: '“Apka mera saath hamesha bane rhe...” A precious bond of warmth, fun moments, and endless support.',
    likes: 120,
    themeColor: '#FFB3B3',
    badgeBg: '#A65B5B',
    accentIcon: 'together',
  },
  {
    id: 'memory-4',
    title: 'Dreams, Joy & Deserved Success',
    subtitle: 'Wishing Shweta all the happiness she deserves',
    dateTag: 'Birthday Special',
    blessingTag: 'Deserve Every Dream',
    imageUrl: null,
    caption: '“Ap apne jeevan mai woh sb deserve kro jo ap krna chate ho...” May all your aspirations turn into gold.',
    likes: 88,
    themeColor: '#E8D5C4',
    badgeBg: '#8B5E3C',
    accentIcon: 'queen',
  },
];

export const MemoriesGallery: React.FC = () => {
  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('shweta_birthday_memories');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Ignore fallback
    }
    return DEFAULT_MEMORIES;
  });

  const [activeMemoryIdx, setActiveMemoryIdx] = useState<number | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'polaroid'>('grid');
  const [editingCaptionId, setEditingCaptionId] = useState<string | null>(null);
  const [tempCaption, setTempCaption] = useState('');

  const multiUploadRef = useRef<HTMLInputElement | null>(null);
  const singleUploadRef = useRef<HTMLInputElement | null>(null);
  const targetUploadId = useRef<string | null>(null);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('shweta_birthday_memories', JSON.stringify(memories));
    } catch {
      // storage quota safe
    }
  }, [memories]);

  // Slideshow timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSlideshowPlaying && activeMemoryIdx !== null) {
      timer = setInterval(() => {
        setActiveMemoryIdx((prev) => {
          if (prev === null) return 0;
          return (prev + 1) % memories.length;
        });
        sound.playChime(600, 0.2);
      }, 3500);
    }
    return () => clearInterval(timer);
  }, [isSlideshowPlaying, activeMemoryIdx, memories.length]);

  const handleLike = (id: string, e: React.MouseEvent, type: 'heart' | 'blessing' | 'flower' | 'sparkle' = 'heart') => {
    e.stopPropagation();
    
    // Trigger floating heart reaction popping upwards
    fireReaction({
      event: e,
      count: 5,
      type,
      label: '💖 Sent love to Shweta\'s memory!',
    });

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    confetti({
      particleCount: 18,
      spread: 45,
      origin: {
        x: (rect.left + rect.width / 2) / window.innerWidth,
        y: (rect.top + rect.height / 2) / window.innerHeight,
      },
      colors: ['#FFB3B3', '#8B5E3C', '#FFDBA4', '#FF6B81'],
    });

    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m))
    );
  };

  const handleCommunityReactAll = (e: React.MouseEvent, type: 'heart' | 'blessing' | 'flower' | 'sparkle', label: string) => {
    e.stopPropagation();
    fireReaction({
      event: e,
      count: 8,
      type,
      label,
    });
    // Boost likes across all memories
    setMemories((prev) =>
      prev.map((m) => ({ ...m, likes: m.likes + 1 }))
    );
  };

  const handleSingleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && targetUploadId.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setMemories((prev) =>
          prev.map((m) => (m.id === targetUploadId.current ? { ...m, imageUrl: result } : m))
        );
        sound.playChime(660, 0.4);
        confetti({
          particleCount: 25,
          spread: 50,
          colors: ['#8B5E3C', '#E8D5C4', '#FFB3B3'],
        });
      };
      reader.readAsDataURL(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleMultiUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, index: number) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setMemories((prev) => {
          // If we have an existing slot without picture, fill it first
          const emptySlotIdx = prev.findIndex((m, idx) => !m.imageUrl && idx >= index);
          if (emptySlotIdx !== -1) {
            const updated = [...prev];
            updated[emptySlotIdx] = { ...updated[emptySlotIdx], imageUrl: result };
            return updated;
          }
          // Else create a new memory card
          const newMemory: MemoryItem = {
            id: `memory-${Date.now()}-${Math.random()}`,
            title: `Cherished Memory #${prev.length + 1}`,
            subtitle: 'Beautiful moment of Shweta',
            dateTag: 'Special Moment',
            blessingTag: 'Pure Happiness',
            imageUrl: result,
            caption: 'A precious memory filled with smiles, blessings, and warmth.',
            likes: 45,
            themeColor: ['#FFB3B3', '#FFDBA4', '#C1E1C1', '#E8D5C4'][prev.length % 4],
            badgeBg: '#8B5E3C',
            accentIcon: 'smile',
          };
          return [...prev, newMemory];
        });
      };
      reader.readAsDataURL(file);
    });

    sound.playChime(659, 0.6);
    confetti({
      particleCount: 50,
      spread: 70,
      colors: ['#8B5E3C', '#FFDBA4', '#FFB3B3', '#C1E1C1'],
    });

    if (e.target) e.target.value = '';
  };

  const triggerUploadForSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    targetUploadId.current = id;
    singleUploadRef.current?.click();
  };

  const removePhotoFromSlot = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    sound.playChime(400, 0.2);
    setMemories((prev) =>
      prev.map((m) => (m.id === id ? { ...m, imageUrl: null } : m))
    );
  };

  const deleteMemoryCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    sound.playChime(350, 0.2);
    if (memories.length <= 1) {
      setMemories((prev) => prev.map((m) => (m.id === id ? { ...m, imageUrl: null } : m)));
      return;
    }
    setMemories((prev) => prev.filter((m) => m.id !== id));
    if (activeMemoryIdx !== null && activeMemoryIdx >= memories.length - 1) {
      setActiveMemoryIdx(Math.max(0, memories.length - 2));
    }
  };

  const resetGalleryToDefault = () => {
    sound.playChime(500, 0.3);
    setMemories(DEFAULT_MEMORIES);
    setActiveMemoryIdx(null);
  };

  const addNewCustomMemoryCard = () => {
    sound.playChime(660, 0.3);
    const newCard: MemoryItem = {
      id: `memory-${Date.now()}`,
      title: `Special Moment #${memories.length + 1}`,
      subtitle: 'Memories with Shweta',
      dateTag: `Moment #${memories.length + 1}`,
      blessingTag: 'Divine Grace',
      imageUrl: null,
      caption: 'Add your lovely memory story, wishes, or notes here for Shweta.',
      likes: 20,
      themeColor: ['#FFB3B3', '#FFDBA4', '#C1E1C1', '#E8D5C4'][memories.length % 4],
      badgeBg: '#8B5E3C',
      accentIcon: 'together',
    };
    setMemories((prev) => [...prev, newCard]);
  };

  const openLightbox = (index: number) => {
    sound.playChime(587, 0.3);
    setActiveMemoryIdx(index);
  };

  const closeLightbox = () => {
    setActiveMemoryIdx(null);
    setIsSlideshowPlaying(false);
  };

  const nextLightbox = () => {
    if (activeMemoryIdx === null) return;
    sound.playChime(620, 0.2);
    setActiveMemoryIdx((activeMemoryIdx + 1) % memories.length);
  };

  const prevLightbox = () => {
    if (activeMemoryIdx === null) return;
    sound.playChime(520, 0.2);
    setActiveMemoryIdx((activeMemoryIdx - 1 + memories.length) % memories.length);
  };

  const renderArtworkPlaceholder = (memory: MemoryItem) => {
    switch (memory.accentIcon) {
      case 'prayer':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-[#FFFDF9] via-[#FAF3E8] to-[#F2E8DF] relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#FFDBA4]/60 border border-[#8B5E3C]/30 flex items-center justify-center shadow-xs mb-2">
              <Sun className="w-8 h-8 text-[#8B5E3C]" />
            </div>
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#8B5E3C] font-semibold">
              Ganga Aarti & Prayer
            </span>
            <p className="text-xs text-[#6D5D53] font-serif italic max-w-xs mt-1">
              Standing with holy water offering prayers to Mahadev
            </p>
            <span className="mt-3 text-[10px] px-3 py-1 bg-white/80 rounded-full text-[#8B5E3C] border border-[#E8D5C4] font-medium">
              Click &lsquo;Upload Photo&rsquo; to set Shweta&apos;s picture
            </span>
          </div>
        );
      case 'together':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-[#FFF9F9] via-[#FDF0F0] to-[#F5E6E6] relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#FFB3B3]/50 border border-[#A65B5B]/30 flex items-center justify-center shadow-xs mb-2">
              <span className="text-2xl">✌️</span>
            </div>
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#A65B5B] font-semibold">
              Together Forever & Always
            </span>
            <p className="text-xs text-[#6D5D53] font-serif italic max-w-xs mt-1">
              Cherished selfie memories, peace signs & smiles together
            </p>
            <span className="mt-3 text-[10px] px-3 py-1 bg-white/80 rounded-full text-[#A65B5B] border border-[#E8D5C4] font-medium">
              Click &lsquo;Upload Photo&rsquo; to set Shweta&apos;s picture
            </span>
          </div>
        );
      case 'smile':
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-[#F7FAF7] via-[#EFF6EF] to-[#E3EFE3] relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#C1E1C1]/60 border border-[#6A8E6A]/30 flex items-center justify-center shadow-xs mb-2">
              <Smile className="w-8 h-8 text-[#6A8E6A]" />
            </div>
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#6A8E6A] font-semibold">
              Radiant & Beautiful Grace
            </span>
            <p className="text-xs text-[#6D5D53] font-serif italic max-w-xs mt-1">
              Shweta’s sweet smile in traditional blue attire with greenery
            </p>
            <span className="mt-3 text-[10px] px-3 py-1 bg-white/80 rounded-full text-[#6A8E6A] border border-[#E8D5C4] font-medium">
              Click &lsquo;Upload Photo&rsquo; to set Shweta&apos;s picture
            </span>
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex flex-col items-center justify-center p-5 text-center bg-gradient-to-b from-[#FDF8F3] to-[#F2E8DF] relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-[#E8D5C4]/70 border border-[#8B5E3C]/30 flex items-center justify-center shadow-xs mb-2">
              <Sparkles className="w-8 h-8 text-[#8B5E3C]" />
            </div>
            <span className="text-[11px] font-serif uppercase tracking-widest text-[#8B5E3C] font-semibold">
              Birthday Celebrations
            </span>
            <p className="text-xs text-[#6D5D53] font-serif italic max-w-xs mt-1">
              May every wish and dream of your heart be fulfilled
            </p>
            <span className="mt-3 text-[10px] px-3 py-1 bg-white/80 rounded-full text-[#8B5E3C] border border-[#E8D5C4] font-medium">
              Click &lsquo;Upload Photo&rsquo; to set Shweta&apos;s picture
            </span>
          </div>
        );
    }
  };

  return (
    <div id="memories-gallery-section" className="w-full max-w-5xl mx-auto my-8 relative">
      {/* Hidden file inputs */}
      <input
        ref={singleUploadRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleSingleUpload}
      />
      <input
        ref={multiUploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleMultiUpload}
      />

      {/* Gallery Header Bar */}
      <div className="bg-white/90 backdrop-blur-md rounded-[32px] p-6 sm:p-8 shadow-xl border border-[#F2E8DF] mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#F2E8DF] pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3.5 py-1 rounded-full bg-[#8B5E3C] text-white text-[11px] font-semibold uppercase tracking-widest flex items-center gap-1.5 shadow-xs">
                <Camera className="w-3.5 h-3.5 text-[#FFDBA4]" />
                Photo Memories Album
              </span>
              <span className="text-xs text-[#8B5E3C] font-serif italic">
                {memories.length} Precious Moments
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif text-[#5D4E46] font-normal">
              Shweta&apos;s Cherished Memory Gallery
            </h3>
            <p className="text-xs sm:text-sm text-[#7D6B60] mt-1">
              Browse photo moments, upload new pictures, add heartfelt notes, or view in full-screen slideshow.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Multi-photo upload button */}
            <button
              id="btn-upload-multiple-photos"
              onClick={() => multiUploadRef.current?.click()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-medium shadow-sm transition-all active:scale-95 cursor-pointer"
              title="Add pictures from your device"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Add / Upload Pictures</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-[#FDF8F3] p-1 rounded-full border border-[#E8D5C4]">
              <button
                id="btn-view-grid"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-[#8B5E3C] shadow-xs'
                    : 'text-[#8B5E3C]/60 hover:text-[#8B5E3C]'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                id="btn-view-polaroid"
                onClick={() => setViewMode('polaroid')}
                className={`p-1.5 rounded-full transition-all ${
                  viewMode === 'polaroid'
                    ? 'bg-white text-[#8B5E3C] shadow-xs'
                    : 'text-[#8B5E3C]/60 hover:text-[#8B5E3C]'
                }`}
                title="Polaroid Scrapbook View"
              >
                <Layers className="w-4 h-4" />
              </button>
            </div>

            {/* Slideshow button */}
            <button
              id="btn-start-slideshow"
              onClick={() => {
                openLightbox(0);
                setIsSlideshowPlaying(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#DCC7B5] hover:bg-[#FDF8F3] text-[#8B5E3C] text-xs font-medium shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Slideshow</span>
            </button>
          </div>
        </div>

        {/* Community Floating Reaction Bar & Quote Banner */}
        <div className="mt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#FDF8F3] border border-[#E8D5C4]/70">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-[#8B5E3C] flex items-center gap-1">
              <Heart className="w-3.5 h-3.5 fill-[#FFB3B3] text-[#FFB3B3]" />
              React to Gallery:
            </span>
            <button
              id="btn-community-react-love"
              onClick={(e) =>
                handleCommunityReactAll(e, 'heart', '💖 Infinite Love & Happiness sent to Shweta!')
              }
              className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF5EF] border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium transition-transform active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Click to pop floating hearts across gallery"
            >
              <span>💖 Send Love</span>
            </button>
            <button
              id="btn-community-react-blessing"
              onClick={(e) =>
                handleCommunityReactAll(e, 'blessing', '🕉️ Mahadev Divine Blessings showered!')
              }
              className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF5EF] border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium transition-transform active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
              title="Click to shower Mahadev blessings"
            >
              <span>🕉️ Blessings</span>
            </button>
            <button
              id="btn-community-react-flower"
              onClick={(e) =>
                handleCommunityReactAll(e, 'flower', '🌸 Pure Grace & Loving Nature appreciated!')
              }
              className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF5EF] border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium transition-transform active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>🌸 Grace</span>
            </button>
            <button
              id="btn-community-react-sparkle"
              onClick={(e) =>
                handleCommunityReactAll(e, 'sparkle', '✨ Radiant Smile & Joy celebrated!')
              }
              className="px-3 py-1 rounded-full bg-white hover:bg-[#FAF5EF] border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium transition-transform active:scale-95 flex items-center gap-1 shadow-2xs cursor-pointer"
            >
              <span>✨ Sparkles</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-add-memory-card"
              onClick={addNewCustomMemoryCard}
              className="flex items-center justify-center gap-1 text-xs font-semibold text-[#8B5E3C] hover:underline whitespace-nowrap px-2 py-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add Moment Slot
            </button>

            {memories.length > 4 && (
              <button
                id="btn-reset-default-moments"
                onClick={resetGalleryToDefault}
                className="flex items-center justify-center gap-1 text-[11px] font-medium text-stone-500 hover:text-[#8B5E3C] hover:underline whitespace-nowrap px-1.5 py-1 cursor-pointer"
                title="Reset gallery to default 4 moments"
              >
                <RotateCcw className="w-3 h-3" /> Reset 4 Moments
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Gallery Cards Container */}
      <div
        className={
          viewMode === 'grid'
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6'
            : 'flex flex-wrap justify-center gap-8 py-4'
        }
      >
        {memories.map((memory, index) => {
          const isPolaroid = viewMode === 'polaroid';
          const rotationAngle = isPolaroid ? (index % 2 === 0 ? -1.8 : 1.8) : 0;

          return (
            <motion.div
              key={memory.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, rotate: rotationAngle }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              whileHover={{ y: -4, rotate: 0 }}
              className={`bg-white rounded-[28px] p-5 shadow-lg border border-[#F2E8DF] relative group transition-all flex flex-col justify-between ${
                isPolaroid ? 'w-full max-w-sm pb-8 shadow-xl' : 'w-full'
              }`}
            >
              {/* Top Tape Accent on Polaroid */}
              {isPolaroid && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-5 bg-[#E8D5C4]/80 rounded-xs shadow-xs rotate-[-1deg] border border-white/60 pointer-events-none z-10" />
              )}

              {/* Memory Image Display Area */}
              <div className="relative">
                <div
                  onClick={() => openLightbox(index)}
                  className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden bg-[#F2E8DF] border border-[#E8D5C4]/60 cursor-pointer relative shadow-inner flex items-center justify-center group-hover:shadow-md transition-shadow"
                >
                  {memory.imageUrl ? (
                    <img
                      src={memory.imageUrl}
                      alt={memory.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    renderArtworkPlaceholder(memory)
                  )}

                  {/* Hover Overlay with Lightbox trigger */}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 backdrop-blur-[1px]">
                    <span className="p-3 bg-white/90 rounded-full text-[#8B5E3C] shadow-lg hover:scale-110 transition-transform">
                      <Maximize2 className="w-5 h-5" />
                    </span>
                  </div>

                  {/* Top Blessing Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <span
                      className="px-3 py-1 rounded-full text-white text-[10px] font-semibold tracking-wide uppercase shadow-sm flex items-center gap-1"
                      style={{ backgroundColor: memory.badgeBg }}
                    >
                      <Sparkles className="w-3 h-3 text-[#FFDBA4]" />
                      {memory.blessingTag}
                    </span>
                  </div>

                  {/* Slot Actions Group (Upload & Remove Photo) */}
                  <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                    {memory.imageUrl && (
                      <button
                        id={`btn-remove-slot-pic-${memory.id}`}
                        onClick={(e) => removePhotoFromSlot(memory.id, e)}
                        className="p-2 rounded-full bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer border border-red-200"
                        title="Remove photo from this moment slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      id={`btn-replace-pic-${memory.id}`}
                      onClick={(e) => triggerUploadForSlot(memory.id, e)}
                      className="p-2 rounded-full bg-white/90 hover:bg-white text-[#8B5E3C] text-xs font-medium shadow-md transition-all hover:scale-105 active:scale-95 cursor-pointer"
                      title={memory.imageUrl ? 'Change photo in this slot' : 'Upload photo into this slot'}
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Memory Information & Narrative */}
              <div className="mt-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-lg font-serif text-[#5D4E46] font-semibold leading-tight">
                      {memory.title}
                    </h4>
                    <p className="text-xs text-[#8B5E3C] font-serif italic mt-0.5">
                      {memory.subtitle}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Delete entire moment slot button (for added moments 5, 6, 7, 8, 9 or custom) */}
                    {memories.length > 1 && (
                      <button
                        id={`btn-delete-card-${memory.id}`}
                        onClick={(e) => deleteMemoryCard(memory.id, e)}
                        className="p-1.5 rounded-full hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete this entire moment card from website"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {/* Heart like button */}
                    <button
                      id={`btn-like-memory-${memory.id}`}
                      onClick={(e) => handleLike(memory.id, e)}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FDF8F3] border border-[#E8D5C4] hover:border-[#8B5E3C] text-xs font-medium text-[#8B5E3C] transition-all active:scale-90 cursor-pointer"
                      title="Send love to this memory"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#FFB3B3] text-[#FFB3B3]" />
                      <span>{memory.likes}</span>
                    </button>
                  </div>
                </div>

                {/* Caption / Blessing Message with in-line editing */}
                {editingCaptionId === memory.id ? (
                  <div className="space-y-2 pt-1">
                    <textarea
                      value={tempCaption}
                      onChange={(e) => setTempCaption(e.target.value)}
                      rows={2}
                      className="w-full text-xs p-2 rounded-xl bg-[#FDF8F3] border border-[#DCC7B5] text-[#5D4E46] focus:outline-none focus:border-[#8B5E3C]"
                      placeholder="Write your heartfelt memory note..."
                    />

                    {/* Quick Caption Suggestions as per Image */}
                    <div className="space-y-1 bg-white p-2 rounded-xl border border-[#E8D5C4]">
                      <span className="text-[10px] font-bold text-[#8B5E3C] uppercase tracking-wider block">
                        ✨ Quick Captions as per Image:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setTempCaption(
                              '“Hi, mai badiya hu, tum kaise ho? Aaj tumhara din kaisa ja raha hai?”'
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-[#FAF5EF] text-[10px] text-[#8B5E3C] hover:bg-[#F2E8DF]"
                        >
                          💬 &ldquo;Hi, mai badiya hu...&rdquo;
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTempCaption(
                              '“Mahadev apki saari icha puri kregye, apka mera saath hamesha bane rhe!”'
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-[#FAF5EF] text-[10px] text-[#8B5E3C] hover:bg-[#F2E8DF]"
                        >
                          🕉️ Mahadev Blessings
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTempCaption(
                              '“Apki nature hamesha aisi hi loving caring rhe, aap jeevan me sab deserve karo!”'
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-[#FAF5EF] text-[10px] text-[#8B5E3C] hover:bg-[#F2E8DF]"
                        >
                          🌸 Loving & Caring Smile
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setTempCaption(
                              '“25 October Special: Wishing you endless joy, peace and divine blessings today & always!”'
                            )
                          }
                          className="px-2 py-0.5 rounded-md bg-[#FAF5EF] text-[10px] text-[#8B5E3C] hover:bg-[#F2E8DF]"
                        >
                          🎂 25 Oct Birthday
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => setEditingCaptionId(null)}
                        className="px-2.5 py-1 rounded-full text-[11px] text-[#6D5D53] hover:bg-stone-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          setMemories((prev) =>
                            prev.map((m) =>
                              m.id === memory.id ? { ...m, caption: tempCaption } : m
                            )
                          );
                          setEditingCaptionId(null);
                          sound.playChime(660, 0.3);
                        }}
                        className="px-3 py-1 rounded-full text-[11px] bg-[#8B5E3C] text-white font-medium shadow-xs"
                      >
                        Save Note
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="group/caption relative p-2.5 rounded-xl bg-[#FAF5EF] border border-[#E8D5C4]/60 text-xs text-[#6D5D53] font-serif italic leading-relaxed">
                    <span>{memory.caption}</span>
                    <button
                      onClick={() => {
                        setEditingCaptionId(memory.id);
                        setTempCaption(memory.caption);
                      }}
                      className="opacity-0 group-hover/caption:opacity-100 absolute top-1.5 right-1.5 p-1 rounded-full bg-white text-[#8B5E3C] shadow-xs transition-opacity"
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Bottom Card Controls */}
                <div className="pt-2 border-t border-[#F2E8DF] flex items-center justify-between text-[11px] text-[#8B5E3C]">
                  <span className="font-sans font-medium">{memory.dateTag}</span>

                  <div className="flex items-center gap-2">
                    {memory.imageUrl && (
                      <button
                        onClick={(e) => removePhotoFromSlot(memory.id, e)}
                        className="p-1 text-stone-400 hover:text-red-500 transition-colors"
                        title="Remove photo and reset slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => openLightbox(index)}
                      className="flex items-center gap-1 font-semibold hover:underline cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Full View</span>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Full-Screen High-Resolution Lightbox Modal */}
      <AnimatePresence>
        {activeMemoryIdx !== null && memories[activeMemoryIdx] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
          >
            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl bg-white rounded-[32px] overflow-hidden shadow-2xl border border-[#DCC7B5] flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Close Button */}
              <button
                id="btn-close-lightbox"
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/40 hover:bg-black/60 text-white transition-colors cursor-pointer shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Photo View Area */}
              <div className="relative w-full md:w-3/5 bg-[#1F1916] flex items-center justify-center min-h-[320px] md:min-h-[480px] overflow-hidden">
                {memories[activeMemoryIdx].imageUrl ? (
                  <img
                    src={memories[activeMemoryIdx].imageUrl!}
                    alt={memories[activeMemoryIdx].title}
                    className="w-full h-full object-contain max-h-[75vh]"
                  />
                ) : (
                  <div className="p-8 w-full h-full flex items-center justify-center">
                    {renderArtworkPlaceholder(memories[activeMemoryIdx])}
                  </div>
                )}

                {/* Left/Right Navigation Arrows */}
                <button
                  id="btn-lightbox-prev"
                  onClick={prevLightbox}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all hover:scale-110 cursor-pointer shadow-md"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  id="btn-lightbox-next"
                  onClick={nextLightbox}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all hover:scale-110 cursor-pointer shadow-md"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Counter Pill */}
                <div className="absolute bottom-3 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
                  {activeMemoryIdx + 1} / {memories.length}
                </div>
              </div>

              {/* Narrative & Blessing Panel */}
              <div className="w-full md:w-2/5 p-6 sm:p-8 bg-[#FDF8F3] flex flex-col justify-between overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="px-3.5 py-1 rounded-full text-white text-xs font-semibold uppercase tracking-wider"
                      style={{ backgroundColor: memories[activeMemoryIdx].badgeBg }}
                    >
                      {memories[activeMemoryIdx].blessingTag}
                    </span>
                    <button
                      onClick={(e) => handleLike(memories[activeMemoryIdx].id, e)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E8D5C4] text-[#8B5E3C] text-xs font-semibold shadow-xs hover:border-[#8B5E3C]"
                    >
                      <Heart className="w-4 h-4 fill-[#FFB3B3] text-[#FFB3B3]" />
                      <span>{memories[activeMemoryIdx].likes} Loves</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-2xl font-serif text-[#5D4E46] font-semibold leading-snug">
                      {memories[activeMemoryIdx].title}
                    </h3>
                    <p className="text-xs text-[#8B5E3C] font-serif italic mt-1">
                      {memories[activeMemoryIdx].subtitle}
                    </p>
                  </div>

                  {/* Sacred Mahadev Connection */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E8D5C4] shadow-xs space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#8B5E3C]">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Divine Blessing Message</span>
                    </div>
                    <p className="text-sm text-[#6D5D53] font-serif italic leading-relaxed">
                      &ldquo;Mahadev apki saari icha puri kregye, apka mera saath hamesa bane rhe. Apki nature esa hi loving caring rhe. Apki har icha puri ho, ap apne jeevan mai woh sb deserve kro jo ap krna chate ho.&rdquo;
                    </p>
                  </div>

                  {/* Custom Memory Note */}
                  <div className="p-3.5 rounded-xl bg-[#FAF5EF] border border-[#E8D5C4]/70 text-xs text-[#7D6B60] font-serif">
                    <p className="font-semibold text-[#8B5E3C] text-[11px] uppercase tracking-wider mb-1">
                      Memory Note:
                    </p>
                    <p className="italic">{memories[activeMemoryIdx].caption}</p>
                  </div>
                </div>

                {/* Lightbox Footer Actions */}
                <div className="pt-6 border-t border-[#E8D5C4] flex flex-wrap items-center justify-between gap-2.5 mt-6">
                  <div className="flex items-center gap-2">
                    {/* Upload into this slot button */}
                    <button
                      id="btn-lightbox-upload-slot"
                      onClick={(e) => triggerUploadForSlot(memories[activeMemoryIdx].id, e)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#8B5E3C] text-white hover:bg-[#704B30] text-xs font-medium shadow-sm transition-all cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{memories[activeMemoryIdx].imageUrl ? 'Change Photo' : 'Upload Photo'}</span>
                    </button>

                    {/* Remove photo from slot in lightbox */}
                    {memories[activeMemoryIdx].imageUrl && (
                      <button
                        id="btn-lightbox-remove-photo"
                        onClick={(e) => removePhotoFromSlot(memories[activeMemoryIdx].id, e)}
                        className="flex items-center gap-1 px-3 py-2 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium transition-colors cursor-pointer"
                        title="Remove photo from this slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove Photo</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Delete moment card from lightbox */}
                    {memories.length > 1 && (
                      <button
                        id="btn-lightbox-delete-moment"
                        onClick={(e) => {
                          const currId = memories[activeMemoryIdx].id;
                          deleteMemoryCard(currId, e);
                        }}
                        className="flex items-center gap-1 px-2.5 py-2 rounded-full text-stone-500 hover:text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                        title="Delete this moment card slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Slot</span>
                      </button>
                    )}

                    {/* Slideshow play/pause */}
                    <button
                      id="btn-lightbox-autoplay"
                      onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                      className="flex items-center gap-1 px-3 py-2 rounded-full bg-white border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium hover:bg-[#FAF5EF] cursor-pointer"
                    >
                      {isSlideshowPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Pause</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" />
                          <span>Auto Play</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
