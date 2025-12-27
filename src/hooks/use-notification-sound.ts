"use client";

import { useCallback, useRef } from "react";

// This hook generates a simple 'pop' sound using the Web Audio API.
export function useNotificationSound(volume = 0.5) {
  // useRef is used to hold the AudioContext instance across re-renders
  // without re-creating it, which is an expensive operation.
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = useCallback(() => {
    // AudioContext can only run in the browser, not on the server.
    if (typeof window === "undefined") return;

    // Initialize AudioContext on the first play request.
    // This is often required to be initiated by a user gesture, but in this
    // case, we create it lazily when the first data update happens.
    if (!audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      } catch (e) {
        console.error("Web Audio API is not supported in this browser.");
        return;
      }
    }

    const audioContext = audioContextRef.current;
    if (!audioContext) return;

    // An oscillator is used to generate a sound wave of a specific frequency.
    const oscillator = audioContext.createOscillator();
    // A gain node is used to control the volume.
    const gainNode = audioContext.createGain();

    // Connect the oscillator to the gain node, and the gain node to the output.
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Configure the sound to make it a short 'pop'.
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    // Ramp up to the desired volume very quickly.
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    
    // Set the frequency of the pop sound.
    oscillator.frequency.setValueAtTime(220, audioContext.currentTime);

    // Start the sound now.
    oscillator.start(audioContext.currentTime);

    // Ramp the volume down to zero to create a short decay, making the 'pop' effect.
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.08);
    // Stop the sound shortly after it has faded out.
    oscillator.stop(audioContext.currentTime + 0.08);
  }, [volume]);

  return playSound;
}
