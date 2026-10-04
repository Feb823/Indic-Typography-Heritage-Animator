import { PatternStyle } from '@/models/types';

/**
 * Returns a high-fidelity tileable SVG representing the requested Indian heritage fabric style.
 * Uses inline SVG data URLs to provide immediate, sub-second renders.
 * Dynamically reacts to custom prompt keywords (colors, motifs) to ensure every generation is unique.
 */
export async function generateMockPattern(style: PatternStyle, prompt: string): Promise<string> {
  const promptLower = prompt.toLowerCase();

  // 1. EXTRACT COLORS FROM PROMPT
  let bg = '#78082c'; // deep crimson default
  let fg = '#FFD700'; // gold zari default
  let accent = '#9c1c44'; // rose accent default

  // Setup default style colors if not overridden
  if (style === 'kanchipuram') {
    bg = '#004754'; // peacock blue
    fg = '#FCE181'; // yellow gold
    accent = '#d93d59'; // vibrant pink contrast
  } else if (style === 'kalamkari') {
    bg = '#c05a3e'; // terracotta rust
    fg = '#cca352'; // warm mustard
    accent = '#7d805c'; // olive dye
  } else if (style === 'ikat') {
    bg = '#0d1b2a'; // dark indigo
    fg = '#cca352'; // mustard
    accent = '#e63946'; // red tie-dye
  }

  // User color overrides
  if (promptLower.includes('white') || promptLower.includes('cream') || promptLower.includes('ivory')) {
    bg = '#fcfbf7';
    fg = '#d4af37';
    accent = '#7a7a7a';
  } else if (promptLower.includes('black') || promptLower.includes('dark charcoal')) {
    bg = '#141416';
    fg = '#ffd700';
    accent = '#e2e8f0';
  } else if (promptLower.includes('maroon') || promptLower.includes('royal maroon') || promptLower.includes('wine')) {
    bg = '#500518';
    fg = '#ffd700';
    accent = '#b8860b';
  } else if (promptLower.includes('red') || promptLower.includes('crimson') || promptLower.includes('scarlet')) {
    bg = '#990000';
    fg = '#ffffff';
    accent = '#ffd700';
  } else if (promptLower.includes('blue') || promptLower.includes('royal blue') || promptLower.includes('navy')) {
    bg = '#0b1b3d';
    fg = '#ffd700';
    accent = '#38bdf8';
  } else if (promptLower.includes('green') || promptLower.includes('emerald') || promptLower.includes('olive')) {
    bg = '#064e3b';
    fg = '#fcd34d';
    accent = '#34d399';
  } else if (promptLower.includes('purple') || promptLower.includes('magenta') || promptLower.includes('violet')) {
    bg = '#3b0764';
    fg = '#f59e0b';
    accent = '#c084fc';
  } else if (promptLower.includes('mustard') || promptLower.includes('yellow') || promptLower.includes('amber')) {
    bg = '#b45309';
    fg = '#fef08a';
    accent = '#78350f';
  }

  // 2. DEFINE SVG MOTIFS & PATHS
  // Elegant lotus path
  const lotusMotif = `
    <g id="customMotif">
      <path d="M 0,15 C -25,-10 -35,5 0,-40 C 35,5 25,-10 0,15 Z" fill="${fg}" />
      <path d="M 0,15 C -35,5 -40,25 -10,-15 C 10,-15 40,5 0,15 Z" fill="${fg}" opacity="0.8" />
      <path d="M 0,15 C -45,20 -25,45 0,10 C 25,45 45,20 0,15 Z" fill="${fg}" opacity="0.6" />
      <circle cx="0" cy="-10" r="4" fill="${accent}" />
    </g>
  `;

  // Elegant peacock path
  const peacockMotif = `
    <g id="customMotif">
      <path d="M -15,10 C -35,5 -45,-20 -25,-35 C -15,-40 0,-25 -15,10 Z" fill="${accent}" opacity="0.75" />
      <path d="M -8,10 C -25,0 -35,-25 -15,-40 C -5,-35 0,-20 -8,10 Z" fill="${fg}" />
      <path d="M 5,-20 C 15,-30 20,-20 15,-10 C 10,0 0,10 -5,20 C -7,25 -15,22 -10,15 C -5,5 0,-10 5,-20 Z" fill="${fg}" />
      <circle cx="17" cy="-32" r="2.5" fill="${accent}" />
    </g>
  `;

  // Elegant elephant path
  const elephantMotif = `
    <g id="customMotif">
      <rect x="-24" y="-18" width="48" height="30" rx="10" fill="${fg}" />
      <circle cx="28" cy="-8" r="12" fill="${fg}" />
      <path d="M 34,-10 Q 46,-16 42,-4 Q 38,4 30,-2" stroke="${fg}" stroke-width="5" fill="none" stroke-linecap="round" />
      <rect x="-20" y="12" width="10" height="15" rx="3" fill="${fg}" />
      <rect x="-6" y="12" width="10" height="15" rx="3" fill="${fg}" />
      <rect x="6" y="12" width="10" height="15" rx="3" fill="${fg}" />
      <rect x="20" y="12" width="10" height="15" rx="3" fill="${fg}" />
      <rect x="-12" y="-20" width="24" height="16" rx="2" fill="${accent}" />
    </g>
  `;

  // Elegant temple gopuram path
  const templeMotif = `
    <g id="customMotif">
      <path d="M 0,-45 L -30,-12 L 30,-12 Z" fill="${fg}" />
      <rect x="-24" y="-12" width="48" height="15" fill="${fg}" />
      <rect x="-32" y="3" width="64" height="10" fill="${accent}" />
      <rect x="-18" y="13" width="36" height="22" fill="${fg}" />
      <path d="M -8,35 L -8,22 Q 0,17 8,22 L 8,35 Z" fill="${bg}" />
    </g>
  `;

  // Divine Krishna feather path
  const krishnaMotif = `
    <g id="customMotif">
      <path d="M 0,10 C -30,-25 0,-65 0,-65 C 0,-65 30,-25 0,10 Z" fill="${accent}" />
      <path d="M 0,0 C -20,-18 0,-48 0,-48 C 0,-48 20,-18 0,0 Z" fill="${fg}" />
      <circle cx="0" cy="-24" r="10" fill="${bg}" />
      <circle cx="0" cy="-24" r="5" fill="#38bdf8" />
    </g>
  `;

  // General default mango buta shape
  const defaultButaMotif = `
    <g id="customMotif">
      <path d="M 20,40 C 20,20 40,10 50,20 C 60,30 45,45 40,55 C 35,65 50,75 40,85 C 30,95 10,85 10,65 C 10,50 20,50 20,40 Z" fill="${fg}" opacity="0.95" />
      <path d="M 23,38 C 23,23 38,15 45,23 C 53,31 40,43 36,51 C 32,59 43,67 35,75 C 27,83 15,75 15,59 C 15,48 23,48 23,38 Z" fill="${accent}" opacity="0.4" />
      <circle cx="30" cy="50" r="3" fill="#ffffff" opacity="0.7" />
    </g>
  `;

  // 3. ASSIGN ACTIVE MOTIF BASED ON USER PROMPT KEYWORDS
  let selectedMotif = defaultButaMotif;
  if (promptLower.includes('peacock') || promptLower.includes('bird')) {
    selectedMotif = peacockMotif;
  } else if (promptLower.includes('lotus') || promptLower.includes('flower') || promptLower.includes('floral')) {
    selectedMotif = lotusMotif;
  } else if (promptLower.includes('elephant')) {
    selectedMotif = elephantMotif;
  } else if (promptLower.includes('temple') || promptLower.includes('gopuram')) {
    selectedMotif = templeMotif;
  } else if (promptLower.includes('krishna') || promptLower.includes('feather') || promptLower.includes('god')) {
    selectedMotif = krishnaMotif;
  } else if (style === 'kanchipuram') {
    selectedMotif = templeMotif; // default to temple Gopuram for Kanchipuram checks
  }

  // 4. CONSTRUCT UNIQUE SVG MARKUP BASED ON STYLE
  let svgContent = '';

  switch (style) {
    case 'banarasi':
      // Banarasi: Metallic gold zari brocade motifs over royal silk weave background
      svgContent = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>${selectedMotif}</defs>
          <rect width="200" height="200" fill="${bg}" />
          <!-- Silk diagonal weave pattern -->
          <pattern id="weave" width="6" height="6" patternUnits="userSpaceOnUse">
            <line x1="0" y1="0" x2="6" y2="6" stroke="${accent}" stroke-width="0.7" opacity="0.4" />
          </pattern>
          <rect width="200" height="200" fill="url(#weave)" />
          <!-- Gold motifs scattered symmetrically -->
          <use href="#customMotif" x="40" y="45" transform="scale(0.75)" />
          <use href="#customMotif" x="140" y="45" transform="scale(0.75)" />
          <use href="#customMotif" x="90" y="145" transform="scale(0.75)" />
        </svg>
      `;
      break;

    case 'kanchipuram':
      // Kanchipuram: Symmetrical silk checks grid with border gold motifs in intersections
      svgContent = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>${selectedMotif}</defs>
          <rect width="200" height="200" fill="${bg}" />
          <!-- Thick bold Kanchipuram borders checks -->
          <g stroke="${accent}" stroke-width="2.5" opacity="0.8">
            <line x1="0" y1="50" x2="200" y2="50" />
            <line x1="0" y1="100" x2="200" y2="100" />
            <line x1="0" y1="150" x2="200" y2="150" />
            <line x1="50" y1="0" x2="50" y2="200" />
            <line x1="100" y1="0" x2="100" y2="200" />
            <line x1="150" y1="0" x2="150" y2="200" />
          </g>
          <!-- Gopurams or peacocks sitting in check boxes center -->
          <use href="#customMotif" x="35" y="30" transform="scale(0.6)" />
          <use href="#customMotif" x="135" y="30" transform="scale(0.6)" />
          <use href="#customMotif" x="85" y="105" transform="scale(0.6)" />
          <use href="#customMotif" x="35" y="180" transform="scale(0.6)" />
          <use href="#customMotif" x="135" y="180" transform="scale(0.6)" />
        </svg>
      `;
      break;

    case 'kalamkari':
      // Kalamkari: Earthy background, black hand-sketched organic vine pathing and foliage
      svgContent = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>${selectedMotif}</defs>
          <rect width="200" height="200" fill="${bg}" />
          <!-- Hand-painted kalamkari natural ink vines -->
          <g fill="none" stroke="#231f20" stroke-width="1.8" stroke-linecap="round">
            <path d="M 0,110 C 60,95 90,130 130,90 C 170,50 190,70 200,60" />
            <path d="M 50,105 C 40,80 70,50 90,60" />
            <path d="M 130,90 C 110,130 150,170 180,160" />
            <!-- Leaf nodes with warm accent colors -->
            <path d="M 55,105 C 50,95 65,85 70,95 C 75,105 60,115 55,105 Z" fill="${fg}" />
            <path d="M 90,60 C 85,50 100,40 105,50 C 110,60 95,70 90,60 Z" fill="${fg}" />
            <path d="M 135,85 C 145,80 155,95 145,100 C 135,105 125,90 135,85 Z" fill="${accent}" />
            <path d="M 170,160 C 160,150 175,140 180,150 C 185,160 170,170 170,160 Z" fill="${accent}" />
          </g>
          <!-- Custom central hand-painted motif -->
          <use href="#customMotif" x="70" y="45" transform="scale(0.8)" />
          <use href="#customMotif" x="140" y="130" transform="scale(0.8)" />
        </svg>
      `;
      break;

    case 'ikat':
      // Ikat: Fuzzy vertical tie-dye bleed blurred diamond grid or zig-zags
      const isZigzag = promptLower.includes('zigzag') || promptLower.includes('wave') || promptLower.includes('zig-zag');
      const ikatGraphic = isZigzag
        ? `
          <g fill="none" stroke="${fg}" stroke-width="4.5" stroke-linecap="round">
            <path d="M 0,20 L 40,60 L 80,20 L 120,60 L 160,20 L 200,60" />
            <path d="M 0,80 L 40,120 L 80,80 L 120,120 L 160,80 L 200,120" stroke="${accent}" />
            <path d="M 0,140 L 40,180 L 80,140 L 120,180 L 160,140 L 200,180" stroke="${fg}" />
          </g>
        `
        : `
          <g fill="${fg}">
            <path d="M 100,20 L 135,55 L 100,90 L 65,55 Z" />
            <path d="M 40,80 L 65,105 L 40,130 L 15,105 Z" />
            <path d="M 160,80 L 185,105 L 160,130 L 135,105 Z" fill="${accent}" />
            <path d="M 100,120 L 135,155 L 100,190 L 65,155 Z" fill="${accent}" />
          </g>
        `;

      svgContent = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="warpBleed">
              <feGaussianBlur stdDeviation="1.0,4.5" />
            </filter>
          </defs>
          <rect width="200" height="200" fill="${bg}" />
          <!-- Blurred geometric graphics matching ikat warp dye effect -->
          <g filter="url(#warpBleed)">
            ${ikatGraphic}
            <circle cx="100" cy="55" r="8" fill="${accent}" opacity="0.6" />
            <circle cx="40" cy="105" r="6" fill="${fg}" opacity="0.6" />
            <circle cx="160" cy="105" r="6" fill="${fg}" opacity="0.6" />
          </g>
        </svg>
      `;
      break;
  }

  // Remove whitespaces to minimize data URI string length
  const cleanedSvg = svgContent.replace(/\s+/g, ' ').trim();
  const base64Svg = Buffer.from(cleanedSvg).toString('base64');
  return `data:image/svg+xml;base64,${base64Svg}`;
}
