
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
 * Combines a low hum with a series of high-frequency ticks and a final chime.
 */
export const playPrintingSound = () => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 2.2;

    // 1. Mechanical hum/whirring sound
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'sawtooth';
    humOsc.frequency.setValueAtTime(80, now);
    humOsc.frequency.linearRampToValueAtTime(120, now + duration * 0.5);
    humOsc.frequency.linearRampToValueAtTime(60, now + duration);
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.08, now + 0.1); // fade in
    humGain.gain.linearRampToValueAtTime(0, now + duration - 0.1); // fade out
    humOsc.connect(humGain);
    humGain.connect(ctx.destination);
    humOsc.start(now);
    humOsc.stop(now + duration);

    // 2. Series of rapid printing ticks
    for (let i = 0; i < 18; i++) {
        const time = now + 0.2 + i * 0.1;
        playSound('square', 1500 + Math.random() * 500, 0.05, 0.05, 0.005, 0.04);
    }
    
    // 3. Final confirmation chime
    const delayInMs = (duration - 0.3) * 1000;
    setTimeout(() => {
        playSound('sine', 1046.5, 0.3, 0.2, 0.01, 0.2);
        setTimeout(() => playSound('sine', 1396.9, 0.3, 0.2, 0.01, 0.2), 80);
    }, delayInMs);


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
