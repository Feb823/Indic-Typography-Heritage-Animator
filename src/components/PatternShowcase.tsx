'use client';

import React from 'react';
import { PatternStyle } from '@/models/types';
import { Palette, Sparkles, Wand2 } from 'lucide-react';

interface PatternHistoryItem {
  id: string;
  style: PatternStyle;
  prompt: string;
  patternUrl: string;
}

interface PatternShowcaseProps {
  currentStyle: PatternStyle;
  promptText: string;
  onPromptChange: (text: string) => void;
  onStyleChange: (style: PatternStyle) => void;
  onGeneratePattern: (prompt: string) => Promise<void>;
  history: PatternHistoryItem[];
  onSelectHistoryItem: (item: PatternHistoryItem) => void;
  isGenerating: boolean;
}

export default function PatternShowcase({
  currentStyle,
  promptText,
  onPromptChange,
  onStyleChange,
  onGeneratePattern,
  history,
  onSelectHistoryItem,
  isGenerating,
}: PatternShowcaseProps) {

  const stylePresets = [
    { id: 'banarasi', name: 'Banarasi', desc: 'Metallic gold Zari and deep red silks', color: 'border-red-800 bg-red-950/20 text-red-400' },
    { id: 'kanchipuram', name: 'Kanchipuram', desc: 'Temple borders and checks on teal blue', color: 'border-cyan-800 bg-cyan-950/20 text-cyan-400' },
    { id: 'kalamkari', name: 'Kalamkari', desc: 'Hand-painted foliage & earthy organic dyes', color: 'border-amber-800 bg-amber-950/20 text-amber-400' },
    { id: 'ikat', name: 'Ikat', desc: 'Resist-dyed geometric warp diamonds', color: 'border-indigo-800 bg-indigo-950/20 text-indigo-400' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptText.trim() || isGenerating) return;
    onGeneratePattern(promptText);
  };

  return (
    <div className="flex flex-col bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden glass-panel p-4 gap-4">
      
      {/* Selector Heading */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2 text-yellow-500 font-bold text-sm tracking-wider font-mono">
          <Palette className="w-4 h-4" />
          <span>MOTIF SYNTHESIZER PANEL</span>
        </div>
        <div className="text-[10px] text-zinc-500 font-mono">
          Nano Banana 2 Lite (Image Gen)
        </div>
      </div>

      {/* Preset cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stylePresets.map((preset) => {
          const isActive = currentStyle === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onStyleChange(preset.id as PatternStyle)}
              className={`flex flex-col text-left p-3 rounded-xl border transition-all duration-300 ${
                isActive
                  ? `border-yellow-500 bg-yellow-500/10 shadow-[0_0_12px_rgba(220,160,52,0.15)]`
                  : 'border-zinc-850 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <span className={`text-xs font-bold font-mono mb-1 ${isActive ? 'text-yellow-500' : ''}`}>
                {preset.name}
              </span>
              <span className="text-[10px] text-zinc-500 leading-tight">
                {preset.desc}
              </span>
            </button>
          );
        })}
      </div>

      {/* Motif Prompt input Form */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={promptText}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={`Enter motifs (e.g. "detailed gold peacock bird prints, floral borders")`}
          className="flex-1 px-3 py-2.5 text-xs rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 focus:outline-none focus:border-yellow-500 placeholder-zinc-500 font-sans"
          disabled={isGenerating}
        />
        <button
          type="submit"
          disabled={isGenerating || !promptText.trim()}
          className="px-4 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:bg-zinc-850 disabled:text-zinc-600 text-zinc-950 font-bold rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-1.5 shadow-md shrink-0"
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Wand2 className="w-3.5 h-3.5" />
              <span>Synthesize Fabric</span>
            </>
          )}
        </button>
      </form>

      {/* Generation History Carousel */}
      {history.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-zinc-900 pt-3">
          <div className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 font-mono">
            <Sparkles className="w-3 h-3 text-yellow-600" />
            <span>FABRIC ARCHIVE CAROUSEL (SWAP TEXTURE)</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin">
            {history.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectHistoryItem(item)}
                className="flex items-center gap-2 p-2 border border-zinc-905 bg-zinc-900/20 hover:border-yellow-500/40 rounded-xl shrink-0 text-left transition-all duration-300"
              >
                {/* Micro preview tile */}
                <div
                  style={{ backgroundImage: `url(${item.patternUrl})`, backgroundSize: 'cover' }}
                  className="w-10 h-10 rounded-lg border border-zinc-800"
                />
                <div className="flex flex-col pr-2">
                  <span className="text-[10px] font-bold text-zinc-300 font-mono capitalize leading-tight">
                    {item.style} motif
                  </span>
                  <span className="text-[9px] text-zinc-500 font-sans max-w-[120px] truncate">
                    {item.prompt}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
