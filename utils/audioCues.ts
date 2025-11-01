// Create a single AudioContext to be reused.
let audioContext: AudioContext | null = null;
const getAudioContext = (): AudioContext => {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  // Resume the context if it's suspended, which can happen in browsers
  // with strict autoplay policies until a user interaction occurs.
  if (audioContext.state === 'suspended') {
    audioContext.resume();
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
 * Plays a mechanical, old-style paper printer sound.
 * This combines a low motor hum with bursts of filtered white noise to simulate a print head.
 */
export const playPrintingSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 2.8; // Match the animation duration
    const printingDuration = duration - 0.5; // Leave time for final sounds

    // 1. Motor whir for print head movement
    const motorGain = ctx.createGain();
    motorGain.gain.setValueAtTime(0, now);
    motorGain.gain.linearRampToValueAtTime(0.05, now + 0.1); // Fade in
    motorGain.gain.setValueAtTime(0.05, now + printingDuration);
    motorGain.gain.linearRampToValueAtTime(0, now + printingDuration + 0.1); // Fade out
    motorGain.connect(ctx.destination);

    const motorOsc = ctx.createOscillator();
    motorOsc.type = 'sawtooth';
    motorOsc.frequency.setValueAtTime(120, now); // Low frequency hum
    motorOsc.connect(motorGain);
    motorOsc.start(now);
    motorOsc.stop(now + duration);

    // 2. Printing ticks using bursts of filtered noise for a more physical sound
    const ticksPerSecond = 30;
    const numTicks = Math.floor(printingDuration * ticksPerSecond);

    for (let i = 0; i < numTicks; i++) {
      const startTime = now + (i / ticksPerSecond);
      
      const noiseSource = ctx.createBufferSource();
      const bufferSize = Math.floor(ctx.sampleRate * 0.03);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = Math.random() * 2 - 1; // White noise
      }
      noiseSource.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500 + Math.random() * 1000;
      filter.Q.value = 5;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(0.2, startTime + 0.002); // Sharp attack
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03); // Quick decay
      
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noiseSource.start(startTime);
    }
    
    // 3. Keep the sharp "cutter" and "tear" sounds for the end.
    const cutTime = now + duration - 0.2;
    const cutOsc = ctx.createOscillator();
    const cutGain = ctx.createGain();
    cutOsc.type = 'square';
    cutOsc.frequency.setValueAtTime(1800, cutTime);
    cutGain.gain.setValueAtTime(0, cutTime);
    cutGain.gain.linearRampToValueAtTime(0.3, cutTime + 0.01);
    cutGain.gain.exponentialRampToValueAtTime(0.001, cutTime + 0.05);
    cutOsc.connect(cutGain);
    cutGain.connect(ctx.destination);
    cutOsc.start(cutTime);
    cutOsc.stop(cutTime + 0.05);

    const tearTime = now + duration - 0.15;
    const tearNoiseSource = ctx.createBufferSource();
    const tearBufferSize = Math.floor(ctx.sampleRate * 0.1);
    const tearBuffer = ctx.createBuffer(1, tearBufferSize, ctx.sampleRate);
    const tearData = tearBuffer.getChannelData(0);
    for (let i = 0; i < tearBufferSize; i++) {
      tearData[i] = Math.random() * 2 - 1;
    }
    tearNoiseSource.buffer = tearBuffer;

    const tearGain = ctx.createGain();
    tearGain.gain.setValueAtTime(0.2, tearTime);
    tearGain.gain.exponentialRampToValueAtTime(0.001, tearTime + 0.1);
    
    tearNoiseSource.connect(tearGain);
    tearGain.connect(ctx.destination);
    tearNoiseSource.start(tearTime);

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