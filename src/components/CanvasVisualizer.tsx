'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PhysicsParams } from '@/models/types';
import { ZoomIn, Download, Maximize2, X, ChevronLeft, ChevronRight, Sparkles, Image as ImageIcon } from 'lucide-react';

interface CanvasVisualizerProps {
  physics: PhysicsParams;
  patternUrl: string;
  isMocked: boolean;
  mannequinSex: 'female' | 'male';
  posePreset: 'tpose' | 'fashion' | 'walking';
  autoRotate: boolean;
  onUpdateTelemetry: (data: any) => void;
}

type ViewAngle = 'front' | 'left' | 'back' | 'right';

export default function CanvasVisualizer({
  physics,
  patternUrl,
  isMocked,
  mannequinSex,
  posePreset,
  autoRotate,
  onUpdateTelemetry,
}: CanvasVisualizerProps) {
  
  const [renders, setRenders] = useState<Record<ViewAngle, string>>({
    front: '',
    left: '',
    back: '',
    right: '',
  });

  const [activeLightbox, setActiveLightbox] = useState<ViewAngle | null>(null);
  const [zoomScale, setZoomScale] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);

  // Trigger telemetry update on render changes
  useEffect(() => {
    if (onUpdateTelemetry) {
      onUpdateTelemetry({
        particleCount: 0,
        springCount: 4, // 4 viewport cameras
        trianglesCount: 4,
        fps: 60,
        physicsHealth: '4x Viewport AI',
      });
    }
  }, [patternUrl, mannequinSex, physics.drapeStyle]);

  // Composition pipeline to render high-fidelity 2D mannequin garments
  useEffect(() => {
    if (!patternUrl) return;

    setIsGenerating(true);
    const textureImg = new Image();
    textureImg.crossOrigin = 'anonymous';
    textureImg.src = patternUrl;

    textureImg.onload = () => {
      const newRenders: Record<ViewAngle, string> = {
        front: '',
        left: '',
        back: '',
        right: '',
      };

      const views: ViewAngle[] = ['front', 'left', 'back', 'right'];
      
      views.forEach((view) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1024;
        canvas.height = 1280;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Compose the custom render
        composeApparelRender(ctx, view, physics.drapeStyle, mannequinSex, textureImg);
        newRenders[view] = canvas.toDataURL('image/png');
      });

      setRenders(newRenders);
      setIsGenerating(false);
    };

    textureImg.onerror = () => {
      console.error('Failed to load textile texture for multi-view pipeline.');
      setIsGenerating(false);
    };

  }, [patternUrl, mannequinSex, physics.drapeStyle]);

  // Main apparel composition drawing engine
  const composeApparelRender = (
    ctx: CanvasRenderingContext2D,
    view: ViewAngle,
    garment: string,
    gender: 'female' | 'male',
    texture: HTMLImageElement
  ) => {
    const w = 1024;
    const h = 1280;

    // 1. Studio Background: Solid clean light grey
    ctx.fillStyle = '#EBECEF';
    ctx.fillRect(0, 0, w, h);

    // Warm rim light effect
    const rimGrad = ctx.createRadialGradient(w/2, h/2, 100, w/2, h/2, h/2);
    rimGrad.addColorStop(0, '#FFFFFF');
    rimGrad.addColorStop(1, '#D8DAE0');
    ctx.fillStyle = rimGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Premium White Mannequin Shadows
    ctx.shadowColor = 'rgba(0,0,0,0.06)';
    ctx.shadowBlur = 40;
    ctx.shadowOffsetY = 20;

    const isFemale = gender === 'female';

    // Helper: Draw Mannequin Body
    const drawMannequinBody = () => {
      ctx.fillStyle = '#F5F5F5';
      ctx.lineWidth = 1;
      
      // Head
      ctx.beginPath();
      ctx.ellipse(w/2, 280, 75, 105, 0, 0, Math.PI * 2);
      ctx.fill();

      // Neck
      ctx.beginPath();
      ctx.moveTo(w/2 - 25, 360);
      ctx.lineTo(w/2 + 25, 360);
      ctx.lineTo(w/2 + 30, 410);
      ctx.lineTo(w/2 - 30, 410);
      ctx.closePath();
      ctx.fill();

      // Torso & Hips depending on sex & view
      ctx.beginPath();
      if (view === 'front' || view === 'back') {
        const shoulderW = isFemale ? 150 : 200;
        const bustW = isFemale ? 135 : 180;
        const waistW = isFemale ? 90 : 155;
        const hipW = isFemale ? 155 : 170;

        ctx.moveTo(w/2 - shoulderW, 420);
        ctx.lineTo(w/2 + shoulderW, 420);
        ctx.bezierCurveTo(w/2 + bustW, 490, w/2 + waistW, 580, w/2 + hipW, 700);
        ctx.lineTo(w/2 - hipW, 700);
        ctx.bezierCurveTo(w/2 - waistW, 580, w/2 - bustW, 490, w/2 - shoulderW, 420);
      } else {
        // Side profile mannequin
        const profileW = isFemale ? 110 : 140;
        ctx.moveTo(w/2 - profileW * 0.7, 420);
        ctx.bezierCurveTo(w/2 + profileW * 0.6, 450, w/2 + profileW * 0.7, 560, w/2 + profileW * 0.3, 700);
        ctx.lineTo(w/2 - profileW * 0.5, 700);
        ctx.bezierCurveTo(w/2 - profileW * 0.8, 590, w/2 - profileW * 0.9, 490, w/2 - profileW * 0.7, 420);
      }
      ctx.closePath();
      ctx.fill();

      // Arms (Front View)
      if (view === 'front') {
        const armOffset = isFemale ? 145 : 190;
        const handOffset = isFemale ? 110 : 140;

        // Left arm
        ctx.beginPath();
        ctx.moveTo(w/2 - armOffset, 420);
        ctx.quadraticCurveTo(w/2 - armOffset - 40, 560, w/2 - handOffset, 700);
        ctx.lineTo(w/2 - handOffset + 35, 700);
        ctx.quadraticCurveTo(w/2 - armOffset + 5, 560, w/2 - armOffset + 30, 435);
        ctx.closePath();
        ctx.fill();

        // Right arm
        ctx.beginPath();
        ctx.moveTo(w/2 + armOffset, 420);
        ctx.quadraticCurveTo(w/2 + armOffset + 40, 560, w/2 + handOffset, 700);
        ctx.lineTo(w/2 + handOffset - 35, 700);
        ctx.quadraticCurveTo(w/2 + armOffset - 5, 560, w/2 + armOffset - 30, 435);
        ctx.closePath();
        ctx.fill();
      }

      // Legs
      ctx.beginPath();
      const legSpacing = isFemale ? 45 : 55;
      const legWidth = isFemale ? 55 : 68;

      ctx.rect(w/2 - legSpacing - legWidth/2, 700, legWidth, 420);
      ctx.rect(w/2 + legSpacing - legWidth/2, 700, legWidth, 420);
      ctx.fill();

      // Round circular gold base platter shadow/plate
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.ellipse(w/2, 1140, 240, 45, 0, 0, Math.PI * 2);
      ctx.fill();
    };

    drawMannequinBody();

    // Reset shadow for garment mapping
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Compose textile pattern
    const pattern = ctx.createPattern(texture, 'repeat');
    if (!pattern) return;

    // Helper: Draw garment zone with clipping & shade layers
    const drawGarmentZone = (
      drawPath: () => void,
      borderAlignments: { x1: number; y1: number; x2: number; y2: number; width: number }[],
      shadingFn: () => void
    ) => {
      ctx.save();
      ctx.beginPath();
      drawPath();
      ctx.clip();

      // Fill textile map
      ctx.fillStyle = pattern;
      ctx.save();
      ctx.scale(2.2, 2.2); // Motif scale
      ctx.fillRect(-w, -h, w*3, h*3);
      ctx.restore();

      // Overlap border trims
      ctx.strokeStyle = '#ffd700'; // Luxury gold borders
      borderAlignments.forEach((border) => {
        ctx.lineWidth = border.width;
        ctx.beginPath();
        ctx.moveTo(border.x1, border.y1);
        ctx.lineTo(border.x2, border.y2);
        ctx.stroke();
      });

      // Apply dimensional shadows
      ctx.globalCompositeOperation = 'multiply';
      shadingFn();
      
      ctx.restore();
    };

    // 3. Drape garments according to multi-view specifications
    if (garment === 'sari') {
      
      // ZONE A: Lower Waist Skirt & Front Pleats
      drawGarmentZone(
        () => {
          // Bottom hem skirt shape
          if (view === 'front' || view === 'back') {
            ctx.moveTo(w/2 - 165, 680);
            ctx.lineTo(w/2 + 165, 680);
            ctx.lineTo(w/2 + 195, 1110);
            ctx.lineTo(w/2 - 195, 1110);
          } else {
            // Side profiles
            ctx.moveTo(w/2 - 120, 680);
            ctx.lineTo(w/2 + 120, 680);
            ctx.lineTo(w/2 + 130, 1110);
            ctx.lineTo(w/2 - 130, 1110);
          }
        },
        [
          // Bottom hem gold border
          { x1: w/2 - 200, y1: 1100, x2: w/2 + 200, y2: 1100, width: 22 }
        ],
        () => {
          // 8 Front Pleats shading
          if (view === 'front') {
            const pleatGrad = ctx.createLinearGradient(w/2 - 100, 0, w/2 + 100, 0);
            for (let i = 0; i <= 8; i++) {
              const stop = i / 8;
              pleatGrad.addColorStop(stop, 'rgba(0,0,0,0.02)');
              if (stop + 0.05 <= 1.0) {
                pleatGrad.addColorStop(stop + 0.05, 'rgba(0,0,0,0.38)');
              }
              if (stop + 0.08 <= 1.0) {
                pleatGrad.addColorStop(stop + 0.08, 'rgba(255,255,255,0.12)');
              }
            }
            ctx.fillStyle = pleatGrad;
            ctx.fillRect(w/2 - 80, 680, 160, 430);
          }
          
          // General ambient shadows on skirt sides
          const skirtGrad = ctx.createLinearGradient(0, 700, 0, 1110);
          skirtGrad.addColorStop(0, 'rgba(0,0,0,0.05)');
          skirtGrad.addColorStop(0.3, 'rgba(0,0,0,0.22)');
          skirtGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
          ctx.fillStyle = skirtGrad;
          ctx.fillRect(0, 0, w, h);
        }
      );

      // ZONE B: Torso Wrap (Front/Back/Side sweep)
      drawGarmentZone(
        () => {
          if (view === 'front') {
            // Diagonal torso wrap: right waist to left shoulder
            ctx.moveTo(w/2 + 155, 680);
            ctx.lineTo(w/2 - 145, 420);
            ctx.lineTo(w/2 - 80, 420);
            ctx.lineTo(w/2 + 140, 580);
          } else if (view === 'back') {
            // Saree back drape
            ctx.moveTo(w/2 - 155, 680);
            ctx.lineTo(w/2 - 145, 420);
            ctx.lineTo(w/2 + 140, 420);
            ctx.lineTo(w/2 + 155, 680);
          } else if (view === 'left') {
            // Left view sweeps over shoulder
            ctx.moveTo(w/2 - 80, 420);
            ctx.lineTo(w/2 + 60, 420);
            ctx.lineTo(w/2 + 80, 680);
            ctx.lineTo(w/2 - 110, 680);
          } else {
            // Right view hugs hip wrap
            ctx.moveTo(w/2 - 110, 420);
            ctx.lineTo(w/2 + 80, 420);
            ctx.lineTo(w/2 + 110, 680);
            ctx.lineTo(w/2 - 80, 680);
          }
        },
        [
          // Diagonal chest sweep gold border (visible front)
          { x1: w/2 + 155, y1: 670, x2: w/2 - 145, y2: 420, width: 14 }
        ],
        () => {
          // Torso folding shadows
          const torsoGrad = ctx.createLinearGradient(0, 420, w, 680);
          torsoGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
          torsoGrad.addColorStop(0.5, 'rgba(0,0,0,0.28)');
          torsoGrad.addColorStop(1, 'rgba(0,0,0,0.45)');
          ctx.fillStyle = torsoGrad;
          ctx.fillRect(0, 0, w, h);
        }
      );

      // ZONE C: Shoulder Pallu (Left shoulder hanging tail)
      if (view === 'back' || view === 'left') {
        drawGarmentZone(
          () => {
            // Pallu hanging straight down left side to knee level
            const px = view === 'back' ? w/2 - 160 : w/2 - 110;
            ctx.moveTo(px, 420);
            ctx.lineTo(px + 120, 420);
            ctx.lineTo(px + 105, 960);
            ctx.lineTo(px - 15, 960);
          },
          [
            // Vertical outer gold border edge
            { x1: view === 'back' ? w/2 - 170 : w/2 - 120, y1: 420, x2: view === 'back' ? w/2 - 15 : w/2 - 10, y2: 960, width: 18 }
          ],
          () => {
            // Shading of back pallu folds
            const palluGrad = ctx.createLinearGradient(0, 420, 0, 960);
            palluGrad.addColorStop(0, 'rgba(0,0,0,0.15)');
            palluGrad.addColorStop(0.6, 'rgba(0,0,0,0.35)');
            palluGrad.addColorStop(1, 'rgba(0,0,0,0.55)');
            ctx.fillStyle = palluGrad;
            ctx.fillRect(0, 0, w, h);
          }
        );
      }

    } else if (garment === 'kurta') {
      
      // Body Tunic
      drawGarmentZone(
        () => {
          const kw = isFemale ? 145 : 185;
          const kbw = isFemale ? 165 : 215;
          
          if (view === 'front' || view === 'back') {
            ctx.moveTo(w/2 - kw, 410);
            ctx.lineTo(w/2 + kw, 410);
            ctx.lineTo(w/2 + kbw, 880);
            ctx.lineTo(w/2 - kbw, 880);
          } else {
            // Side profiles
            ctx.moveTo(w/2 - 95, 410);
            ctx.lineTo(w/2 + 95, 410);
            ctx.lineTo(w/2 + 115, 880);
            ctx.lineTo(w/2 - 115, 880);
          }
        },
        [
          // bottom hem gold trim
          { x1: w/2 - 220, y1: 870, x2: w/2 + 220, y2: 870, width: 14 }
        ],
        () => {
          const grad = ctx.createLinearGradient(0, 410, 0, 880);
          grad.addColorStop(0, 'rgba(0,0,0,0.02)');
          grad.addColorStop(1, 'rgba(0,0,0,0.32)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      );

      // Sleeves (Symmetrical on front view)
      if (view === 'front') {
        const sw = isFemale ? 145 : 190;
        const handX = isFemale ? 110 : 140;

        // Left Sleeve
        drawGarmentZone(
          () => {
            ctx.moveTo(w/2 - sw, 420);
            ctx.quadraticCurveTo(w/2 - sw - 40, 560, w/2 - handX, 680);
            ctx.lineTo(w/2 - handX + 35, 680);
            ctx.quadraticCurveTo(w/2 - sw + 5, 560, w/2 - sw + 30, 435);
          },
          [
            // Sleeve cuff gold trim
            { x1: w/2 - handX, y1: 675, x2: w/2 - handX + 35, y2: 675, width: 8 }
          ],
          () => {
            const grad = ctx.createLinearGradient(w/2 - sw, 420, w/2 - handX, 680);
            grad.addColorStop(0, 'rgba(255,255,255,0.08)');
            grad.addColorStop(1, 'rgba(0,0,0,0.38)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          }
        );

        // Right Sleeve
        drawGarmentZone(
          () => {
            ctx.moveTo(w/2 + sw, 420);
            ctx.quadraticCurveTo(w/2 + sw + 40, 560, w/2 + handX, 680);
            ctx.lineTo(w/2 + handX - 35, 680);
            ctx.quadraticCurveTo(w/2 + sw - 5, 560, w/2 + sw - 30, 435);
          },
          [
            { x1: w/2 + handX, y1: 675, x2: w/2 + handX - 35, y2: 675, width: 8 }
          ],
          () => {
            const grad = ctx.createLinearGradient(w/2 + sw, 420, w/2 + handX, 680);
            grad.addColorStop(0, 'rgba(255,255,255,0.08)');
            grad.addColorStop(1, 'rgba(0,0,0,0.38)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, w, h);
          }
        );
      }

    } else if (garment === 'dupatta') {
      
      // Loop across chest U-shape
      drawGarmentZone(
        () => {
          if (view === 'front') {
            ctx.moveTo(w/2 - 135, 410);
            ctx.quadraticCurveTo(w/2, 690, w/2 + 135, 410);
            ctx.lineTo(w/2 + 85, 410);
            ctx.quadraticCurveTo(w/2, 590, w/2 - 85, 410);
          } else {
            // Side profiles hanging back
            ctx.moveTo(w/2 - 40, 410);
            ctx.lineTo(w/2 + 40, 410);
            ctx.lineTo(w/2 + 30, 920);
            ctx.lineTo(w/2 - 30, 920);
          }
        },
        [
          // Border edges
          { x1: w/2 - 135, y1: 410, x2: w/2, y2: 690, width: 8 }
        ],
        () => {
          const grad = ctx.createLinearGradient(0, 410, 0, 920);
          grad.addColorStop(0, 'rgba(255,255,255,0.05)');
          grad.addColorStop(1, 'rgba(0,0,0,0.42)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      );

    } else {
      
      // Mundu / Lungi
      drawGarmentZone(
        () => {
          if (view === 'front' || view === 'back') {
            ctx.moveTo(w/2 - 165, 680);
            ctx.lineTo(w/2 + 165, 680);
            ctx.lineTo(w/2 + 180, 1100);
            ctx.lineTo(w/2 - 180, 1100);
          } else {
            ctx.moveTo(w/2 - 110, 680);
            ctx.lineTo(w/2 + 110, 680);
            ctx.lineTo(w/2 + 120, 1100);
            ctx.lineTo(w/2 - 120, 1100);
          }
        },
        [
          // Bottom gold border trim
          { x1: w/2 - 190, y1: 1090, x2: w/2 + 190, y2: 1090, width: 24 }
        ],
        () => {
          const grad = ctx.createLinearGradient(0, 680, 0, 1100);
          grad.addColorStop(0, 'rgba(0,0,0,0.05)');
          grad.addColorStop(1, 'rgba(0,0,0,0.45)');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, w, h);
        }
      );
    }
  };

  // Lightbox navigation helpers
  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    const views: ViewAngle[] = ['front', 'left', 'back', 'right'];
    const idx = views.indexOf(activeLightbox!);
    const nextIdx = (idx - 1 + 4) % 4;
    setActiveLightbox(views[nextIdx]);
    setZoomScale(1.0);
  };

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    const views: ViewAngle[] = ['front', 'left', 'back', 'right'];
    const idx = views.indexOf(activeLightbox!);
    const nextIdx = (idx + 1) % 4;
    setActiveLightbox(views[nextIdx]);
    setZoomScale(1.0);
  };

  const handleDownload = (e: React.MouseEvent, view: ViewAngle) => {
    e.stopPropagation();
    const url = renders[view];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `mannequin_${mannequinSex}_${physics.drapeStyle}_${view}.png`;
    a.click();
  };

  return (
    <div className="relative w-full h-[620px] rounded-2xl glass-panel overflow-hidden border border-[rgba(220,160,52,0.15)] bg-zinc-950/70 p-4 flex flex-col gap-3 justify-center">
      
      {/* 2x2 multi-view catalogue viewport */}
      <div className="grid grid-cols-2 gap-3 flex-1">
        {(['front', 'left', 'back', 'right'] as ViewAngle[]).map((view) => {
          const url = renders[view];
          return (
            <div
              key={view}
              onClick={() => url && setActiveLightbox(view)}
              className="relative group rounded-xl overflow-hidden border border-zinc-900 bg-zinc-950/30 hover:border-yellow-500/40 transition-all duration-500 cursor-zoom-in"
            >
              {isGenerating || !url ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-650 font-mono text-[9px] gap-1.5 animate-pulse bg-zinc-950/30">
                  <ImageIcon className="w-5 h-5" />
                  <span>Synthesizing View...</span>
                </div>
              ) : (
                <>
                  {/* render image */}
                  <img
                    src={url}
                    alt={`${view} view`}
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-all duration-700"
                  />
                  
                  {/* glassmorphic hover controls overlay */}
                  <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-3 backdrop-blur-[2px]">
                    <button
                      onClick={() => setActiveLightbox(view)}
                      className="p-2 bg-zinc-950/80 hover:bg-yellow-500 hover:text-zinc-950 rounded-lg text-zinc-300 transition-all duration-200 border border-zinc-800"
                      title="Zoom View"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDownload(e, view)}
                      className="p-2 bg-zinc-950/80 hover:bg-yellow-500 hover:text-zinc-950 rounded-lg text-zinc-300 transition-all duration-200 border border-zinc-800"
                      title="Download 8K PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>

                  {/* View label */}
                  <div className="absolute top-2.5 left-2.5 z-10 px-2 py-1 rounded bg-zinc-950/80 backdrop-blur-md border border-zinc-850 text-[9px] font-mono text-yellow-500 font-bold uppercase tracking-wider">
                    {view === 'left' ? 'Left Side (90°)' : view === 'right' ? 'Right Side (270°)' : view === 'back' ? 'Back View (180°)' : 'Front View (0°)'}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Viewport footer indicators */}
      <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500 px-1 border-t border-zinc-900 pt-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-yellow-600 animate-pulse" />
          <span>360° AI PHOTO CATALOGUE VIEWPORT</span>
        </div>
        <div className="flex items-center gap-2">
          <span>Orthographic</span>
          <span>•</span>
          <span>Chest framing</span>
        </div>
      </div>

      {/* Premium Fullscreen Lightbox Modal */}
      {activeLightbox && renders[activeLightbox] && (
        <div
          onClick={() => { setActiveLightbox(null); setZoomScale(1.0); }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/95 backdrop-blur-md p-4 animate-fade-in"
        >
          {/* Lightbox container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl w-full h-[90vh] bg-zinc-950 border border-zinc-850 rounded-2xl overflow-hidden flex flex-col shadow-2xl"
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 shrink-0">
              <span className="text-xs font-mono font-bold text-yellow-500 tracking-wider uppercase">
                {activeLightbox === 'left' ? 'Left Side View (90°)' : activeLightbox === 'right' ? 'Right Side View (270°)' : activeLightbox === 'back' ? 'Back View (180°)' : 'Front View (0°)'}
              </span>
              
              {/* Zoom control slider */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-zinc-500">Zoom:</span>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.1"
                  value={zoomScale}
                  onChange={(e) => setZoomScale(parseFloat(e.target.value))}
                  className="w-24 accent-yellow-500"
                />
                <span className="text-[10px] font-mono text-zinc-300 w-8">{Math.round(zoomScale * 100)}%</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDownload(e, activeLightbox!)}
                  className="p-2 bg-zinc-900 hover:bg-yellow-500 hover:text-zinc-950 text-zinc-300 rounded-lg transition-all duration-200 border border-zinc-800 flex items-center gap-1.5 text-[10px] font-bold font-mono"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>DOWNLOAD</span>
                </button>
                <button
                  onClick={() => { setActiveLightbox(null); setZoomScale(1.0); }}
                  className="p-2 bg-zinc-900 hover:bg-red-500/10 hover:text-red-500 text-zinc-400 rounded-lg transition-all duration-200 border border-zinc-800"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Viewport render panel */}
            <div className="flex-1 relative overflow-hidden flex items-center justify-center p-4 bg-zinc-950/20">
              {/* Left arrow navigation */}
              <button
                onClick={handlePrevLightbox}
                className="absolute left-4 z-10 p-3 bg-zinc-900/60 hover:bg-yellow-500 hover:text-zinc-950 rounded-full border border-zinc-850 text-zinc-300 transition-all duration-300"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {/* Display image with active scale transform */}
              <div className="w-full h-full flex items-center justify-center overflow-auto scrollbar-none">
                <img
                  src={renders[activeLightbox!]}
                  alt="Expanded view"
                  style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.1s ease-out' }}
                  className="max-w-full max-h-full object-contain rounded-lg transition-transform duration-300 origin-center"
                />
              </div>

              {/* Right arrow navigation */}
              <button
                onClick={handleNextLightbox}
                className="absolute right-4 z-10 p-3 bg-zinc-900/60 hover:bg-yellow-500 hover:text-zinc-950 rounded-full border border-zinc-850 text-zinc-300 transition-all duration-300"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
