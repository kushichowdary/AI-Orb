// Create a single AudioContext to be reused.
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
};

// A helper function to create and play a simple sound
const playSound = (
    type: OscillatorType,
    frequency: number,
    duration: number,
    volume: number = 0.5,
    attack: number = 0.01,
    decay: number = 0.1,
    rampTo?: number
) => {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = type;
        oscillator.frequency.setValueAtTime(frequency, now);

        if (rampTo) {
            oscillator.frequency.linearRampToValueAtTime(rampTo, now + duration * 0.8);
        }

        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(volume, now + attack);
        gainNode.gain.linearRampToValueAtTime(0, now + duration - decay);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(now);
        oscillator.stop(now + duration);
    } catch (e) {
        console.error("Error playing sound:", e);
    }
};

/**
 * Plays a futuristic "printing" sound for the digital pass.
 * Combines a low hum with a series of high-frequency ticks.
 */
export const playPrintingSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 2.0;

    // Main humming/printing sound
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(120, now);
    oscillator.frequency.linearRampToValueAtTime(80, now + duration);
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start(now);
    oscillator.stop(now + duration);

    // High-frequency digital "ticks"
    const playTick = (freq: number, time: number) => {
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.type = 'triangle';
      tickOsc.frequency.setValueAtTime(freq, time);
      tickGain.gain.setValueAtTime(0, time);
      tickGain.gain.linearRampToValueAtTime(0.15, time + 0.01);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, time + 0.1);
      tickOsc.connect(tickGain);
      tickGain.connect(ctx.destination);
      tickOsc.start(time);
      tickOsc.stop(time + 0.1);
    };
    
    playTick(1200, now + 0.2);
    playTick(1500, now + 0.5);
    playTick(1300, now + 0.9);
    playTick(1600, now + 1.5);

  } catch (e) {
    console.error("Error playing printing sound:", e);
  }
};

export const playConnectingSound = () => {
    // A soft, ascending sine wave
    playSound('sine', 440, 0.5, 0.2, 0.1, 0.1, 880);
};

export const playConnectedSound = () => {
    // A pleasant two-tone chime
    playSound('sine', 880, 0.2, 0.3);
    setTimeout(() => playSound('sine', 1046.5, 0.3, 0.3), 100);
};

export const playErrorSound = () => {
    // A low, descending sawtooth wave to indicate an issue
    playSound('sawtooth', 330, 0.4, 0.25, 0.01, 0.1, 220);
};

export const playStopSound = () => {
    // A short, decisive click sound
    playSound('triangle', 200, 0.15, 0.3, 0.005, 0.1);
};