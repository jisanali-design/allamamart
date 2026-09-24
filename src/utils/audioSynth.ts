// Web Audio API romantic ambient sound engine
let audioCtx: AudioContext | null = null;
let bgMusicInterval: number | null = null;
let isPlayingMusic = false;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Gentle celesta/music box bell note
export function playBellNote(freq: number, duration = 1.2, volume = 0.15) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch {
    // Audio contexts might be blocked until user gesture
  }
}

// Romantic Heart Pop sound
export function playHeartChime() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const ctx = getAudioContext();
    notes.forEach((note, i) => {
      setTimeout(() => {
        playBellNote(note, 0.8, 0.12);
      }, i * 60);
    });
  } catch {
    // ignored
  }
}

// Gift Box Opening Fanfare
export function playGiftBoxSound() {
  try {
    const melody = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51];
    melody.forEach((f, i) => {
      setTimeout(() => {
        playBellNote(f, 1.4, 0.18);
      }, i * 110);
    });
  } catch {
    // ignored
  }
}

// Ambient romantic lullaby loop
const LULLABY_NOTES = [
  523.25, 659.25, 783.99, 659.25, // C E G E
  587.33, 698.46, 880.00, 698.46, // D F A F
  659.25, 783.99, 987.77, 783.99, // E G B G
  523.25, 783.99, 1046.50, 783.99 // C G C G
];

export function toggleRomanticMusic(onStateChange?: (isPlaying: boolean) => void): boolean {
  if (isPlayingMusic) {
    stopRomanticMusic();
    onStateChange?.(false);
    return false;
  } else {
    startRomanticMusic();
    onStateChange?.(true);
    return true;
  }
}

export function startRomanticMusic() {
  if (isPlayingMusic) return;
  isPlayingMusic = true;
  let noteIndex = 0;

  try {
    getAudioContext();
  } catch {
    // ignored
  }

  bgMusicInterval = window.setInterval(() => {
    const freq = LULLABY_NOTES[noteIndex % LULLABY_NOTES.length];
    playBellNote(freq, 1.6, 0.08);
    // Subtle bass harmony every 4 beats
    if (noteIndex % 4 === 0) {
      playBellNote(freq / 2, 2.5, 0.05);
    }
    noteIndex++;
  }, 480);
}

export function stopRomanticMusic() {
  if (bgMusicInterval) {
    clearInterval(bgMusicInterval);
    bgMusicInterval = null;
  }
  isPlayingMusic = false;
}

export function isMusicActive(): boolean {
  return isPlayingMusic;
}
