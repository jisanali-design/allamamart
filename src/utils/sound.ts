// Web Audio API synthesized sound effects - zero external network dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  playPop() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  playTap() {
    this.playPop();
  }

  playChime() {
    this.playPing();
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);

        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.25);
      });
    } catch {
      // Safe fallback
    }
  }

  playPing() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Safe fallback
    }
  }

  playDoorKnock() {
    if (!this.enabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      [0, 0.14, 0.28].forEach((timeOffset) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160, ctx.currentTime + timeOffset);
        osc.frequency.exponentialRampToValueAtTime(70, ctx.currentTime + timeOffset + 0.06);

        gain.gain.setValueAtTime(0.3, ctx.currentTime + timeOffset);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + timeOffset + 0.06);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + timeOffset);
        osc.stop(ctx.currentTime + timeOffset + 0.07);
      });
    } catch {
      // Safe fallback
    }
  }

  unlockAudio(): boolean {
    try {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }
      return true;
    } catch {
      return false;
    }
  }

  playOrderAlert() {
    if (!this.enabled) return;

    // 1. Play a clear, loud audio alert chime synthesized via Web Audio API
    try {
      const ctx = this.getContext();
      if (ctx) {
        if (ctx.state === 'suspended') {
          ctx.resume().catch(() => {});
        }

        // Distinct 2-stage kitchen / dispatch alert chime (bright triangle / sine waves)
        const chimeNotes = [
          // First ascending chime burst
          { freq: 783.99, time: 0.0, dur: 0.18, vol: 0.55 },   // G5
          { freq: 1046.50, time: 0.12, dur: 0.22, vol: 0.65 }, // C6
          { freq: 1318.51, time: 0.25, dur: 0.35, vol: 0.70 }, // E6
          // Second punchy chime burst for unmissable loudness
          { freq: 880.00, time: 0.55, dur: 0.18, vol: 0.60 },  // A5
          { freq: 1174.66, time: 0.68, dur: 0.22, vol: 0.70 }, // D6
          { freq: 1567.98, time: 0.82, dur: 0.50, vol: 0.80 }, // G6
        ];

        chimeNotes.forEach(({ freq, time, dur, vol }) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle'; // Rich harmonics cutting through ambient hostel noise
          osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

          gain.gain.setValueAtTime(vol, ctx.currentTime + time);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + time + dur);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + time);
          osc.stop(ctx.currentTime + time + dur);
        });
      }
    } catch (e) {
      console.warn('Audio alert playback error:', e);
    }

    // 2. Trigger device vibration if supported: navigator.vibrate([300, 100, 300, 100, 500])
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([300, 100, 300, 100, 500]);
      } catch {
        // Safe fallback for browsers blocking vibration
      }
    }
  }
}

export const soundFx = new SoundManager();
