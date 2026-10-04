'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Message, PhysicsParams } from '@/models/types';
import { Send, Sparkles, Sliders, MessageSquare, Loader2 } from 'lucide-react';
import VoiceInput from './VoiceInput';

interface ChatPanelProps {
  messages: Message[];
  physics: PhysicsParams;
  onSendMessage: (text: string) => Promise<void>;
  onUpdatePhysics: (params: Partial<PhysicsParams>) => void;
  isLoading: boolean;
}

export default function ChatPanel({
  messages,
  physics,
  onSendMessage,
  onUpdatePhysics,
  isLoading,
}: ChatPanelProps) {
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const handleVoiceTranscript = (text: string) => {
    if (isLoading) return;
    onSendMessage(text);
  };

  return (
    <div className="flex flex-col h-full bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden glass-panel">
      {/* Header Tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-2.5 justify-between items-center">
        <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm tracking-wider font-mono">
          <MessageSquare className="w-4 h-4" />
          <span>CONVERSATIONAL MOTION DEPT.</span>
        </div>
        <div className="text-[10px] bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded font-mono font-semibold">
          Omni Flash Preview
        </div>
      </div>

      {/* Main Panel Content (Split Chat + Visual Controllers) */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto p-4 gap-4">
        {/* Chat History View */}
        <div className="flex-1 flex flex-col gap-3 min-h-[180px] overflow-y-auto max-h-[300px] border-b border-zinc-900 pb-4 pr-1">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex flex-col max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'self-end bg-yellow-500 text-zinc-950 font-medium rounded-tr-none'
                  : 'self-start bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-none font-sans'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center gap-1 text-[9px] font-bold text-yellow-600 font-mono mb-1 select-none">
                  <Sparkles className="w-3 h-3" />
                  <span>GEMINI PHYSICS ENGINE</span>
                </div>
              )}
              <span>{msg.content}</span>
            </div>
          ))}
          {isLoading && (
            <div className="self-start flex items-center gap-2 bg-zinc-900/40 border border-zinc-800/40 rounded-xl p-3 rounded-tl-none text-xs text-zinc-500">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-500" />
              <span>Analyzing fabric drape physics...</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Manual Sliders Interface */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 font-mono tracking-wider mb-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>REAL-TIME PHYSICS CONTROLS</span>
          </div>

          {/* Mannequin Drape Style selector */}
          <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-lg">
            <span className="text-[11px] font-mono text-zinc-400">Virtual Mannequin Drape Style:</span>
            <div className="grid grid-cols-2 gap-2 mt-0.5">
              {(['sari', 'kurta', 'dupatta', 'lungi'] as const).map((style) => (
                <button
                  key={style}
                  type="button"
                  onClick={() => onUpdatePhysics({ drapeStyle: style })}
                  className={`text-[10px] py-1.5 px-2 rounded-lg border font-mono font-bold capitalize transition-all duration-200 ${
                    physics.drapeStyle === style
                      ? 'bg-yellow-500 text-zinc-950 border-yellow-500 shadow-sm'
                      : 'bg-zinc-850 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-200'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          {/* Wind Speed Slider */}
          <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-lg">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Wind Velocity:</span>
              <span className="text-zinc-200 font-semibold">{physics.windSpeed.toFixed(1)} m/s</span>
            </div>
            <input
              type="range"
              min="0"
              max="15"
              step="0.5"
              value={physics.windSpeed}
              onChange={(e) => onUpdatePhysics({ windSpeed: parseFloat(e.target.value) })}
              className="w-full accent-yellow-500 cursor-ew-resize bg-zinc-800 h-1 rounded-lg appearance-none"
            />
          </div>

          {/* Wind Direction Slider */}
          <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-lg">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Wind Direction:</span>
              <span className="text-zinc-200 font-semibold">{physics.windDirection}°</span>
            </div>
            <input
              type="range"
              min="-180"
              max="180"
              step="5"
              value={physics.windDirection}
              onChange={(e) => onUpdatePhysics({ windDirection: parseInt(e.target.value) })}
              className="w-full accent-yellow-500 cursor-ew-resize bg-zinc-800 h-1 rounded-lg appearance-none"
            />
          </div>

          {/* Gravity Slider */}
          <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-lg">
            <div className="flex justify-between text-[11px] font-mono">
              <span className="text-zinc-400">Fabric Weight (Gravity):</span>
              <span className="text-zinc-200 font-semibold">{(physics.gravity / 9.8).toFixed(2)}G ({physics.gravity.toFixed(1)} m/s²)</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="20.0"
              step="0.5"
              value={physics.gravity}
              onChange={(e) => onUpdatePhysics({ gravity: parseFloat(e.target.value) })}
              className="w-full accent-yellow-500 cursor-ew-resize bg-zinc-800 h-1 rounded-lg appearance-none"
            />
          </div>

          {/* Double slider layout: Zari Shine and Transparency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-lg">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-400">Zari Gold Shine:</span>
                <span className="text-zinc-200 font-semibold">{(physics.material.shininess * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.0"
                step="0.05"
                value={physics.material.shininess}
                onChange={(e) =>
                  onUpdatePhysics({
                    material: { ...physics.material, shininess: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-yellow-500 cursor-ew-resize bg-zinc-800 h-1 rounded-lg appearance-none"
              />
            </div>

            <div className="flex flex-col gap-1.5 bg-zinc-900/50 border border-zinc-900 p-2.5 rounded-lg">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-zinc-400">Transparency:</span>
                <span className="text-zinc-200 font-semibold">{(physics.material.transparency * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="0.9"
                step="0.05"
                value={physics.material.transparency}
                onChange={(e) =>
                  onUpdatePhysics({
                    material: { ...physics.material, transparency: parseFloat(e.target.value) },
                  })
                }
                className="w-full accent-yellow-500 cursor-ew-resize bg-zinc-800 h-1 rounded-lg appearance-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Input Action Panel */}
      <div className="border-t border-zinc-800 bg-zinc-900/30 p-3 flex flex-col gap-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder='Type command (e.g. "add monsoon wind from left")'
            className="flex-1 px-3 py-2 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-yellow-500 placeholder-zinc-500 font-sans"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputText.trim()}
            className="p-2 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl transition-all duration-300 shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <VoiceInput onTranscript={handleVoiceTranscript} placeholder="Or speak: 'make it a light dupatta drape'" />
      </div>
    </div>
  );
}
