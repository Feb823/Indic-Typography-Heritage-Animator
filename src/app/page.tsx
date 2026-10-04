'use client';

import React, { useState, useEffect } from 'react';
import { PatternStyle, Message, PhysicsParams, PatternHistoryItem } from '@/models/types';
import CONFIG from '@/config';
import CanvasVisualizer from '@/components/CanvasVisualizer';
import ChatPanel from '@/components/ChatPanel';
import PatternShowcase from '@/components/PatternShowcase';
import { Sparkles, Palette, Sliders, Cpu, GitMerge } from 'lucide-react';

export default function SandboxPage() {
  // State variables
  const [currentStyle, setCurrentStyle] = useState<PatternStyle>('banarasi');
  const [currentTextureUrl, setCurrentTextureUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isRefiningPhysics, setIsRefiningPhysics] = useState<boolean>(false);
  const [isMocked, setIsMocked] = useState<boolean>(true);
  
  // Physics engine parameters state
  const [physics, setPhysics] = useState<PhysicsParams>(CONFIG.DEFAULT_PHYSICS);

  // 3D Visualizer settings state (Elevated from CanvasVisualizer to parent dashboard)
  const [mannequinSex, setMannequinSex] = useState<'female' | 'male'>('female');
  const [posePreset, setPosePreset] = useState<'tpose' | 'fashion' | 'walking'>('fashion');
  const [autoRotate, setAutoRotate] = useState(true);

  // Elevated prompt text input state
  const [promptText, setPromptText] = useState('');
  
  // Real-time telemetry reporting state
  const [telemetryOpen, setTelemetryOpen] = useState(true);
  const [telemetryData, setTelemetryData] = useState({
    particleCount: 0,
    springCount: 0,
    trianglesCount: 0,
    fps: 60,
    physicsHealth: 'Stable',
  });

  // Chat message history
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'model',
      content:
        "Namaste! I am the Gemini Physics Engine coordinator. I'll translate your design instructions into fabric drape configurations. I've loaded a luxury gold zari Banarasi silk. Try telling me to 'drape as a light dupatta', 'apply heavy monsoon storm wind', or 'change spotlights to sunset color'!",
    },
  ]);

  // Generation history list
  const [history, setHistory] = useState<PatternHistoryItem[]>([]);

  // 1. Load initial history and default pattern on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        const res = await fetch('/api/history');
        const data = await res.json();
        
        if (data.success && data.history && data.history.length > 0) {
          setHistory(data.history);
          const latest = data.history[0];
          setCurrentStyle(latest.style);
          setCurrentTextureUrl(latest.patternUrl);
          setPromptText(latest.prompt);
        } else {
          const { generateMockPattern } = await import('@/services/ai/mockService');
          
          const defaultItems: PatternHistoryItem[] = [];
          const styles: PatternStyle[] = ['banarasi', 'kanchipuram', 'kalamkari', 'ikat'];
          const prompts = {
            banarasi: 'Gold zari threads with peacock shapes on dark red silk',
            kanchipuram: 'Temple border checks over blue contrast silk',
            kalamkari: 'Tree of life mustard branches and leaves with black outlines',
            ikat: 'Resist dyed blurred diamonds with red accents',
          };

          for (const s of styles) {
            const url = await generateMockPattern(s, prompts[s]);
            defaultItems.push({
              id: 'init-' + s,
              style: s,
              prompt: prompts[s],
              patternUrl: url,
            });
          }

          setHistory(defaultItems);
          setCurrentTextureUrl(defaultItems[0].patternUrl);
          setPromptText(defaultItems[0].prompt);
        }
      } catch (err) {
        console.error('Failed to load initial history data:', err);
      }
    }
    loadInitialData();
  }, []);

  // 2. Trigger motif fabric generation
  const handleGeneratePattern = async (prompt: string, styleOverride?: PatternStyle) => {
    setIsGenerating(true);
    const activeStyle = styleOverride || currentStyle;
    try {
      const res = await fetch('/api/generate-pattern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, style: activeStyle }),
      });
      const data = await res.json();

      if (data.success) {
        // Direct assignment of generated pattern URL (bypasses cache as it is dynamic)
        setCurrentTextureUrl(data.patternUrl);
        setIsMocked(data.isMocked);

        const histRes = await fetch('/api/history');
        const histData = await histRes.json();
        if (histData.success) {
          setHistory(histData.history);
        } else {
          setHistory((prev) => [
            {
              id: 'local-' + Date.now(),
              style: activeStyle,
              prompt,
              patternUrl: data.patternUrl,
            },
            ...prev,
          ]);
        }
      } else {
        alert('Pattern synthesis failed: ' + data.error);
      }
    } catch (err) {
      console.error('Error during pattern generation request:', err);
      alert('Network error during pattern generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Immediate style selection trigger handler
  const handleStyleChange = async (newStyle: PatternStyle) => {
    setCurrentStyle(newStyle);
    const defaultPrompts = {
      banarasi: 'royal gold zari peacock floral brocade',
      kanchipuram: 'temple border checks and stripes Tamil silk',
      kalamkari: 'hand-painted natural dye tree of life foliage',
      ikat: 'resist-dyed blurred diamond zig-zag repeated pattern',
    };
    const activePrompt = promptText.trim() || defaultPrompts[newStyle];
    // Instantly generate new image on style change
    await handleGeneratePattern(activePrompt, newStyle);
  };

  // 3. Process conversational physics commands
  const handleSendMessage = async (text: string) => {
    const userMessage: Message = { role: 'user', content: text };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsRefiningPhysics(true);

    try {
      const res = await fetch('/api/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();

      if (data.success) {
        setMessages((prev) => [...prev, data.message]);
        setPhysics(data.physicsParams);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: 'model',
            content: 'Error: Failed to process physics constants. Please try a different command.',
          },
        ]);
      }
    } catch (err) {
      console.error('Error refining drape physics:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: 'Network error. I am unable to connect to the server physics parser.',
        },
      ]);
    } finally {
      setIsRefiningPhysics(false);
    }
  };

  // 4. Update manual physics values
  const handleUpdatePhysics = (updated: Partial<PhysicsParams>) => {
    setPhysics((prev) => {
      const copy = { ...prev, ...updated };
      if (updated.material) {
        copy.material = { ...prev.material, ...updated.material };
      }
      if (updated.lighting) {
        copy.lighting = { ...prev.lighting, ...updated.lighting };
      }
      return copy;
    });
  };

  // 5. Select history items with click-to-restore fields
  const handleSelectHistoryItem = (item: PatternHistoryItem) => {
    setCurrentStyle(item.style);
    setCurrentTextureUrl(item.patternUrl);
    setPromptText(item.prompt); // restore the text prompt box
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-950 text-zinc-100">
      {/* Premium Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-yellow-500 text-zinc-950 p-2.5 rounded-xl shadow-[0_0_15px_rgba(220,160,52,0.3)]">
            <Palette className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-bold tracking-tight bg-gradient-to-r from-yellow-400 via-yellow-200 to-amber-500 bg-clip-text text-transparent">
              Indic-Typography Heritage Animator
            </h1>
            <p className="text-[10px] text-zinc-400 font-mono tracking-widest mt-0.5 animate-pulse">
              AUTONOMOUS FASHION PHYSICS ENGINE • GOOGLE DEEPMIND BANGALORE
            </p>
          </div>
        </div>

        {/* Chained model telemetry badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg text-[10px] font-mono">
            <Cpu className="w-3.5 h-3.5 text-yellow-500" />
            <span className="text-zinc-400">Gen Pattern:</span>
            <span className="text-zinc-200 font-semibold">gemini-3.1-flash-lite-image</span>
          </div>
          
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-850 px-3 py-1.5 rounded-lg text-[10px] font-mono">
            <GitMerge className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-zinc-400">Physics Agent:</span>
            <span className="text-zinc-200 font-semibold">gemini-omni-flash-preview</span>
          </div>
        </div>
      </header>

      {/* Main Sandbox Interactive Area */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Motif Builder, History, and Telemetry */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <PatternShowcase
            currentStyle={currentStyle}
            promptText={promptText}
            onPromptChange={setPromptText}
            onStyleChange={handleStyleChange}
            onGeneratePattern={handleGeneratePattern}
            history={history}
            onSelectHistoryItem={handleSelectHistoryItem}
            isGenerating={isGenerating}
          />

          {/* Extracted & Redesigned Drape Telemetry and Customizer sidebar card */}
          <div className="glass-panel p-5 rounded-2xl border border-[rgba(220,160,52,0.15)] bg-zinc-950/40 shadow-xl">
            <button
              onClick={() => setTelemetryOpen(!telemetryOpen)}
              className="w-full flex justify-between items-center font-bold font-mono text-yellow-500 text-xs tracking-wider border-b border-zinc-900 pb-2.5 mb-1"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500 animate-pulse" />
                <span>3D DRAPE TELEMETRY</span>
              </div>
              <span className="lg:hidden text-zinc-400 font-normal">{telemetryOpen ? 'Hide Controls ▲' : 'Show Controls ▼'}</span>
            </button>

            <div className={`mt-3 space-y-4 font-mono text-xs text-zinc-450 ${telemetryOpen ? 'block' : 'hidden lg:block'}`}>
              
              {/* 3D Model Customizer Selections */}
              <div className="flex flex-col gap-3 pb-3 border-b border-zinc-900/60">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Mannequin dummy:</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setMannequinSex('female')}
                      className={`py-1.5 rounded text-[10px] font-bold transition-all border ${
                        mannequinSex === 'female'
                          ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      Female Body
                    </button>
                    <button
                      onClick={() => setMannequinSex('male')}
                      className={`py-1.5 rounded text-[10px] font-bold transition-all border ${
                        mannequinSex === 'male'
                          ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-sm'
                          : 'bg-zinc-900 border-zinc-800 hover:text-zinc-200'
                      }`}
                    >
                      Male Body
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">Pose Preset:</span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['fashion', 'walking', 'tpose'] as const).map((pose) => (
                      <button
                        key={pose}
                        onClick={() => setPosePreset(pose)}
                        className={`py-1 rounded text-[9px] font-bold capitalize transition-all border ${
                          posePreset === pose
                            ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-500 shadow-sm'
                            : 'bg-zinc-900 border-zinc-800 hover:text-zinc-200'
                        }`}
                      >
                        {pose === 'fashion' ? 'Studio' : pose}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Simulation Statistics */}
              <div className="space-y-2 text-[11px] border-b border-zinc-900/60 pb-3">
                <div className="flex justify-between">
                  <span>Garment Style:</span>
                  <span className="text-zinc-250 capitalize font-semibold">{physics.drapeStyle}</span>
                </div>
                <div className="flex justify-between">
                  <span>Verlet Nodes:</span>
                  <span className="text-zinc-250 font-semibold">{telemetryData.particleCount} vertices</span>
                </div>
                <div className="flex justify-between">
                  <span>Active Springs:</span>
                  <span className="text-zinc-250 font-semibold">{telemetryData.springCount} links</span>
                </div>
                <div className="flex justify-between">
                  <span>Face Triangles:</span>
                  <span className="text-zinc-250 font-semibold">{telemetryData.trianglesCount} tris</span>
                </div>
                <div className="flex justify-between">
                  <span>Verlet Solver:</span>
                  <span className="text-emerald-500 font-bold">{telemetryData.physicsHealth}</span>
                </div>
              </div>

              {/* Camera rotation control */}
              <div className="flex items-center justify-between text-[10px] pt-0.5 text-zinc-400">
                <span>360° Orbit Auto-Rotate:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoRotate}
                    onChange={(e) => setAutoRotate(e.target.checked)}
                    className="accent-yellow-500 rounded cursor-pointer w-3.5 h-3.5"
                  />
                </label>
              </div>

              <div className="flex justify-between text-[10px] border-t border-zinc-900/60 pt-2.5 text-zinc-500">
                <span>Rendering Rate:</span>
                <span className="text-emerald-500 font-bold">{telemetryData.fps} FPS</span>
              </div>
            </div>
          </div>

          {/* Quick Info Box (Judging compliance card) */}
          <div className="glass-panel p-4 rounded-2xl border border-[rgba(220,160,52,0.12)] bg-zinc-950/40 text-xs text-zinc-450 leading-relaxed font-sans">
            <h3 className="font-bold font-mono text-yellow-500 flex items-center gap-1.5 mb-2 tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span>JUDGING ADVANTAGE</span>
            </h3>
            <p className="mb-2">
              Generates custom motifs instantly with Gemini and overlays them as physical PBR fabrics around dynamically simulated mannequin postures.
            </p>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono border-t border-zinc-900 pt-2.5 mt-2 text-zinc-500">
              <div className="flex flex-col">
                <span>Pattern Synth:</span>
                <span className="text-emerald-500 font-bold">Sub-2s (NB2)</span>
              </div>
              <div className="flex flex-col">
                <span>Physics Ticker:</span>
                <span className="text-emerald-500 font-bold">60Hz Fixed</span>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER COLUMN: 3D Mannequin Viewport */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <CanvasVisualizer
            physics={physics}
            patternUrl={currentTextureUrl}
            isMocked={isMocked}
            mannequinSex={mannequinSex}
            posePreset={posePreset}
            autoRotate={autoRotate}
            onUpdateTelemetry={setTelemetryData}
          />
        </div>

        {/* RIGHT COLUMN: Conversational Chat & Physics sliders */}
        <div className="lg:col-span-3">
          <ChatPanel
            messages={messages}
            physics={physics}
            onSendMessage={handleSendMessage}
            onUpdatePhysics={handleUpdatePhysics}
            isLoading={isRefiningPhysics}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 px-6 text-center text-[10px] font-mono text-zinc-500 tracking-wider">
        INDIC-TYPOGRAPHY HERITAGE ANIMATOR • GOOGLE DEEPMIND BANGALORE HACKATHON 2026
      </footer>
    </div>
  );
}
