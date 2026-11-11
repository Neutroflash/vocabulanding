// Browser-only sound helpers: short generated tones and text-to-speech.
// Every call is triggered by a tap or key press, which is what browsers require to play audio.

let audioContext: AudioContext | null = null;

function tone(frequency: number, startAt: number, duration: number, type: OscillatorType = "sine") {
  if (typeof window === "undefined" || !("AudioContext" in window)) return;
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

/** Reads English text aloud with the browser's built-in voice. Does nothing if unsupported. */
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  synth.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel();
}
