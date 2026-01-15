
// Simple Web Audio API Synthesizer
// No external files required

let audioCtx: AudioContext | null = null;

const getCtx = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
};

// Helper to play a specific note at a specific time
const playTone = (freq: number, type: OscillatorType, startTime: number, duration: number, vol = 0.1) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration - 0.05);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
};

export const soundService = {
  playTick: () => {
    // Short high click for wheel
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    osc.type = 'square';
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  },

  playDing: () => {
    // Pleasant bell/chime
    const ctx = getCtx();
    playTone(880, 'sine', ctx.currentTime, 1.5, 0.3); // A5
    playTone(1760, 'sine', ctx.currentTime, 1.0, 0.1); // Harmonic
  },

  playBuzzer: () => {
    // Low error buzz (Short)
    const ctx = getCtx();
    playTone(150, 'sawtooth', ctx.currentTime, 0.4, 0.2);
    playTone(145, 'sawtooth', ctx.currentTime + 0.05, 0.4, 0.2); // Dissonance
  },
  
  playLoseTurn: () => {
    // A distinct "oh no" falling glissando (Power Down), faster than the sad trombone
    const ctx = getCtx();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'triangle';
    // Start at G3, slide down to low G1 quickly
    osc.frequency.setValueAtTime(196, now); 
    osc.frequency.exponentialRampToValueAtTime(49, now + 0.6);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.6);
  },

  playReveal: () => {
    // "Thwip" / Board turn sound
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    // Slide tone up
    osc.frequency.setValueAtTime(200, ctx.currentTime);
    osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.1);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  },

  playWin: () => {
    // Grand Fanfare: "Charge!" style / Major Arpeggio
    const ctx = getCtx();
    const now = ctx.currentTime;
    const type = 'square'; // Brassy sound
    const vol = 0.15;

    // Rapid triplet pickup
    playTone(523.25, type, now + 0.0, 0.15, vol); // C5
    playTone(659.25, type, now + 0.15, 0.15, vol); // E5
    playTone(783.99, type, now + 0.30, 0.15, vol); // G5
    
    // Big Finish Chord
    const finish = now + 0.45;
    playTone(1046.50, type, finish, 1.5, vol); // C6
    playTone(1318.51, type, finish, 1.5, vol); // E6
    playTone(1567.98, 'sawtooth', finish, 1.5, 0.1); // G6 (texture)
    
    // Bass note
    playTone(261.63, 'triangle', finish, 1.5, 0.3); // C4
  },
  
  playLose: () => {
    // "Sad Trombone" - Chromatic descent
    const ctx = getCtx();
    const now = ctx.currentTime;
    const type = 'sawtooth'; // Reedy sound
    const vol = 0.2;

    // Wah... Wah... Wah... Waaaaaaah
    // C#4 -> C4 -> B3 -> Bb3 (slide down)
    
    // Note 1
    playTone(277.18, type, now + 0.0, 0.4, vol); // C#4
    
    // Note 2
    playTone(261.63, type, now + 0.4, 0.4, vol); // C4
    
    // Note 3
    playTone(246.94, type, now + 0.8, 0.4, vol); // B3
    
    // Note 4 (Long slide)
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const start = now + 1.2;
    
    osc.type = type;
    osc.frequency.setValueAtTime(233.08, start); // Bb3
    osc.frequency.linearRampToValueAtTime(150, start + 1.5); // Slide down low
    
    gain.gain.setValueAtTime(vol, start);
    gain.gain.linearRampToValueAtTime(0, start + 1.5);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + 1.5);
  },
  
  playCash: () => {
      // Cash register chaotic sound (used for small transactions like buying vowel)
      const ctx = getCtx();
      playTone(2000, 'sine', ctx.currentTime, 0.1, 0.1);
      playTone(3000, 'square', ctx.currentTime + 0.05, 0.1, 0.1);
      playTone(4000, 'sine', ctx.currentTime + 0.1, 0.2, 0.1);
  },

  playChaChing: () => {
    // Classic Cash Register "Cha-Ching"
    const ctx = getCtx();
    const now = ctx.currentTime;
    
    // High metallic ping (The "Ding")
    playTone(2000, 'sine', now, 0.15, 0.1);
    playTone(4000, 'sine', now, 0.15, 0.1);
    
    // Second ping slightly later
    playTone(2200, 'sine', now + 0.1, 0.15, 0.1);
    playTone(4400, 'sine', now + 0.1, 0.15, 0.1);

    // Mechanical Drawer Slide (The "Cha")
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    // Fast frequency sweep up then down to simulate mechanical noise
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(300, now + 0.1);
    osc.frequency.linearRampToValueAtTime(50, now + 0.25);
    
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.25);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  },

  playFirework: () => {
    // Explosion sound (Filtered Noise)
    const ctx = getCtx();
    const now = ctx.currentTime;
    
    // Create noise buffer
    const bufferSize = ctx.sampleRate * 1.0; // 1 second
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    // Filter to make it a dull thud/boom rather than white noise
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(10, now + 0.5);
    
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    
    noise.start(now);
    noise.stop(now + 0.5);
    
    // Add a little "crackle" high pitch
    playTone(1200, 'square', now + 0.1, 0.1, 0.05);
    playTone(800, 'square', now + 0.2, 0.1, 0.05);
  },
  
  init: () => {
      // User gesture needed to unlock AudioContext
      getCtx().resume();
  }
};
