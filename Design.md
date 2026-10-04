# Design System & UI/UX Specifications

This document outlines the UI/UX choices, design tokens, styling systems, and accessibility guidelines for the **Indic-Typography Heritage Animator**.

## 1. Visual Theme & Aesthetics

To reflect the luxury and craftsmanship of Indian handlooms, we utilize a **Heritage Dark Theme** characterized by deep charcoal tones, rich gold accents, and subtle glassmorphic elements. The palette draws direct inspiration from Kanchipuram zari, Banarasi silks, and natural Kalamkari dyes.

### Color Palette (CSS OKLCH / HSL Tokens)

```css
:root {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  
  --card: 240 10% 3.9%;
  --card-foreground: 0 0% 98%;
  
  --primary: 43 96% 56%;        /* Rich Zari Gold */
  --primary-foreground: 0 0% 0%;
  
  --secondary: 343 81% 45%;     /* Crimson Silk Red */
  --secondary-foreground: 0 0% 98%;
  
  --accent: 172 70% 36%;        /* Peacock Emerald Teal */
  --accent-foreground: 0 0% 98%;
  
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  
  --border: 240 3.7% 15.9%;
  --ring: 43 96% 56%;
}
```

- **Primary Gold (`#dca034` / `oklch(73% 0.17 76)`):** Mimics the metallic thread used in authentic Zari embroidery. Used for call-to-actions, active outlines, and highlighting key metrics.
- **Crimson Red (`#9c1c44`):** A traditional base dye representing auspicious celebratory silk fabrics.
- **Peacock Teal (`#1c9c86`):** Emphasizes rich heritage motifs, balancing the warm gold/red spectrum.
- **Background Layer:** A layered, extremely dark slate texture (`oklch(15% 0.01 240)`) with smooth CSS radial gradients simulating showroom spotlights.

---

## 2. Typography

We load premium Google Fonts via Next.js to provide clear contrast between editorial elements and telemetry data:
- **Headings & Display:** `Playfair Display` or `Outfit` — A serif font that evokes tradition, craftsmanship, and timelessness.
- **Body & Controls:** `Inter` — High-readability sans-serif font for physical parameter adjustments, logs, and labels.

---

## 3. Layout Grid & Glassmorphism

The interface uses a **three-column hybrid layout** designed to avoid dashboard clutter while presenting dense, high-contrast information:

1. **Left Column (Motif Synthesizer Panel):**
   - Motif prompt input, voice dictation activator, and selection cards for regional presets (Kanchipuram, Banarasi, Kalamkari, Ikat).
   - Fully accessible native form controls with custom `:user-invalid` borders.
2. **Center Column (3D Drape Canvas Sandbox):**
   - Immersive 3D/WebGL simulation viewport rendering the deformed fabric sheet draping on a mannequin.
   - Micro-indicators representing live wind vectors, lighting angles, and texture loading states.
3. **Right Column (Mannequin Physics Controller):**
   - Real-time telemetry dashboard detailing current physical forces (wind velocity, frequency, gravity, material friction, shine).
   - Conversational chat input to modify physics states via Gemini Omni Flash.

### Glassmorphic Card Styles
```css
.glass-panel {
  background: rgba(15, 15, 20, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 160, 52, 0.15);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
}
```

---

## 4. Micro-Animations & Motion States

Using **Framer Motion**, we implement the following micro-interactions:
- **Button Hover States:** Zari Gold buttons scale slightly (`scale: 1.02`), with a glowing amber drop-shadow transition.
- **Texture Swap Fade:** When a new pattern is rendered by Nano Banana 2 Lite, the 3D drape cross-fades the texture utilizing a GLSL blend shader over 600ms, avoiding jarring visual pops.
- **Physics Stream Tick:** Slider handles animate smoothly to new positions when Gemini Omni Flash returns updated parameters.

---

## 5. Accessibility (a11y) & Usability

1. **Contrast Compliance:** All text layers satisfy WCAG AAA standards (minimum 7:1 contrast ratios on backgrounds).
2. **Keyboard Navigation:** The simulation supports hotkeys for wind trigger (Space) and lighting rotation (Arrow keys). All controls are focusable with distinct gold rings.
3. **Screen Reader Support:** Programmatic ARIA states (`aria-live="polite"`, `aria-busy`) are kept in sync with visual states during image generation.
