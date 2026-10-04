'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  placeholder?: string;
}

interface SpeechRecognitionEvent {
  resultIndex: number;
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionInstance;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function VoiceInput({ onTranscript, placeholder = 'Dictate a motif...' }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  useEffect(() => {
    // Check for native SpeechRecognition support in browser
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Optimized for Indian English accenting

      rec.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      rec.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      rec.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setError('Microphone permission denied.');
        } else {
          setError('Failed to record speech. Please try again.');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Voice recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setError(null);
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error('Failed to start speech recognition:', e);
      }
    }
  };

  return (
    <div className="relative flex items-center w-full">
      <button
        type="button"
        onClick={toggleListening}
        aria-label={isListening ? 'Stop listening' : 'Start voice dictation'}
        className={`flex items-center justify-center p-3.5 rounded-xl border transition-all duration-300 ${
          isListening
            ? 'bg-red-950/60 border-red-800 text-red-400 shadow-[0_0_15px_rgba(220,38,38,0.5)] animate-pulse'
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-yellow-500/40 hover:text-yellow-500 hover:bg-zinc-800/50'
        }`}
      >
        {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {/* Pulsing Visual Waveform */}
      {isListening && (
        <div className="flex items-center gap-1 ml-4 h-5 pointer-events-none select-none">
          <span className="w-1 h-3 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_100ms]" />
          <span className="w-1 h-5 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_200ms]" />
          <span className="w-1 h-2 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_300ms]" />
          <span className="w-1 h-4 bg-red-500 rounded-full animate-[bounce_0.6s_infinite_400ms]" />
          <span className="text-red-400 text-xs font-medium font-mono ml-2">LISTENING...</span>
        </div>
      )}

      {!isListening && !error && (
        <span className="text-xs text-zinc-500 italic ml-4 font-mono select-none pointer-events-none">
          {placeholder}
        </span>
      )}

      {error && (
        <div className="flex items-center gap-1.5 ml-4 text-red-400 text-xs font-mono">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
