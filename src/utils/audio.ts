// Web Audio API synthesizer for natural chimes, celebratory sounds, and sacred Mahadev mantras

class SoundEffects {
  private ctx: AudioContext | null = null;
  private droneOscs: OscillatorNode[] = [];
  private droneGains: GainNode[] = [];
  private droneMasterGain: GainNode | null = null;
  public isDronePlaying = false;

  private getContext() {
    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play gentle bell/chime note
  playChime(freq = 528, duration = 1.2, volume = 0.15) {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(volume, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Ignore audio failure if user hasn't interacted
    }
  }

  // Play resonant Temple Bell with rich metallic harmonics
  playTempleBell(baseFreq = 216, duration = 3.5) {
    try {
      const ctx = this.getContext();
      // Metallic harmonic overtone series for authentic temple bell sound
      const harmonics = [
        { mult: 1, gain: 0.25 },
        { mult: 2.02, gain: 0.15 },
        { mult: 3.01, gain: 0.1 },
        { mult: 4.15, gain: 0.06 },
        { mult: 5.43, gain: 0.03 },
      ];

      harmonics.forEach(({ mult, gain: harmonicGain }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = mult === 1 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(baseFreq * mult, ctx.currentTime);

        gain.gain.setValueAtTime(harmonicGain, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration / (mult * 0.5 + 0.5));

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + duration);
      });
    } catch {
      // Ignore audio failure
    }
  }

  // Play Damru twin rhythm sound
  playDamru() {
    try {
      const ctx = this.getContext();
      [0, 0.08, 0.22, 0.30].forEach((delay, idx) => {
        setTimeout(() => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          const freq = idx % 2 === 0 ? 190 : 240;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.08);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.08);
        }, delay * 1000);
      });
    } catch {
      // Audio fail silent
    }
  }

  // Play Sacred Shankh (Conch Shell) acoustic sweep
  playShankh() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(650, ctx.currentTime + 1.2);
      filter.frequency.linearRampToValueAtTime(380, ctx.currentTime + 2.5);

      osc.frequency.setValueAtTime(146.83, ctx.currentTime); // D3
      osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 1.2); // A3
      osc.frequency.linearRampToValueAtTime(146.83, ctx.currentTime + 2.5);

      gain.gain.setValueAtTime(0.001, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.5);
      gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 2.5);
    } catch {
      // Audio fail silent
    }
  }

  // Sacred Om / Tanpura Drone (Sustained Meditative Harmonic)
  startOmDrone(volume = 0.12) {
    if (this.isDronePlaying) return;
    try {
      const ctx = this.getContext();
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 2);
      master.connect(ctx.destination);
      this.droneMasterGain = master;

      // C#3 Om Root (136.1 Hz - Cosmic Om / Earth frequency)
      const frequencies = [68.05, 136.1, 204.15, 272.2];
      this.droneOscs = [];
      this.droneGains = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = idx === 0 ? 'sine' : idx === 1 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);

        // Gentle undulating LFO effect
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.2 + idx * 0.1, ctx.currentTime);
        lfoGain.gain.setValueAtTime(0.02, ctx.currentTime);
        lfo.connect(lfoGain);

        g.gain.setValueAtTime(0.08 / (idx + 1), ctx.currentTime);
        lfoGain.connect(g.gain);

        osc.connect(g);
        g.connect(master);

        osc.start();
        lfo.start();
        this.droneOscs.push(osc, lfo);
        this.droneGains.push(g, lfoGain);
      });

      this.isDronePlaying = true;
    } catch {
      // Audio fail silent
    }
  }

  stopOmDrone() {
    if (!this.isDronePlaying || !this.ctx || !this.droneMasterGain) return;
    try {
      const ctx = this.ctx;
      this.droneMasterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 1.5);
      setTimeout(() => {
        this.droneOscs.forEach((o) => {
          try {
            o.stop();
            o.disconnect();
          } catch {
            // ignore
          }
        });
        this.droneOscs = [];
        this.droneGains = [];
        this.droneMasterGain = null;
        this.isDronePlaying = false;
      }, 1600);
    } catch {
      this.isDronePlaying = false;
    }
  }

  // Play candle blow wind sound
  playBlowWind() {
    try {
      const ctx = this.getContext();
      const bufferSize = ctx.sampleRate * 0.8;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.8);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start();
      whiteNoise.stop(ctx.currentTime + 0.8);
    } catch {
      // Audio fail silent
    }
  }

  // Play balloon pop sound
  playPop() {
    try {
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {
      // Audio fail silent
    }
  }

  // Play a sequence of rapid balloon pops for a massive blast
  playMassiveBalloonBlast(count = 6) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playPop();
        if (i % 2 === 0) {
          this.playChime(520 + i * 40, 0.25, 0.12);
        }
      }, i * 140);
    }
  }

  // Play Happy Birthday melodic phrase
  playBirthdayTune() {
    try {
      const ctx = this.getContext();
      const notes = [
        { f: 392, d: 0.35, pause: 0.4 },
        { f: 392, d: 0.25, pause: 0.3 },
        { f: 440, d: 0.5, pause: 0.55 },
        { f: 392, d: 0.5, pause: 0.55 },
        { f: 523.25, d: 0.6, pause: 0.65 },
        { f: 493.88, d: 0.9, pause: 1.0 },

        { f: 392, d: 0.35, pause: 0.4 },
        { f: 392, d: 0.25, pause: 0.3 },
        { f: 440, d: 0.5, pause: 0.55 },
        { f: 392, d: 0.5, pause: 0.55 },
        { f: 587.33, d: 0.6, pause: 0.65 },
        { f: 523.25, d: 1.1, pause: 1.2 },
      ];

      let delay = 0;
      notes.forEach(({ f, d, pause }) => {
        setTimeout(() => {
          this.playChime(f, d, 0.2);
        }, delay * 1000);
        delay += pause;
      });
    } catch {
      // Audio fail silent
    }
  }

  // Text-To-Speech reader for blessings and wishes
  speakText(
    text: string,
    onStart?: () => void,
    onEnd?: () => void,
    lang = 'hi-IN'
  ): SpeechSynthesisUtterance | null {
    if (!('speechSynthesis' in window)) return null;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.92;
    utterance.pitch = 1.05;

    // Pick suitable voice if available
    const voices = window.speechSynthesis.getVoices();
    const hindiVoice =
      voices.find((v) => v.lang.startsWith('hi')) ||
      voices.find((v) => v.lang.startsWith('en-IN')) ||
      voices.find((v) => v.name.includes('India')) ||
      voices[0];

    if (hindiVoice) {
      utterance.voice = hindiVoice;
    }

    if (onStart) utterance.onstart = onStart;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }

    window.speechSynthesis.speak(utterance);
    return utterance;
  }

  stopSpeech() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export const sound = new SoundEffects();

