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
 * Simulates a dot-matrix or thermal printer with a mechanical whir and rapid ticks.
 */
export const playPrintingSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 3.0; // Corresponds with the new, slower print animation

    // 1. Mechanical hum/whirring sound (extended)
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(80, now);
    humOsc.frequency.linearRampToValueAtTime(120, now + duration * 0.5);
    humOsc.frequency.linearRampToValueAtTime(70, now + duration);
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.08, now + 0.1); // fade in
    humGain.gain.linearRampToValueAtTime(0, now + duration - 0.1); // fade out
    humOsc.connect(humGain);
    humGain.connect(ctx.destination);
    humOsc.start(now);
    humOsc.stop(now + duration);

    // 2. A much more rapid series of ticks to sound like a real printer
    const tickCount = 120; // Many more ticks for a continuous 'bzzzt' sound
    const tickDuration = duration - 0.5;
    for (let i = 0; i < tickCount; i++) {
        const time = now + 0.2 + (i / tickCount) * tickDuration;
        playSound('square', 1800 + Math.random() * 600, 0.05, 0.04, 0.002, 0.04);
    }
    
    // 3. Final paper tear-off sound instead of a chime
    const tearTime = now + duration - 0.1;
    const noiseSource = ctx.createBufferSource();
    const bufferSize = Math.floor(ctx.sampleRate * 0.15); // 0.15 seconds of white noise
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1; // Generate white noise
    }
    noiseSource.buffer = buffer;

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25, tearTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, tearTime + 0.15);
    
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(tearTime);

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