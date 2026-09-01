import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  Pause,
  Mic,
  Square,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Headphones,
  Music,
  Radio,
  FileAudio,
  Check,
  Heart,
  Trash2,
} from 'lucide-react';

interface VoiceNoteAudioProps {
  onPlayStateChange?: (isPlaying: boolean) => void;
}

export const VoiceNoteAudio: React.FC<VoiceNoteAudioProps> = ({ onPlayStateChange }) => {
  // Voice note state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(6);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);

  // Custom audio file / recorded audio
  const [audioUrl, setAudioUrl] = useState<string | null>(() => {
    try {
      return localStorage.getItem('shweta_birthday_audio_url') || null;
    } catch {
      return null;
    }
  });

  const [activeVoiceNoteTitle, setActiveVoiceNoteTitle] = useState(
    'Birthday Voice Greeting for Shweta'
  );
  const [activeVoiceNoteText, setActiveVoiceNoteText] = useState(() => {
    try {
      const saved = localStorage.getItem('shweta_voice_note_text');
      if (saved) return saved;
    } catch {
      // safe
    }
    return '“Hi, mai badiya hu, tum kaise ho? Aaj tumhara din kaisa ja raha hai?”';
  });

  const [isEditingText, setIsEditingText] = useState(false);
  const [tempVoiceText, setTempVoiceText] = useState(activeVoiceNoteText);

  const saveCustomVoiceText = (text: string) => {
    setActiveVoiceNoteText(text);
    setTempVoiceText(text);
    setIsEditingText(false);
    try {
      localStorage.setItem('shweta_voice_note_text', text);
    } catch {
      // safe
    }
    sound.playChime(660, 0.3);
  };

  const removeVoiceText = () => {
    const defaultFallback = '“Happy Birthday Shweta! Mahadev bless you always!”';
    saveCustomVoiceText(defaultFallback);
  };

  const restoreUserPromptGreeting = () => {
    saveCustomVoiceText('“Hi, mai badiya hu, tum kaise ho? Aaj tumhara din kaisa ja raha hai?”');
  };

  // Live recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<NodeJS.Timeout | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileUploadRef = useRef<HTMLInputElement | null>(null);
  const synthTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Synthetic demo speech player if no uploaded file
  const isSyntheticPlayingRef = useRef(false);

  // Sync to localStorage
  useEffect(() => {
    if (audioUrl) {
      try {
        localStorage.setItem('shweta_birthday_audio_url', audioUrl);
      } catch {
        // quota limit fallback
      }
    }
  }, [audioUrl]);

  // Handle actual audio element time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    onPlayStateChange?.(false);
  };

  const togglePlayPause = () => {
    sound.playChime(660, 0.2);

    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        onPlayStateChange?.(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
            onPlayStateChange?.(true);
          })
          .catch(() => {
            // Fallback to speech
            playSpeechFallback();
          });
      }
    } else {
      // Speech / Web Audio fallback
      if (isPlaying) {
        sound.stopSpeech();
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);
        setIsPlaying(false);
        onPlayStateChange?.(false);
      } else {
        playSpeechFallback();
      }
    }
  };

  const playSpeechFallback = () => {
    setIsPlaying(true);
    onPlayStateChange?.(true);
    setCurrentTime(0);
    setDuration(6);

    const startTime = Date.now();
    if (synthTimerRef.current) clearInterval(synthTimerRef.current);

    synthTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      if (elapsed >= 6) {
        clearInterval(synthTimerRef.current!);
        setIsPlaying(false);
        setCurrentTime(0);
        onPlayStateChange?.(false);
      } else {
        setCurrentTime(elapsed);
      }
    }, 100);

    // Speak Hindi voice note
    sound.speakText(
      activeVoiceNoteText.replace(/["“”]/g, ''),
      () => {
        setIsPlaying(true);
      },
      () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (synthTimerRef.current) clearInterval(synthTimerRef.current);
        onPlayStateChange?.(false);
      },
      'hi-IN'
    );
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current && audioUrl) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    sound.playChime(550, 0.15);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setAudioUrl(result);
        setActiveVoiceNoteTitle(file.name.replace(/\.[^/.]+$/, ''));
        setIsPlaying(false);
        sound.playChime(660, 0.4);
        confetti({
          particleCount: 25,
          spread: 50,
          colors: ['#8B5E3C', '#FFDBA4', '#FFB3B3'],
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Start recording from mic
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result as string;
          setAudioUrl(base64data);
          setActiveVoiceNoteTitle('My Recorded Voice Note for Shweta');
          sound.playChime(700, 0.4);
          confetti({
            particleCount: 30,
            spread: 60,
            colors: ['#8B5E3C', '#E8D5C4', '#FFB3B3'],
          });
        };
        reader.readAsDataURL(audioBlob);

        // Stop all tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordDuration(0);
      sound.playChime(587, 0.2);

      recordTimerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);
    } catch {
      alert('Microphone permission is required to record a voice note.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordTimerRef.current) clearInterval(recordTimerRef.current);
      sound.playChime(440, 0.2);
    }
  };

  const clearAudio = () => {
    sound.stopSpeech();
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setAudioUrl(null);
    setIsPlaying(false);
    setCurrentTime(0);
    localStorage.removeItem('shweta_birthday_audio_url');
    setActiveVoiceNoteTitle('Birthday Voice Greeting for Shweta');
    sound.playChime(350, 0.2);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Generate waveform bars heights
  const waveformBars = [
    30, 45, 75, 90, 60, 40, 80, 100, 65, 35, 55, 85, 95, 70, 45, 60, 80, 95, 50, 30,
    65, 85, 40, 70, 90, 60, 45, 80, 95, 70, 50, 35, 60, 85, 100, 75, 45, 30,
  ];

  return (
    <div
      id="voice-note-audio-section"
      className="w-full max-w-2xl mx-auto my-8 bg-white/95 backdrop-blur-md rounded-[36px] shadow-xl border border-[#F2E8DF] p-6 sm:p-8 relative overflow-hidden"
    >
      {/* Decorative Aura */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-[#FFDBA4]/20 rounded-full filter blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-44 h-44 bg-[#FFB3B3]/20 rounded-full filter blur-3xl pointer-events-none" />

      {/* Hidden file input */}
      <input
        ref={fileUploadRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Audio Element */}
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onTimeUpdate={handleTimeUpdate}
          onEnded={handleAudioEnded}
          onError={() => {
            // fallback
          }}
        />
      )}

      {/* Section Header */}
      <div className="flex items-center justify-between border-b border-[#F2E8DF] pb-4 mb-5">
        <div className="flex items-center gap-2.5">
          <span className="w-9 h-9 rounded-full bg-[#FDF8F3] border border-[#E8D5C4] flex items-center justify-center text-[#8B5E3C] shadow-xs">
            <Headphones className="w-4 h-4" />
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-widest text-[#8B5E3C]">
                Voice Note & Audio Wish
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#FFDBA4]/50 text-[#8B5E3C] text-[10px] font-medium">
                {audioUrl ? 'Custom Audio' : 'Greeting Audio'}
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-[#5D4E46] font-normal">
              Shweta&apos;s Voice Message
            </h3>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Upload audio button */}
          <button
            id="btn-upload-audio"
            onClick={() => fileUploadRef.current?.click()}
            className="p-2 rounded-full border border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3] transition-colors cursor-pointer"
            title="Upload audio/voice file (.mp3, .m4a, .wav)"
          >
            <Upload className="w-4 h-4" />
          </button>

          {/* Record button */}
          {isRecording ? (
            <button
              id="btn-stop-record-voice"
              onClick={stopRecording}
              className="px-3.5 py-1.5 rounded-full bg-red-600 text-white text-xs font-semibold flex items-center gap-1.5 animate-pulse shadow-md cursor-pointer"
            >
              <Square className="w-3.5 h-3.5 fill-white" />
              <span>Stop ({recordDuration}s)</span>
            </button>
          ) : (
            <button
              id="btn-start-record-voice"
              onClick={startRecording}
              className="p-2 rounded-full border border-[#DCC7B5] text-[#8B5E3C] hover:bg-[#FDF8F3] transition-colors cursor-pointer"
              title="Record live voice greeting from your microphone"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}

          {audioUrl && (
            <button
              id="btn-clear-audio"
              onClick={clearAudio}
              className="p-2 rounded-full border border-[#DCC7B5] text-stone-400 hover:text-red-500 hover:bg-[#FDF8F3] transition-colors cursor-pointer"
              title="Reset to default voice note"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Voice Note Player Card */}
      <div className="p-5 sm:p-6 rounded-[28px] bg-[#FDF8F3] border border-[#E8D5C4] shadow-inner space-y-4">
        {/* Title & Spoken Text Transcript */}
        <div className="space-y-2 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h4 className="text-sm font-serif font-semibold text-[#5D4E46]">
              {activeVoiceNoteTitle}
            </h4>
            <span className="text-[11px] text-[#8B5E3C] font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Transcript / Hindi Voice Note Line */}
          {isEditingText ? (
            <div className="space-y-2 p-3 bg-white rounded-2xl border border-[#DCC7B5]">
              <label className="text-xs font-semibold text-[#8B5E3C] block">
                Edit Voice Greeting Text:
              </label>
              <textarea
                value={tempVoiceText}
                onChange={(e) => setTempVoiceText(e.target.value)}
                rows={2}
                className="w-full text-xs p-2 bg-[#FDF8F3] border border-[#E8D5C4] rounded-xl text-[#5D4E46] focus:outline-none focus:border-[#8B5E3C]"
              />
              <div className="flex items-center justify-end gap-2 text-xs">
                <button
                  onClick={() => setIsEditingText(false)}
                  className="px-3 py-1 text-[#7D6B60] hover:underline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => saveCustomVoiceText(tempVoiceText)}
                  className="px-3 py-1 bg-[#8B5E3C] text-white rounded-lg font-medium"
                >
                  Save Text
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-white/80 border border-[#E8D5C4]/70 text-xs sm:text-sm text-[#6D5D53] font-serif italic text-center leading-relaxed relative group/vtext">
              <span>{activeVoiceNoteText}</span>
              <button
                onClick={() => {
                  setTempVoiceText(activeVoiceNoteText);
                  setIsEditingText(true);
                }}
                className="opacity-0 group-hover/vtext:opacity-100 absolute top-2 right-2 p-1 bg-white rounded-full text-[#8B5E3C] shadow-xs transition-opacity text-[10px] flex items-center gap-1 px-2 border border-[#E8D5C4]"
              >
                <span>Edit</span>
              </button>
            </div>
          )}

          {/* Quick Add / Remove Greeting Options */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
            <span className="text-[#8B5E3C] font-semibold">Quick Greeting:</span>
            <button
              onClick={restoreUserPromptGreeting}
              className="px-2.5 py-0.5 rounded-full bg-white border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] transition-colors"
              title="Add 'Hi, mai badiya hu, tum kaise ho? Aaj tumhara din kaisa ja raha hai?'"
            >
              ✨ “Hi, mai badiya hu...”
            </button>
            <button
              onClick={() =>
                saveCustomVoiceText(
                  '“Mahadev apki saari icha puri kregye, apka mera saath hamesa bane rhe!”'
                )
              }
              className="px-2.5 py-0.5 rounded-full bg-white border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] transition-colors"
            >
              🕉️ Mahadev Blessing
            </button>
            <button
              onClick={() =>
                saveCustomVoiceText(
                  '“Apki nature hamesha aisi hi loving caring rhe, aap jeevan me sab deserve karo!”'
                )
              }
              className="px-2.5 py-0.5 rounded-full bg-white border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] transition-colors"
            >
              💖 Loving & Caring
            </button>
            <button
              onClick={removeVoiceText}
              className="px-2 py-0.5 rounded-full bg-[#FAF5EF] text-stone-500 hover:text-red-500 transition-colors"
              title="Remove or reset custom text"
            >
              ✕ Reset
            </button>
          </div>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="relative py-2 flex items-center justify-between gap-1 h-14 bg-white/60 rounded-2xl px-4 border border-[#E8D5C4]/50 overflow-hidden">
          {waveformBars.map((heightPercent, idx) => {
            const barProgress = (idx / waveformBars.length) * duration;
            const isPassed = currentTime >= barProgress;
            const dynamicScale = isPlaying ? (idx % 3 === 0 ? 1.2 : idx % 2 === 0 ? 0.8 : 1) : 1;

            return (
              <motion.div
                key={idx}
                animate={
                  isPlaying
                    ? {
                        height: `${Math.min(100, heightPercent * (0.5 + Math.random() * 0.6))}%`,
                      }
                    : { height: `${heightPercent * 0.7}%` }
                }
                transition={{ duration: 0.2 }}
                className={`w-1 rounded-full transition-colors ${
                  isPassed ? 'bg-[#8B5E3C]' : 'bg-[#DCC7B5]/60'
                }`}
                style={{ minHeight: '4px' }}
              />
            );
          })}
        </div>

        {/* Progress Bar / Scrubber */}
        <div className="space-y-1">
          <input
            id="audio-seek-slider"
            type="range"
            min={0}
            max={duration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-[#8B5E3C] h-1.5 bg-[#E8D5C4] rounded-lg cursor-pointer"
          />
        </div>

        {/* Playback Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Main Play / Pause Button */}
          <div className="flex items-center gap-3">
            <button
              id="btn-play-pause-voice"
              onClick={togglePlayPause}
              className="w-12 h-12 rounded-full bg-[#8B5E3C] hover:bg-[#704B30] text-white flex items-center justify-center shadow-md transition-transform active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause voice message' : 'Play voice message'}
            >
              {isPlaying ? (
                <Pause className="w-5 h-5 fill-white" />
              ) : (
                <Play className="w-5 h-5 fill-white translate-x-0.5" />
              )}
            </button>

            <div>
              <p className="text-xs font-semibold text-[#5D4E46]">
                {isPlaying ? 'Playing Voice Wish...' : 'Tap to Listen'}
              </p>
              <p className="text-[10px] text-[#8B5E3C]">
                {audioUrl ? 'Custom recorded audio' : 'Clear Hindi voice greeting'}
              </p>
            </div>
          </div>

          {/* Speed & Volume Controls */}
          <div className="flex items-center gap-2">
            {/* Speed Pills */}
            <div className="flex items-center bg-white rounded-full border border-[#E8D5C4] p-0.5">
              {[1, 1.25, 1.5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => handleRateChange(speed)}
                  className={`px-2 py-0.5 text-[10px] font-semibold rounded-full transition-all ${
                    playbackRate === speed
                      ? 'bg-[#8B5E3C] text-white'
                      : 'text-[#8B5E3C] hover:bg-[#FAF5EF]'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>

            {/* Quick Record CTA if no custom audio */}
            {!audioUrl && !isRecording && (
              <button
                onClick={startRecording}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#DCC7B5] hover:border-[#8B5E3C] text-[#8B5E3C] text-xs font-medium shadow-xs transition-colors cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5 text-red-500" />
                <span>Record Voice</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-[#7D6B60]">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#8B5E3C]" />
          Record or upload personal birthday voice notes for Shweta
        </span>
        <button
          onClick={() => {
            setActiveVoiceNoteText(
              '“Mahadev apki saari icha puri kregye, apka mera saath hamesa bane rhe!”'
            );
            sound.playChime(600, 0.2);
          }}
          className="text-[#8B5E3C] hover:underline font-medium"
        >
          Use Blessing Quote
        </button>
      </div>
    </div>
  );
};
