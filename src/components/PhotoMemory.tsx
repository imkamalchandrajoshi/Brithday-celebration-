import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { sound } from '../utils/audio';
import { fireReaction } from './FloatingReactionOverlay';
import confetti from 'canvas-confetti';
import { Camera, Image as ImageIcon, Heart, Sparkles, RefreshCw } from 'lucide-react';

export const PhotoMemory: React.FC = () => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'normal' | 'warm' | 'vintage' | 'soft'>('warm');
  const [caption, setCaption] = useState('Happy Birthday Dearest Shweta');
  const [frameLikes, setFrameLikes] = useState(() => {
    try {
      const saved = localStorage.getItem('shweta_frame_likes');
      return saved ? parseInt(saved, 10) : 96;
    } catch {
      return 96;
    }
  });
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFrameLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newCount = frameLikes + 1;
    setFrameLikes(newCount);
    try {
      localStorage.setItem('shweta_frame_likes', String(newCount));
    } catch {
      // safe
    }
    fireReaction({
      event: e,
      count: 6,
      type: 'heart',
      label: '💖 Heartfelt love sent to Shweta\'s portrait!',
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPhotoUrl(url);
      sound.playChime(660, 0.5);
      confetti({
        particleCount: 30,
        spread: 45,
        colors: ['#8B5E3C', '#E8D5C4', '#FFB3B3'],
      });
    }
  };

  const getFilterStyle = () => {
    switch (activeFilter) {
      case 'warm':
        return 'sepia(20%) saturate(115%) brightness(102%) contrast(98%)';
      case 'vintage':
        return 'sepia(40%) contrast(95%) brightness(95%)';
      case 'soft':
        return 'brightness(105%) contrast(92%) saturate(95%)';
      default:
        return 'none';
    }
  };

  return (
    <div
      id="photo-memory-section"
      className="w-full max-w-xl mx-auto my-6 bg-white/95 p-6 sm:p-8 rounded-[36px] shadow-xl border border-[#F2E8DF] relative overflow-hidden"
    >
      {/* Decorative corners */}
      <div className="flex items-center justify-between border-b border-[#F2E8DF] pb-3 mb-5">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-full bg-[#FDF8F3] text-[#8B5E3C]">
            <Camera className="w-4 h-4" />
          </span>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-[#8B5E3C]">
            Birthday Memory Frame
          </h4>
        </div>

        <div className="flex items-center gap-2">
          {photoUrl && (
            <button
              id="btn-remove-polaroid-photo"
              onClick={() => {
                setPhotoUrl(null);
                sound.playChime(400, 0.2);
              }}
              className="px-2.5 py-1 rounded-full bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-medium transition-colors cursor-pointer"
              title="Remove uploaded photo and restore illustration"
            >
              Remove Photo
            </button>
          )}
          <button
            id="btn-upload-photo"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF8F3] hover:bg-[#E8D5C4]/50 border border-[#DCC7B5] text-[#8B5E3C] text-xs font-medium transition-colors cursor-pointer"
          >
            <ImageIcon className="w-3.5 h-3.5" />
            <span>{photoUrl ? 'Change Photo' : 'Upload Shweta\'s Photo'}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* Aesthetic Polaroid / Archival Frame */}
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ rotate: [-0.5, 0.5, 0] }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm bg-[#FAF6F0] p-4 pb-6 rounded-2xl shadow-md border border-[#E8D5C4] relative"
        >
          {/* Top Tape Sticker Motif */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#E8D5C4]/70 rounded-xs shadow-sm rotate-[-2deg] border-dashed border border-white/80" />

          {/* Photo Display Window */}
          <div className="w-full h-72 sm:h-80 rounded-xl overflow-hidden bg-[#F2E8DF] border border-[#E8D5C4]/80 relative flex items-center justify-center">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt="Shweta Birthday Portrait"
                className="w-full h-full object-cover transition-all duration-300"
                style={{ filter: getFilterStyle() }}
              />
            ) : (
              /* Beautiful Natural Tone Birthday Watercolor Silhouette Vector */
              <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center relative overflow-hidden bg-gradient-to-b from-[#FDF8F3] to-[#F2E8DF]">
                {/* Botanical leaves SVG background */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-15 pointer-events-none"
                  viewBox="0 0 200 200"
                  fill="none"
                >
                  <circle cx="100" cy="100" r="80" stroke="#8B5E3C" strokeWidth="1" strokeDasharray="3 3" />
                  <path d="M 100 20 C 130 50 130 150 100 180 C 70 150 70 50 100 20" stroke="#8B5E3C" strokeWidth="1" />
                </svg>

                {/* Aesthetic Birthday Queen Artwork */}
                <div className="relative z-10 flex flex-col items-center space-y-3">
                  <div className="w-24 h-24 rounded-full bg-[#E8D5C4] border-2 border-white shadow-inner flex items-center justify-center relative">
                    <span className="text-4xl">👑</span>
                    <div className="absolute -bottom-1 -right-1 p-1 bg-white rounded-full shadow-xs">
                      <Heart className="w-4 h-4 fill-[#FFB3B3] text-[#FFB3B3]" />
                    </div>
                  </div>

                  <div>
                    <h5 className="font-serif text-xl text-[#5D4E46] font-semibold">
                      Shweta
                    </h5>
                    <p className="text-xs text-[#8B5E3C] font-serif italic mt-0.5">
                      Radiant, Loving & Caring Soul
                    </p>
                  </div>

                  <button
                    id="btn-add-real-picture"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white text-xs font-medium shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Upload Shweta&apos;s Photo</span>
                  </button>
                </div>
              </div>
            )}

            {/* Sparkle badge */}
            <div className="absolute top-2 right-2 px-2 py-1 rounded-full bg-black/40 backdrop-blur-xs text-white text-[10px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#FFDBA4]" />
              <span>Special Day</span>
            </div>
          </div>

          {/* Polaroid Caption Area */}
          <div className="mt-4 px-2 text-center space-y-1.5">
            <input
              id="input-photo-caption"
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full text-center font-serif text-lg text-[#5D4E46] bg-transparent border-b border-transparent hover:border-[#DCC7B5] focus:border-[#8B5E3C] focus:outline-none transition-colors"
            />
            <p className="text-[11px] text-[#8B5E3C] tracking-widest uppercase font-semibold">
              Celebrating A Beautiful Soul ✨
            </p>

            {/* Reaction Pill Button */}
            <div className="pt-2 flex justify-center">
              <button
                id="btn-like-polaroid-frame"
                onClick={handleFrameLike}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-[#FDF8F3] border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] text-xs font-semibold shadow-2xs transition-transform active:scale-90 cursor-pointer"
                title="Send floating heart reactions"
              >
                <Heart className="w-3.5 h-3.5 fill-[#FFB3B3] text-[#FFB3B3] animate-pulse" />
                <span>Appreciate Memory</span>
                <span className="px-1.5 py-0.2 bg-[#FAF5EF] rounded-full text-[10px] text-[#8B5E3C]">
                  {frameLikes}
                </span>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Filter Selection Controls (when photo is uploaded) */}
        {photoUrl && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-xs text-[#6D5D53] flex items-center gap-1">
              <RefreshCw className="w-3 h-3" /> Filter:
            </span>
            {(['normal', 'warm', 'vintage', 'soft'] as const).map((filter) => (
              <button
                key={filter}
                id={`btn-filter-${filter}`}
                onClick={() => {
                  setActiveFilter(filter);
                  sound.playChime(500, 0.2);
                }}
                className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize transition-all ${
                  activeFilter === filter
                    ? 'bg-[#8B5E3C] text-white shadow-xs'
                    : 'bg-[#FDF8F3] border border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#E8D5C4]/40'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
