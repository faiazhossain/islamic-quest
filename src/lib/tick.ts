let ctx: AudioContext | null = null;

/**
 * Soft synthesized tick for optional counter sound. Created lazily and
 * reused; failures are silent by design - sound is an enhancement.
 */
export function playTick(): void {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  } catch {
    // Audio unavailable; silence is acceptable.
  }
}
