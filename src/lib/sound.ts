// Browser-only sound helpers: short generated tones and text-to-speech.
// Every call is triggered by a tap or key press, which is what browsers require to play audio.

const MUTE_KEY = "vocabulanding:muted";
const listeners = new Set<() => void>();

/** Whether the student turned sound off. Remembered on this device. */
export function isMuted() {
  try {
    return typeof window !== "undefined" && window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(muted: boolean) {
  try {
    if (muted) window.localStorage.setItem(MUTE_KEY, "1");
    else window.localStorage.removeItem(MUTE_KEY);
  } catch {
    // Storage can be blocked (private mode); the toggle then lasts only until the page reloads.
  }
  if (muted) stopSpeaking();
  listeners.forEach((listener) => listener());
}

/** For React's useSyncExternalStore. */
export function subscribeMuted(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let audioContext: AudioContext | null = null;

function tone(frequency: number, startAt: number, duration: number, type: OscillatorType = "sine") {
  if (typeof window === "undefined" || !("AudioContext" in window) || isMuted()) return;
  audioContext ??= new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();

  const start = audioContext.currentTime + startAt;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = type;
  oscillator.frequency.value = frequency;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.2, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start(start);
  oscillator.stop(start + duration + 0.02);
}

export function playCorrect() {
  tone(660, 0, 0.12);
  tone(880, 0.1, 0.2);
}

export function playWrong() {
  tone(220, 0, 0.18, "square");
  tone(165, 0.14, 0.28, "square");
}

export function playWin() {
  [523, 659, 784, 1047].forEach((frequency, i) => tone(frequency, i * 0.12, 0.25));
}

export function playLose() {
  [392, 330, 262].forEach((frequency, i) => tone(frequency, i * 0.18, 0.3, "triangle"));
}

/** Picks an English voice when the device has one; otherwise the browser chooses from `lang`. */
function englishVoice(synth: SpeechSynthesis) {
  const voices = synth.getVoices().filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return (
    voices.find((voice) => voice.lang.toLowerCase().replace("_", "-") === "en-us" && voice.localService) ??
    voices.find((voice) => voice.lang.toLowerCase().replace("_", "-") === "en-us") ??
    voices[0]
  );
}

/**
 * Reads English text aloud with the browser's built-in voice. Does nothing if unsupported.
 * Automatic readings respect the mute switch; pass `force` when the student pressed "Listen".
 */
export function speak(text: string, options: { force?: boolean } = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  if (isMuted() && !options.force) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  const voice = englishVoice(synth);
  if (voice) utterance.voice = voice;
  utterance.lang = voice?.lang ?? "en-US";
  utterance.rate = 0.9;
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
