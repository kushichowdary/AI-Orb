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

/**
 * Plays a cinematic, multi-layered soundscape for the orb calibration sequence.
 * Evokes a high-tech AI system coming online.
 * Returns a function to stop all scheduled and playing sounds.
 */
export const playBootSequenceSound = (): (() => void) => {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 6.0; // Corresponds to TOTAL_DURATION in the component
    const nodes: (AudioNode | { stop: () => void })[] = [];

    const stopAll = () => {
        try {
            nodes.forEach(node => {
                if ('disconnect' in node) {
                    node.disconnect();
                }
                if ('stop' in node && typeof node.stop === 'function') {
                    // This handles Oscillators and BufferSources
                    node.stop();
                }
            });
        } catch (e) {
            // Can ignore errors if sounds have already finished or nodes are disconnected.
        }
    };
    
    const masterStopTimeout = setTimeout(stopAll, duration * 1000);
    nodes.push({ stop: () => clearTimeout(masterStopTimeout) });

    // --- 1. Base ambient hum ---
    const humOsc = ctx.createOscillator();
    const humGain = ctx.createGain();
    humOsc.type = 'sine';
    humOsc.frequency.setValueAtTime(40, now); // Deep sub-bass hum
    humGain.gain.setValueAtTime(0, now);
    humGain.gain.linearRampToValueAtTime(0.08, now + 1.5); // Slow fade in
    humGain.gain.linearRampToValueAtTime(0, now + duration - 0.5); // Fade out at the end
    humOsc.connect(humGain).connect(ctx.destination);
    humOsc.start(now);
    humOsc.stop(now + duration);
    nodes.push(humOsc, humGain);
    
    // --- 2. Core Materialize Sound (at 0s) ---
    const coreOsc = ctx.createOscillator();
    const coreGain = ctx.createGain();
    coreOsc.type = 'sawtooth';
    coreOsc.frequency.setValueAtTime(100, now);
    coreOsc.frequency.exponentialRampToValueAtTime(800, now + 0.8);
    const coreFilter = ctx.createBiquadFilter();
    coreFilter.type = 'lowpass';
    coreFilter.frequency.setValueAtTime(5000, now);
    coreFilter.frequency.linearRampToValueAtTime(1000, now + 0.8);
    coreGain.gain.setValueAtTime(0, now);
    coreGain.gain.linearRampToValueAtTime(0.2, now + 0.1);
    coreGain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    coreOsc.connect(coreFilter).connect(coreGain).connect(ctx.destination);
    coreOsc.start(now);
    coreOsc.stop(now + 1.0);
    nodes.push(coreOsc, coreGain, coreFilter);

    // --- 3. Sonar Ping sounds ---
    const playPing = (time: number) => {
        const pingOsc = ctx.createOscillator();
        const pingGain = ctx.createGain();
        pingOsc.type = 'sine';
        pingOsc.frequency.setValueAtTime(1200, now + time);
        pingOsc.frequency.exponentialRampToValueAtTime(400, now + time + 0.8);
        pingGain.gain.setValueAtTime(0, now + time);
        pingGain.gain.linearRampToValueAtTime(0.15, now + time + 0.05);
        pingGain.gain.exponentialRampToValueAtTime(0.001, now + time + 1.2);
        pingOsc.connect(pingGain).connect(ctx.destination);
        pingOsc.start(now + time);
        pingOsc.stop(now + time + 1.2);
        nodes.push(pingOsc, pingGain);
    };
    playPing(0.2);
    playPing(1.0);
    playPing(1.8);

    // --- 4. Structure Arc drawing sounds (high-frequency sizzle) ---
    const arcNoiseBuffer = ctx.createBuffer(1, ctx.sampleRate * 2.5, ctx.sampleRate);
    const output = arcNoiseBuffer.getChannelData(0);
    for (let i = 0; i < arcNoiseBuffer.length; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    const arcNoise = ctx.createBufferSource();
    arcNoise.buffer = arcNoiseBuffer;
    arcNoise.loop = true;
    const arcFilter = ctx.createBiquadFilter();
    arcFilter.type = 'bandpass';
    arcFilter.frequency.value = 4000;
    arcFilter.Q.value = 15;
    const arcGain = ctx.createGain();
    arcGain.gain.setValueAtTime(0, now + 1.0);
    arcGain.gain.linearRampToValueAtTime(0.05, now + 1.2); // Fade in as arcs start drawing
    arcGain.gain.setValueAtTime(0.05, now + 2.8);
    arcGain.gain.linearRampToValueAtTime(0, now + 3.2);    // Fade out as they finish
    arcNoise.connect(arcFilter).connect(arcGain).connect(ctx.destination);
    arcNoise.start(now + 1.0);
    arcNoise.stop(now + 3.3);
    nodes.push(arcNoise, arcFilter, arcGain);
    
    // --- 5. Data Ticks for each log line ---
    const playDataTick = (time: number) => {
      const tickOsc = ctx.createOscillator();
      const tickGain = ctx.createGain();
      tickOsc.type = 'square';
      tickOsc.frequency.setValueAtTime(2500, now + time);
      tickGain.gain.setValueAtTime(0, now + time);
      tickGain.gain.linearRampToValueAtTime(0.05, now + time + 0.005);
      tickGain.gain.exponentialRampToValueAtTime(0.0001, now + time + 0.1);
      tickOsc.connect(tickGain).connect(ctx.destination);
      tickOsc.start(now + time);
      tickOsc.stop(now + time + 0.1);
      nodes.push(tickOsc, tickGain);
    };

    const lineInterval = 700 / 1000;
    for (let i = 0; i < 6; i++) {
        playDataTick(1.0 + i * lineInterval);
    }

    // --- 6. Final Confirmation Sound ---
    const finalTime = 1.0 + 6 * lineInterval;
    const finalOsc1 = ctx.createOscillator();
    const finalGain1 = ctx.createGain();
    finalOsc1.type = 'sine';
    finalOsc1.frequency.setValueAtTime(1046.50, now + finalTime); // C6
    finalGain1.gain.setValueAtTime(0, now + finalTime);
    finalGain1.gain.linearRampToValueAtTime(0.2, now + finalTime + 0.05);
    finalGain1.gain.exponentialRampToValueAtTime(0.0001, now + finalTime + 1.5);
    finalOsc1.connect(finalGain1).connect(ctx.destination);
    finalOsc1.start(now + finalTime);
    finalOsc1.stop(now + finalTime + 1.5);
    nodes.push(finalOsc1, finalGain1);

    const finalOsc2 = ctx.createOscillator();
    const finalGain2 = ctx.createGain();
    finalOsc2.type = 'sine';
    finalOsc2.frequency.setValueAtTime(1396.91, now + finalTime); // F6
    finalGain2.gain.setValueAtTime(0, now + finalTime);
    finalGain2.gain.linearRampToValueAtTime(0.15, now + finalTime + 0.05);
    finalGain2.gain.exponentialRampToValueAtTime(0.0001, now + finalTime + 1.5);
    finalOsc2.connect(finalGain2).connect(ctx.destination);
    finalOsc2.start(now + finalTime + 0.1); // Slightly offset for a chord effect
    finalOsc2.stop(now + finalTime + 1.6);
    nodes.push(finalOsc2, finalGain2);

    return stopAll;

  } catch (e) {
    console.error("Error playing boot sequence sound:", e);
    return () => {}; // Return no-op on error
  }
};

export const playLoginSound = () => {
    playSound('sine', 523.25, 0.15, 0.3); // C5
    setTimeout(() => playSound('sine', 659.25, 0.15, 0.3), 80); // E5
    setTimeout(() => playSound('sine', 783.99, 0.2, 0.3), 160); // G5
};

export const playConnectingSound = () => {
    playSound('sine', 440, 0.5, 0.2, 0.1, 0.1, 880);
};

export const playConnectedSound = () => {
    playSound('sine', 880, 0.2, 0.3);
    setTimeout(() => playSound('sine', 1046.5, 0.3, 0.3), 100);
};

export const playErrorSound = () => {
    playSound('sawtooth', 330, 0.4, 0.25, 0.01, 0.1, 220);
};

export const playStopSound = () => {
    playSound('triangle', 200, 0.15, 0.3, 0.005, 0.1);
};