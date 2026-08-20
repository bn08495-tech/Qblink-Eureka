/**
 * Web Audio Chime & Web Speech API Announcer for Public Queue Display
 * 
 * Synthesizes an ambient airport chime (C5 -> G5 -> C6) followed by
 * natural speech synthesis with idempotency guards to prevent duplicate voice calls.
 */

let lastSpokenToken: string | null = null;
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioCtxClass) return null;
  if (!audioCtx) {
    audioCtx = new AudioCtxClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Plays a high-fidelity 3-tone airport chime (C5 -> G5 -> C6)
 */
export function playAirportChime(): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) {
        resolve();
        return;
      }

      const now = ctx.currentTime;
      const notes = [
        { freq: 523.25, time: now, duration: 0.25 },        // C5
        { freq: 659.25, time: now + 0.18, duration: 0.25 }, // E5
        { freq: 783.99, time: now + 0.36, duration: 0.45 }, // G5
        { freq: 1046.50, time: now + 0.54, duration: 0.6 }, // C6
      ];

      notes.forEach(({ freq, time, duration }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.001, time);
        gain.gain.exponentialRampToValueAtTime(0.18, time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(time);
        osc.stop(time + duration);
      });

      setTimeout(resolve, 800);
    } catch {
      resolve();
    }
  });
}

export interface AnnounceTokenOptions {
  tokenNumber: number | string | null;
  queueName?: string;
  counterLabel?: string | null;
  queueType?: string;
  enabled?: boolean;
}

export function announceTokenChange({
  tokenNumber,
  queueName,
  counterLabel,
  queueType = "standard",
  enabled = false,
}: AnnounceTokenOptions): void {
  if (
    !enabled ||
    !tokenNumber ||
    typeof window === "undefined" ||
    !("speechSynthesis" in window) ||
    typeof SpeechSynthesisUtterance === "undefined"
  ) {
    return;
  }

  const tokenKey = `${tokenNumber}-${counterLabel || "default"}`;
  if (lastSpokenToken === tokenKey) {
    return; // Already announced this token
  }

  lastSpokenToken = tokenKey;

  // Play airport chime in parallel
  playAirportChime().catch(() => {});

  try {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel(); // Cancel any ongoing speech

    let phrase = `Attention please: Token number ${tokenNumber}.`;
    if (queueType === "restaurant") {
      phrase = `Attention please: Token number ${tokenNumber}, your table is ready. ${
        counterLabel ? `Please proceed to ${counterLabel}.` : "Please proceed to the host desk."
      }`;
    } else if (counterLabel) {
      phrase = `Attention please: Token number ${tokenNumber}, please proceed to ${counterLabel}.`;
    } else {
      phrase = `Now serving: Token number ${tokenNumber}.`;
    }

    const utterance = new SpeechSynthesisUtterance(phrase);
    utterance.rate = 0.92; // Measured, broadcast cadence
    utterance.pitch = 1.05;
    utterance.lang = "en-US";

    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn("Speech synthesis announcement skipped:", error);
  }
}

export function resetSpokenTokenHistory(): void {
  lastSpokenToken = null;
}
