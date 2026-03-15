"use client";

/** Speak a drill command using Web Speech API */
export function speakCommand(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      resolve();
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.8; // deeper voice for drill sergeant
    utterance.volume = 1;

    // Try to find a British English male voice
    const voices = window.speechSynthesis.getVoices();
    const britishMale = voices.find(
      (v) =>
        v.lang.startsWith("en-GB") &&
        (v.name.toLowerCase().includes("male") ||
          v.name.toLowerCase().includes("daniel") ||
          v.name.toLowerCase().includes("james"))
    );
    const british = voices.find((v) => v.lang.startsWith("en-GB"));
    const english = voices.find((v) => v.lang.startsWith("en"));

    utterance.voice = britishMale || british || english || null;

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

/** Initialize voices (needed on some browsers) */
export function initSpeech(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Force voice list load
  window.speechSynthesis.getVoices();

  // Some browsers need the voiceschanged event
  window.speechSynthesis.addEventListener("voiceschanged", () => {
    window.speechSynthesis.getVoices();
  });
}
